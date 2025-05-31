import binascii
import requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework import generics
from django.middleware.csrf import get_token
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.http import JsonResponse
import json
from django.shortcuts import get_object_or_404

class VerifyTwoFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            code = request.data.get('code')
            user = request.user

            if not user.secret_key:
                return Response({'error': 'Secret key bulunamadı'}, status=400)

            # TOTP kodunu üret ve gelen kodla karşılaştır
            try:
                expected_code = generate_totp(user.secret_key)
                print(expected_code)
            except binascii.Error:
                return Response({'error': 'Secret key formatı hatalı.'}, status=400)

            if code == expected_code:
                return Response({'message': 'Doğrulama başarılı'})
            else:
                return Response({'error': 'Geçersiz kod. Lütfen tekrar deneyin.'}, status=403)

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=500)



class GetQrCode(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user  # Oturum açmış kullanıcıyı al

        # Kullanıcının QR kodu var mı kontrol et
        if user.qr_code:
            return Response({'qr_code_url': user.qr_code})
        else:
            return Response({'error': 'QR kodu bulunamadı'}, status=404)


INTRA_CLIENT_ID = 'u-s4t2ud-3cafa2bbf70d7d822581950d88a0ea056581e80d49919f33c78ecd45b192caa2'
INTRA_CLIENT_SECRET = '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'
REDIRECT_URI = 'http://10.11.244.64/'

class OAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')

        if not code:
            return Response({'error': 'Authorization code is missing'}, status=400)

        # Token alma isteği
        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': INTRA_CLIENT_ID,
            'client_secret': INTRA_CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI,
        }

        response = requests.post(token_url, data=data)
        token_info = response.json()

        if 'access_token' not in token_info:
            return Response({'error': 'Failed to obtain access token', 'details': token_info}, status=400)

        access_token = token_info['access_token']

        # 42 API'den kullanıcı bilgilerini al
        user_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        
        user_info = user_response.json()
        profile_image_url = user_info.get('image', {}).get('link', '')

        # Kullanıcıyı kaydet veya güncelle
        user, created = CustomUser.objects.update_or_create(
            id=user_info['id'],
            defaults={
                'username': user_info['login'],
                'email': user_info.get('email', ''),
                'first_name': user_info.get('first_name', ''),
                'last_name': user_info.get('last_name', ''),
            }
        )

        #ilk kez oluşurken profil fotosunu intradan alır
        if created and profile_image_url:
            user.profile_picture = profile_image_url
            user.save()

        # Parola ayarı yoksa rastgele parola ayarla
        if created:
            user.set_unusable_password()
            user.save()

        user.generate_secret_key()

        # JWT Token oluştur
        refresh = RefreshToken.for_user(user)

        response = Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'isActiveTwoFactor': user.isActiveTwoFactor,
            },
            'message': 'User registered successfully' if created else 'Login successful'
        })

        # Refresh token'ı cookie'ye yaz
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='None'
        )
        response.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite='None'
        )
        response.set_cookie(
            key='username',
            value=user.username,
            httponly=False,
            secure=True,
            samesite='None'
        )
        return response

class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)  # Django CSRF token'ı oluştur
        response = Response({'csrfToken': csrf_token})
        response.set_cookie('csrftoken', csrf_token, httponly=True, secure=True, samesite='None')
        response.headers["Access-Control-Allow-Origin"] = 'https://localhost'
        response.headers["Access-Control-Allow-Credentials"] = 'true'
        return response

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        csrf_token = request.COOKIES.get('csrftoken')  # CSRF token çerezden alınıyor
        if not csrf_token:
            return Response({'error': 'CSRF token missing'}, status=403)
        
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Kullanıcı oluşturuluyor
            user.generate_secret_key()  # Secret key otomatik olarak atanıyor
            return Response({'message': 'User registered successfully'}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=400)

        try:
            user = CustomUser.objects.get(username=username)
            if not user.check_password(password):
                raise AuthenticationFailed("Invalid credentials")
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed("Invalid credentials")
        
        if not user.is_active:
            raise AuthenticationFailed("User account is disabled")

        # JWT Token oluşturma (SimpleJWT kullanarak)
        refresh = RefreshToken.for_user(user)  # Bu, hem refresh hem de access token döner

        response = Response({
            'access': str(refresh.access_token),  # Access token döndürülüyor
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'isActiveTwoFactor': user.isActiveTwoFactor,
                'secretkey': user.secret_key
            },
            'message': 'Login successful'
        })

        response.set_cookie(
            key='refresh',
            value=str(refresh),  # Refresh token cookie'ye yazılır
            httponly=True,
            secure=True,
            samesite='None'
        )
        response.set_cookie(
            key='access',
            value=str(refresh.access_token),  # Refresh token cookie'ye yazılır
            httponly=True,
            secure=True,
            samesite='None'
        )
        response.set_cookie(
            key='username',
            value=user.username,
            httponly=False,
            secure=True,
            samesite='None'
        )
        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.data = {
            'message': 'Logged out successfully'
        }
        response.set_cookie(
            key='refresh',
            value='',
            httponly=True,
            secure=True,
            samesite='None',
            max_age=0  # Cookie süresini sıfır yapar
        )
        response.set_cookie(
            key='access',
            value='',
            httponly=True,
            secure=True,
            samesite='None',
            max_age=0  # Cookie süresini sıfır yapar
        )
        response.set_cookie(
            key='username',
            value='',
            httponly=False,
            secure=True,
            samesite='None'
        )
        return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        serializer = CustomUserSerializer(user)

        # Token'ı sorgula
        token = request.auth  # Gelen JWT token'ı burada
        decoded_payload = dict(token.payload)

        return Response({
            'user_data': serializer.data,
            'token_data': decoded_payload
        })

# class OtherUserProfileView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def get(self, request, username):
#         # Belirtilen kullanıcıyı bul
#         user = get_object_or_404(CustomUser, username=username)
#         serializer = CustomUserSerializer(user)

#         return Response(serializer.data)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')

        if not refresh_token:
            return Response({'error': 'Refresh token not found'}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            refresh.verify()  # Token'ın geçerli olup olmadığını doğrular

            # Yeni access token oluştur
            new_access_token = str(refresh.access_token)

            return Response({
                'access': new_access_token,
                'refresh': str(refresh),
            })
        
        except Exception as e:
            raise AuthenticationFailed('Invalid or expired refresh token')


class SetTwoFactorView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            data = request.data
            enable_2fa = data.get('enable_2fa', None)

            if enable_2fa is None:
                return Response({'error': 'Missing enable_2fa parameter'}, status=400)

            user = request.user

            # 2FA etkinleştiriliyorsa
            if enable_2fa:
                if user.secret_key:
                    user.qr_code = generate_qr_code(user.secret_key, user.username)
                    user.isActiveTwoFactor = True
                    user.save()
                    return Response({
                        'status': 'success',
                        'two_factor_enabled': True,
                        'qr_code_url': user.qr_code
                    })
                else:
                    return Response({'error': 'Secret key not found for user'}, status=404)

            # 2FA devre dışı bırakılıyorsa
            if not enable_2fa:
                user.isActiveTwoFactor = False
                user.save()
                return Response({
                    'status': 'success',
                    'two_factor_enabled': False
                })

            return Response({
                'status': 'success',
                'two_factor_enabled': user.isActiveTwoFactor
            })

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=500)
        

class UploadProfilePictureView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        picture_url = request.data.get('profile_picture')  # URL olarak al
        if not picture_url:
            return Response({"error": "Resim URL'si sağlanmadı."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.profile_picture = picture_url
        user.save()

        serializer = CustomUserSerializer(user, context={'request': request})
        return Response({
            "status": "success",
            "profile_picture": serializer.data['profile_picture']
        }, status=status.HTTP_200_OK)
    
# Bio Güncelleme View
class UpdateBioView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        bio_text = request.data.get('bio')

        if not bio_text:
            return Response({"error": "Bio alanı boş olamaz."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.bio = bio_text
        user.save()

        return Response({
            "status": "success",
            "bio": user.bio
        }, status=status.HTTP_200_OK)

# Profil Bilgilerini Getirme View
class UserBioView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "bio": user.bio
        }, status=status.HTTP_200_OK)


class SearchUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        search_query = request.query_params.get('q')
        if not search_query:
            return Response({"usernames": []}, status=status.HTTP_200_OK)

        users = CustomUser.objects.filter(username__icontains=search_query)
        if not users:
            return Response({"usernames": []}, status=status.HTTP_200_OK)
        usernames = [user.username for user in users]

        return Response({"usernames": usernames}, status=status.HTTP_200_OK)


class VerifyTokenView(APIView):
    """
    Token doğrulama ve kimlik doğrulama için genel bir endpoint.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')

        if not token:
            return Response({'error': 'Token is missing'}, status=400)

        try:
            # Token doğrulama işlemi
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)

            # Kullanıcı bilgilerini döndür
            return Response({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'isActiveTwoFactor': user.isActiveTwoFactor,
                },
                'token_data': validated_token.payload  # Token payload bilgileri
            })

        except AuthenticationFailed as e:
            return Response({'error': 'Invalid or expired token', 'details': str(e)}, status=403)

        except Exception as e:
            return Response({'error': 'Internal Server Error', 'details': str(e)}, status=500)
        
        






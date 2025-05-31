import hmac
import hashlib
import time
import struct
import base64
import qrcode
from io import BytesIO

def generate_totp(secret, interval=30, digits=6):
    # Base32 padding eksikse tamamla
    secret = secret.upper()  # Base32 için büyük harfler kullanılmalı
    missing_padding = len(secret) % 8
    if missing_padding:
        secret += '=' * (8 - missing_padding)

    counter = int(time.time() // interval)
    counter_bytes = struct.pack(">Q", counter)
    key = base64.b32decode(secret, True)
    hmac_digest = hmac.new(key, counter_bytes, hashlib.sha1).digest()

    offset = hmac_digest[-1] & 0x0F
    code = (struct.unpack(">I", hmac_digest[offset:offset + 4])[0] & 0x7FFFFFFF) % (10 ** digits)
    
    return str(code).zfill(digits)

def generate_qr_code(secret_key, username, issuer="MyPongApp"):
    """Google Authenticator için QR kodu üretir."""
    uri = f'otpauth://totp/{issuer}:{username}?secret={secret_key}&issuer={issuer}'
    qr = qrcode.make(uri)
    
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return f"data:image/png;base64,{qr_code_base64}"

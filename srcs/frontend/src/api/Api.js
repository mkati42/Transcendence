import router from "../routing/Router.js";
import { createRequestHandler, getCookie } from "./ApiUtils.js";


let api;

/**
 *
 * @returns {Api}
 */
export const useApi = () => {
  if ( !api ) {
    api = new Api();
  }
  return api;
};

class Api {
  #api;

  constructor() {
    this.#api = createRequestHandler( window.location.origin, this.refreshToken );
  }

  #getHeaders( csrf = true, auth = true ) {
    const headers = { "Content-Type": "application/json" };
    if ( csrf ) {
      headers["X-CSRFToken"] = getCookie( "csrftoken" );
    }
    if ( auth ) {
      headers["Authorization"] = `Bearer ${localStorage.getItem( "access" )}`;
    }
    return headers;
  }

  /****************************************************/
  /*                                                  */
  /*                      Auth                        */
  /*                                                  */
  /****************************************************/

  async register( username, email, password ) {
    return this.#api
      .post( "/api/users/register/" )
      .withBody( { username, email, password } )
      .withHeaders( this.#getHeaders( true, false ) )
      .send();
  }
  async login( username, password ) {
    return new Promise( async ( resolve, reject ) => {
      const response = await this.#api
        .post( "/api/users/login/" )
        .withBody( { username, password } )
        .withHeaders( this.#getHeaders( true, false ) )
        .send();

      if ( response ) {
        localStorage.setItem( "access", response.access );
        localStorage.setItem( "refresh", response.refresh );
        resolve( response );
      } else {
        reject( response );
      }
    } )
  }

  async refreshToken() {
    return new Promise( async ( resolve, reject ) => {
      const response = await this.#api
        .post( "/api/users/refresh/" )
        .withBody( { refresh: localStorage.getItem( "refresh" ) } )
        .withHeaders( this.#getHeaders( true, false ) )
        .send();

      if ( response ) {
        localStorage.setItem( "access", response.access );
        resolve( response );
      } else {
        reject( response );
      }
    } )
  }

  async logout() {
    return this.#api
      .post( "/api/users/logout/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async oAuthLogin( code ) {
    return this.#api
      .post( `/api/users/login42/` )
      .withBody( { code } )
      .withHeaders( this.#getHeaders( true, false ) )
      .send();
  }

  async getCSRFToken() {
    return this.#api
      .get( "/api/users/get-csrf-token/" )
      .withHeaders( this.#getHeaders( false, false ) )
      .send();
  }

  async set2FA( state ) {
    return this.#api
      .post( "/api/users/setTwoFactor/" )
      .withHeaders( this.#getHeaders() )
      .withBody( { enable_2fa: state } )
      .send();
  }

  async get2FAQR() {
    return this.#api
      .get( "/api/users/getQrCodeImage/" )
      .withHeaders( this.#getHeaders( false ) )
      .send();
  }

  async verify2FA( code ) {
    return this.#api
      .post( "/api/users/verifyTwoFactor/" )
      .withHeaders( this.#getHeaders() )
      .withBody( { code } )
      .send();
  }

  async verifyToken() {
    const headers = this.#getHeaders();
    return this.#api
      .post( "/api/users/verify-token/" )
      .withHeaders( headers )
      .withBody( { token: headers["Authorization"]?.split( " " ).pop() } )
      .send();
  }

  /****************************************************/
  /*                                                  */
  /*                     Profile                      */
  /*                                                  */
  /****************************************************/

  async getProfile() {
    return this.#api
      .get( "/api/users/profile/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async searchUser( searchKey ) {
    return this.#api
      .get( "/api/users/search-username/?q=" + searchKey )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getUserBio() {
    return this.#api
      .get( "/api/users/user-bio/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async updateUserBio( bio ) {
    return this.#api
      .post( "/api/users/update-bio/" )
      .withHeaders( this.#getHeaders() )
      .withBody( { bio } )
      .send();
  }

  async uploadProfilePicture( file ) {
    const formData = new FormData();
    formData.append( "profile_picture", file );
    return this.#api
      .post( "/api/users/upload-profile-pic/" )
      .withHeaders( this.#getHeaders() )
      .withBody( formData )
      .send();
  }

  /****************************************************/
  /*                                                  */
  /*                     Social                       */
  /*                                                  */
  /****************************************************/

  /* Friend */

  async sendFriendRequest( toUsername ) {
    return this.#api
      .post( "/api/social/friend/request/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async acceptFriendRequest( toUsername ) {
    return this.#api
      .patch( "/api/social/friend/accept/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async cancelFriendRequest( toUsername ) {
    return this.#api
      .delete( "/api/social/friend/cancel/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async declineFriendRequest( toUsername ) {
    return this.#api
      .delete( "/api/social/friend/delete/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /* Lists of Friend Requests */
  async getFriendsList() {
    return this.#api
      .get( "/api/social/friend/list-friends/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getSentRequestsList() {
    return this.#api
      .get( "/api/social/friend/sent-requests/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getReceivedRequestsList() {
    return this.#api
      .get( "/api/social/friend/received-requests/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getAllRequestsList() {
    return this.#api
      .get( "/api/social/friend/all-requests/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /* Follow */

  async followUser( toUsername ) {
    return this.#api
      .post( "/api/social/follow/request/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async unfollowUser( toUsername ) {
    return this.#api
      .post( "/api/social/follow/unfollow/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /* Lists of Follows */
  async getFollowingList() {
    return this.#api
      .get( "/api/social/follow/followings/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getFollowersList() {
    return this.#api
      .get( "/api/social/follow/followers/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /* Block */

  async blockUser( toUsername ) {
    return this.#api
      .post( "/api/social/block/block/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async unblockUser( toUsername ) {
    return this.#api
      .post( "/api/social/block/unblock/" )
      .withBody( { target_name: toUsername } )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /* Lists of Blocks */
  async getBlockedUsersList() {
    return this.#api
      .get( "/api/social/block/blocked-users/" )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  /****************************************************/
  /*                                                  */
  /*                     Dashboard                    */
  /*                                                  */
  /****************************************************/

  async getGameStats( game_id ) {
    return this.#api
      .get( "/api/dashboard/get_game_stats/?game_id=" + game_id )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  async getUserProfileStats( username ) {
    return this.#api
      .get( "/api/dashboard/get_user_profile_stats/?username=" + username )
      .withHeaders( this.#getHeaders() )
      .send();
  }

  // TODO: GameRequest 
  // ws/gamerequest/<str:token>/  

}

setInterval( async () => {
  try {
    await api.refreshToken();
  } catch ( error ) {
    console.error( error );
  }
}, 1000 * 60 * 12 );

function csrfSafeMethod( method ) {
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test( method );
}

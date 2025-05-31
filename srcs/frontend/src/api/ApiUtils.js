export function createRequestHandler( baseUrl ) {
  if ( !baseUrl ) {
    throw new Error( 'baseUrl is required' );
  }

  async function handleResponse( response, requestBuilder, recursionCount = 0, ) {
    if ( !response.ok ) {
      if ( response.status === 401 ) {
      
        if ( recursionCount >= 1 ) {
          setCookie( 'access', '', 0 );
          setCookie( 'refresh', '', 0 );
          return;
        }
        // Recreate the request instead of recursively calling send
        return fetch( requestBuilder.url, {
          method: requestBuilder.method,
          headers: requestBuilder.headers,
          body: requestBuilder.body ? JSON.stringify( requestBuilder.body ) : null,
          credentials: 'include',
        } )
          .then( ( newResponse ) =>
            handleResponse( newResponse, requestBuilder, recursionCount + 1 )
          )
          .catch( ( err ) => {
            throw err;
          } );
      }
      const error = await response.text();
      throw new Error( `HTTP Error: ${response.status} - ${error}` );
    }
    return response.json();
  }

  class RequestBuilder {
    method;
    url;
    headers;
    body;

    constructor( method, endpoint ) {
      this.method = method;
      this.url = new URL( endpoint, baseUrl );
    }

    withHeaders( headers ) {
      this.headers = headers;
      return this;
    }

    withParams( params ) {
      this.url.search = new URLSearchParams( params );
      return this;
    }

    withBody( body ) {
      this.body = body;
      return this;
    }

    async send() {
      try {
        const response = await fetch( this.url, {
          method: this.method,
          headers: this.headers,
          body: this.body ? JSON.stringify( this.body ) : null,
          credentials: 'include',
        } );
        return handleResponse( response, this );
      } catch ( err ) {
        throw err;
      }
    }
  }

  return {
    get( endpoint ) {
      return new RequestBuilder( 'GET', endpoint );
    },
    post( endpoint ) {
      return new RequestBuilder( 'POST', endpoint );
    },
    patch( endpoint ) {
      return new RequestBuilder( 'PATCH', endpoint );
    },
    put( endpoint ) {
      return new RequestBuilder( 'PUT', endpoint );
    },
    delete( endpoint ) {
      return new RequestBuilder( 'DELETE', endpoint );
    },
  };
}

export function getCookie( name ) {
  const value = `; ${document.cookie}`;
  const parts = value.split( `; ${name}=` );
  if ( parts.length === 2 ) return parts.pop().split( ';' ).shift();
}

export function setCookie( name, value, days ) {
  let expires = '';
  if ( days ) {
    const date = new Date();
    date.setTime( date.getTime() + days * 24 * 60 * 60 * 1000 );
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

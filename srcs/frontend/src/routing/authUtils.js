import { useApi } from "../api/Api.js";

export function requireAuth( router, routeHandler ) {
  return async () => {
    const api = useApi();

    const token = localStorage.getItem( "access" );
    if ( !token || token === "undefined" || token === "null" || token === "" ) {
      router.navigate( "/login" );
      return;
    }
    try {
      const res = await api.verifyToken();
      if ( !res || res.error ) {
        alert( "Your session has expired or is invalid. Please log in again." );
        router.navigate( "/login" );
        return;
      }
    } catch ( error ) {
      console.error( "Token verification failed:", error );
      alert( "You must be logged in to access this page." );
      router.navigate( "/login" );
      return;
    }

    routeHandler();
  };
}

export function requireNonAuth( router, routeHandler ) {
  return async () => {
    const token = localStorage.getItem( "access" );
    if ( token  ) {
      try {
        const api = useApi();
        const res = await api.verifyToken();
        if ( !res || res.error ) {
          localStorage.removeItem( "access" );
          throw new Error( "Invalid token" );
        }
      } catch ( error ) {a
        console.error( "Token verification failed:", error );
        localStorage.removeItem( "access" );
      }
      alert( "You are already logged in." );
      router.navigate( "/" );
      return;
    }

    routeHandler();
  };
}
import { gamePage } from "../pages/game/game.js";
import { gamePageOffline } from "../pages/game/gameOffline.js";
import { onlinePong } from "../pages/game/PongOnline.js";
import { tournamentPage } from "../pages/game/tournament.js";
import { tournamentPlayPage } from "../pages/game/tournamentManager.js";
import { homePage } from "../pages/home.js";
import { loginPage } from "../pages/login.js";
import { profilePage } from "../pages/profile.js";
import { useApi } from "./api/Api.js";
import { getCookie } from "./api/ApiUtils.js";
import { EventSystem } from "./api/EventSystem.js";
import { requireAuth, requireNonAuth } from "./routing/authUtils.js";
import router from "./routing/Router.js";

export class App extends HTMLElement {
  #router;

  constructor() {
    super();
    async function init() {
      const response = await fetch( `/api/users/get-csrf-token/`, {
        method: "GET",
        credentials: "include",
      } );
    
      const code = new URLSearchParams( window.location.search ).get( "code" );
    
      if ( code ) {
        const response = await fetch( `/api/users/login42/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie( "csrftoken" ),
          },
          body: JSON.stringify( { code } ),
        } );
        if ( response.ok ) {
          const data = await response.json();
          localStorage.setItem( "access", data.access );
          localStorage.setItem( "refresh", data.refresh );
          router.navigate( "/" );
        }
      }
    
      if ( !response.ok ) {
        const error = await response.text();
        throw new Error( `HTTP Error: ${response.status} - ${error}` );
      }
      return response.json();
    }
    init().then( () => {
      this.api = useApi();
      this.#router = router;
      this.#initialize().then( () => {
        this.#router.selfNavigate();
      } );
    } );
  }

  async #initialize() {
    this.#setupRoutes();

    this.#setupEvents();
  }

  #setupRoutes() {

    this.#router.addRoute( "/", requireAuth( this.#router, async () => {
      this.innerHTML = "";
      this.appendChild( await homePage() );
    } ) );

    this.#router.addRoute( "/login", requireNonAuth( this.#router, async () => {
      this.innerHTML = "";
      this.appendChild( await loginPage() );
    } ) );

    this.#router.addRoute( "/game-offline", () => {
      this.innerHTML = "";
      this.appendChild( gamePageOffline( true ) );
    } );

    this.#router.addRoute( "/tournament", async () => {
      this.innerHTML = "";
      this.appendChild( tournamentPage() );
    } );

    this.#router.addRoute( "/tournament-play", async () => {
      this.innerHTML = "";
      this.appendChild( tournamentPlayPage() );
    } );

    this.#router.addRoute( "/profile", requireAuth( this.#router, async () => {
      this.innerHTML = "";
      this.appendChild( await profilePage() );
    } ) );

    this.#router.addRoute( "/game-online", async () => {
      this.innerHTML = "";
      this.appendChild( await onlinePong() );
    } );

  }

  #setupEvents() {
    EventSystem.on( "login-form-submit", async ( { username, password } ) => {
      try {
        const response = await useApi().login( username, password );
        this.#router.navigate( "/" );
      } catch ( err ) {
        console.error( "Login failed:", err );
      }
    } );

    EventSystem.on( "register-form-submit", async ( { username, email, password } ) => {
      try {
        const response = await useApi().register( username, email, password );

        this.#router.navigate( "/login" );
      } catch ( err ) {
        console.error( "Login failed:", err );
      }
    } );

    EventSystem.on( "ecole42-auth-click", () => {
      useApi().ecole42Auth();
    } );
  }
}

customElements.define( "ft-transcendence", App );

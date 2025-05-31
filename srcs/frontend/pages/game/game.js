import router from "../../src/routing/Router.js";

export async function gamePage() {

  const container = document.createElement( "div" );
  container.className = "game-page-container";

  const title = document.createElement( "h1" );
  title.textContent = "Multiplayer Pong";
  container.appendChild( title );

  const offlineGameButton = document.createElement( "button" );
  offlineGameButton.onclick = () => {
    router.navigate( "/game-offline" );
  }

  offlineGameButton.textContent = "Play Offline";
  container.appendChild( offlineGameButton );

  return container;
}

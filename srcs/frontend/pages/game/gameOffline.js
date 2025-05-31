import { PongGameOffline } from "./PongOffline.js";

export function gamePageOffline() {
  const container = document.createElement( "div" );
  const game = new PongGameOffline();

  container.appendChild( game.canvas );

  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  return container;
}
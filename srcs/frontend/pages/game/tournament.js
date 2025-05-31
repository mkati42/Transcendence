import router from "../../src/routing/Router.js";
import { initializeSingleEliminationBracket } from "./util.js";

export function tournamentPage() {

  const container = document.createElement( "div" );
  container.classList.add( "container", "mt-4" );

  const title = document.createElement( "h2" );
  title.textContent = "Tournament Page";
  title.classList.add( "text-center", "mb-4" );
  container.appendChild( title );

  const tournament = restoreLocalTournament() ?? {
    players: [],
    matches: [],
    winner: null,
  };

  function playerLiElement( playerName ) {
    const containerDiv = document.createElement( "div" );
    containerDiv.classList.add( "d-flex", "align-items-center", "mb-2" );

    const playerLi = document.createElement( "li" );
    playerLi.textContent = playerName;
    playerLi.classList.add( "list-group-item", "list-group-item-action", "flex-grow-1" );

    const removeButton = document.createElement( "button" );
    removeButton.textContent = "Remove";
    removeButton.classList.add( "btn", "btn-danger", "ms-2" );
    removeButton.addEventListener( "click", () => {
      containerDiv.remove();
      tournament.players = tournament.players.filter( player => player !== playerName );
      saveLocalTournament( tournament );
    } );

    containerDiv.appendChild( playerLi );
    containerDiv.appendChild( removeButton );
    return containerDiv;
  }

  const playerInput = document.createElement( "input" );
  playerInput.placeholder = "Enter Player Name";
  playerInput.classList.add( "form-control", "mb-2" );

  const addPlayerButton = document.createElement( "button" );
  addPlayerButton.textContent = "Add Player";
  addPlayerButton.classList.add( "btn", "btn-primary", "mb-3" );

  const startButton = document.createElement( "button" );
  startButton.innerHTML = `<?xml version="1.0" encoding="utf-8"?><svg width="40" height="40" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M426.353 45.894c-8.969.095-19.91 4.567-31.41 9.43-25.134 10.628-30.824 23.015-37.95 37.133 8.482 4.036 15.74 10.27 21.727 17.762 8.672 10.848 15.098 24.363 20.451 39.345 9.563 26.764 15.67 58.434 21.848 88.18l28.812 3.615s38.02-28.257 40.22-47.99c.65-5.84-9.27-14.992-9.27-14.992s5.937-6.614 4.83-11.323c-1.252-5.326-10.38-14.755-10.38-14.755s2.699-6.325.099-10.178c-3.468-5.14-18.98-8.572-18.98-8.572-1.734-1.69-1.576-8.596-.006-10.287 0 0 14.776-12.887 10.903-17.684-7.036-8.714-18.633-19.625-18.633-19.625-.26-30.99-9.153-40.198-22.261-40.059zm-102.4 58.86c-47.7.281-69.23 71.742-94.848 86.466-43.488 23.83-109.511-11.463-145.203 22.045-36.712 34.467-47.593 68.766-32.047 135.63L32.918 405.23c-7.483 37.268-14.09 30.759-9.463 60.877 38.011-.97 75.93-1.63 113.888 0l2.664-16.361-26.021-16.215c2.142-13.369 6.033-31.024 20.459-51.959 14.426-20.934 21.727-36.387 21.836-48.713l17.998.158c-.155 17.545-8.409 34.347-18.783 50.23 47.235 15.354 119.223 7.67 173.01-47-9.46-29.17-21.687-58.052-37.315-79.72l14.598-10.53c35.673 51.447 55.01 132.403 65.963 186.274-6.292 2.041-11.578 3.946-17.47 6.602.338 9.09 1.043 18.16 1.65 27.234 31.173-2.124 62.215-.722 93.612 0 17.246-68.035-10.26-117.857-38.76-187.59-20.847-73.492-18.395-161.324-74.122-172.496-4.437-.89-8.667-1.291-12.71-1.267zm10.12 249.748c-5.42 5.297-12.046 10.358-19.609 15.297-5.077 3.315-10.599 6.528-16.472 9.584L284.37 442.32l-10.905 4.906-1.091 18.881h65.113l-1.73-38.625 14.767-6.658c-4.007-18.973-9.748-42.998-16.451-66.322zm-186.929 42.72l15.645 68.885h92.91l-1.543-18.615-24.672-5.783-4.56-38.51c-26.065 3.93-53.18 3.051-77.78-5.977z"/></svg>`
  startButton.classList.add( "btn", "btn-success", "mt-3" );

  const playerList = document.createElement( "ul" );
  playerList.classList.add( "list-group", "mb-3" );
  playerList.append( ...tournament.players.map( playerLiElement ) );

  const row = document.createElement( "div" );
  row.classList.add( "row", "mb-3" );
  container.appendChild( row );

  const col = document.createElement( "div" );
  col.classList.add( "col-sm-12", "col-md-6", "col-lg-4", "mx-auto" );
  row.appendChild( col );

  col.appendChild( playerInput );
  col.appendChild( addPlayerButton );

  const listRow = document.createElement( "div" );
  listRow.classList.add( "row" );
  container.appendChild( listRow );

  const listCol = document.createElement( "div" );
  listCol.classList.add( "col-sm-12", "col-md-8", "col-lg-6", "mx-auto" );
  listRow.appendChild( listCol );

  listCol.appendChild( playerList );

  const startRow = document.createElement( "div" );
  startRow.classList.add( "row" );
  container.appendChild( startRow );

  const startCol = document.createElement( "div" );
  startCol.classList.add( "col-sm-12", "col-md-8", "col-lg-6", "mx-auto", "text-center" );
  startRow.appendChild( startCol );

  startCol.appendChild( startButton );

  addPlayerButton.addEventListener( "click", () => {
    if ( !playerInput.value ) {
      alert( "Please enter a player name" );
      return;
    }
    if ( tournament.players.includes( playerInput.value ) ) {
      alert( `Player "${playerInput.value}" already added` );
      return;
    }
    tournament.players.push( playerInput.value );
    playerList.innerHTML = "";
    playerList.append( ...tournament.players.map( playerLiElement ) );
    playerInput.value = "";
    initializeSingleEliminationBracket( tournament );
    saveLocalTournament( tournament );
  } );

  startButton.addEventListener( "click", () => {
    initializeSingleEliminationBracket( tournament );
    router.navigate( "/tournament-play" );
  } );

  return container;
}

function saveLocalTournament( tournament ) {
  localStorage.setItem( "tournament", JSON.stringify( tournament ) );
}

function restoreLocalTournament() {
  const tournament = localStorage.getItem( "tournament" );
  if ( tournament ) {
    return JSON.parse( tournament );
  }
  return null;
}

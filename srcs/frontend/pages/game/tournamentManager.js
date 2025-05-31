import router from "../../src/routing/Router.js";
import { PongGameOffline } from "./PongOffline.js";

export function tournamentPlayPage() {
  const tournament = restoreLocalTournament();
  if ( !tournament || !tournament.rounds || tournament.rounds.length === 0 ) {
    return createErrorView( "No bracket found. Please create a tournament first." );
  }

  if ( typeof tournament.currentRoundIndex !== "number" ) {
    tournament.currentRoundIndex = 0;
  }
  if ( typeof tournament.currentMatchIndex !== "number" ) {
    tournament.currentMatchIndex = 0;
  }

  const container = document.createElement( "div" );
  container.classList.add( "container", "mt-4" );

  const heading = document.createElement( "h2" );
  heading.textContent = "Last-Man-Standing";
  heading.classList.add( "text-center", "mb-4" );
  container.appendChild( heading );

  const row = document.createElement( "div" );
  row.classList.add( "row" );
  container.appendChild( row );

  const leftCol = document.createElement( "div" );
  leftCol.classList.add( "col-md-3" );
  row.appendChild( leftCol );

  const rightCol = document.createElement( "div" );
  rightCol.classList.add( "col-md-9" );
  row.appendChild( rightCol );

  const bracketDiv = buildBracketView( tournament );
  leftCol.appendChild( bracketDiv );

  const matchContainer = document.createElement( "div" );
  matchContainer.classList.add( "border", "p-2" );
  rightCol.appendChild( matchContainer );

  const { currentRoundIndex, currentMatchIndex } = tournament;
  const currentRound = tournament.rounds[currentRoundIndex];

  if ( currentRoundIndex >= tournament.rounds.length ) {
    matchContainer.innerHTML = "<h3>All matches complete!</h3>";
    return container;
  }

  if ( currentMatchIndex >= currentRound.length ) {
    if ( currentRoundIndex < tournament.rounds.length - 1 ) {
      generateNextRound( tournament );
      saveLocalTournament( tournament );
      return reloadPlayPage( container );
    } else {
      matchContainer.innerHTML = `<h3>Champion: ${findFinalWinner( tournament )}</h3>`;
      return container;
    }
  }

  const match = currentRound[currentMatchIndex];
  if ( !match ) {
    matchContainer.innerHTML = "<p>No match data found.</p>";
    return container;
  }

  if ( !match.player2 ) {
    match.winner = match.player1;
    saveLocalTournament( tournament );
    matchContainer.innerHTML = `<p><strong>${match.player1}</strong> advanced automatically (no opponent).</p>`;
    const nextMatchBtn = document.createElement( "button" );
    nextMatchBtn.classList.add( "btn", "btn-primary", "mt-2" );
    nextMatchBtn.textContent = "Start Next Match";
    nextMatchBtn.addEventListener( "click", () => {
      tournament.currentMatchIndex++;
      saveLocalTournament( tournament );
      reloadPlayPage( container );
    } );
    matchContainer.appendChild( nextMatchBtn );

    return container;
  }

  const info = document.createElement( "h4" );
  info.textContent = `Round #${currentRoundIndex + 1}, Match #${currentMatchIndex + 1}`;
  matchContainer.appendChild( info );

  const playersInfo = document.createElement( "p" );
  playersInfo.textContent = `${match.player1} vs. ${match.player2}`;
  matchContainer.appendChild( playersInfo );

  const startBtn = document.createElement( "button" );
  startBtn.classList.add( "btn", "btn-success" );
  startBtn.textContent = "Start This Match";
  matchContainer.appendChild( startBtn );

  const pongArea = document.createElement( "div" );
  pongArea.classList.add( "mt-3" );
  matchContainer.appendChild( pongArea );

  startBtn.addEventListener( "click", () => {
    if ( pongArea.hasChildNodes() ) return;

    const game = new PongGameOffline(
      {
        canvasWidth: 900,
        canvasHeight: 450,
        leftPaddleColor: "white",
        rightPaddleColor: "white",
        winningScore: 3
      },
      ( winnerSide ) => {
        const winnerName = winnerSide === "left" ? match.player1 : match.player2;
        match.winner = winnerName;
        saveLocalTournament( tournament );

        const winnerMsg = document.createElement( "p" );
        winnerMsg.innerHTML = `<strong style="color:gold;">Winner: ${winnerName}</strong>`;
        matchContainer.appendChild( winnerMsg );

        const nextMatchBtn = document.createElement( "button" );
        nextMatchBtn.classList.add( "btn", "btn-primary", "mt-2", "me-2" );
        nextMatchBtn.textContent = "Start Next Match";
        nextMatchBtn.addEventListener( "click", () => {
          tournament.currentMatchIndex++;
          saveLocalTournament( tournament );
          reloadPlayPage( container );
        } );
        matchContainer.appendChild( nextMatchBtn );
      }
    );

    pongArea.appendChild( game.getCanvas() );
    game.startGame();
  } );

  return container;
}

function buildBracketView( tournament ) {
  const bracketDiv = document.createElement( "div" );

  const title = document.createElement( "h4" );
  title.textContent = "Game History";
  bracketDiv.appendChild( title );

  tournament.rounds.forEach( ( matches, roundIndex ) => {
    const roundHeading = document.createElement( "h5" );
    roundHeading.textContent = `Round #${roundIndex + 1}`;
    bracketDiv.appendChild( roundHeading );

    const ul = document.createElement( "ul" );
    ul.classList.add( "list-group", "mb-3" );

    matches.forEach( ( m, matchIndex ) => {
      const li = document.createElement( "li" );
      li.classList.add( "list-group-item", "mb-2", "d-flex", "justify-content-between" );

      const pairText = m.player2
        ? `${m.player1} vs. ${m.player2}`
        : `${m.player1} (BYE)`;

      li.textContent = `Match #${matchIndex + 1}: ${pairText}`;

      if ( m.winner ) {
        let winnerSpan = document.createElement( "span" );
        winnerSpan.textContent = `Winner: ${m.winner}`;
        winnerSpan.style.border = "2px solid gold";
        winnerSpan.style.padding = "2px 4px";
        winnerSpan.style.marginLeft = "10px";
        li.appendChild( winnerSpan );
      }

      if (
        roundIndex === tournament.currentRoundIndex &&
        matchIndex === tournament.currentMatchIndex &&
        !m.winner
      ) {
        li.classList.add( "list-group-item-warning" );
      }

      ul.appendChild( li );
    } );

    bracketDiv.appendChild( ul );
  } );

  return bracketDiv;
}

function createErrorView( message ) {
  const div = document.createElement( "div" );
  div.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  return div;
}

function generateNextRound( tournament ) {
  const r = tournament.currentRoundIndex;
  const currentRound = tournament.rounds[r];

  const nextRound = tournament.rounds[r + 1];

  let winnerIndex = 0;
  for ( let i = 0; i < currentRound.length; i += 2 ) {
    const match1 = currentRound[i];
    const match2 = currentRound[i + 1];

    let player1 = match1 && match1.winner ? match1.winner : null;
    let player2 = match2 && match2.winner ? match2.winner : null;

    nextRound[winnerIndex].player1 = player1;
    nextRound[winnerIndex].player2 = player2;
    nextRound[winnerIndex].winner = null;

    winnerIndex++;
  }

  tournament.currentRoundIndex++;
  tournament.currentMatchIndex = 0;
}

function findFinalWinner( tournament ) {
  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  if ( !lastRound || lastRound.length === 0 ) return "N/A";

  const finalMatch = lastRound[0];
  return finalMatch && finalMatch.winner ? finalMatch.winner : "N/A";
}

function reloadPlayPage() {
  router.navigate( "/tournament-play" );
}

function saveLocalTournament( tournament ) {
  localStorage.setItem( "tournament", JSON.stringify( tournament ) );
}

function restoreLocalTournament() {
  const data = localStorage.getItem( "tournament" );
  return data ? JSON.parse( data ) : null;
}

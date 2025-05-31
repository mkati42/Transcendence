export async function initNewGame( uid, roomId ) {
  const socket = new WebSocket( `wss://10.11.244.64/ws/game/${uid}/${roomId}/` );

  let playerId = null;
  let side = null;
  let score = [0, 0];
  let ballX = 600;
  let ballY = 300;
  let leftPaddleY = 200;
  let rightPaddleY = 200;
  let gameState = "waiting";

  // Canvas and UI Elements
  const canvas = document.createElement( "canvas" );
  canvas.id = "newGameCanvas";
  canvas.width = 1200;
  canvas.height = 600;
  document.body.appendChild( canvas );

  const scoreBoard = document.createElement( "div" );
  scoreBoard.id = "newGameScore";
  scoreBoard.className = "score-board text-center my-3";
  scoreBoard.textContent = `SCORE: ${score[0]} - ${score[1]}`;
  document.body.appendChild( scoreBoard );

  const startButton = document.createElement( "button" );
  startButton.id = "startGameButton";
  startButton.className = "btn btn-primary my-2";
  startButton.textContent = "Start Game";
  document.body.appendChild( startButton );

  const ctx = canvas.getContext( '2d' );
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballSize = 10;

  let upPressed = false;
  let downPressed = false;

  socket.onmessage = function ( event ) {
    const data = JSON.parse( event.data );
    switch ( data.type ) {
      case "player_joined":
        playerId = data.playerId;
        side = data.side;
        console.log( `Player joined as ${side}` );
        break;
      case "paddle_update":
        if ( data.side === "left" ) leftPaddleY = data.position;
        else if ( data.side === "right" ) rightPaddleY = data.position;
        break;
      case "ball_update":
        ballX = data.ball.x;
        ballY = data.ball.y;
        break;
      case "score_update":
        score = data.score;
        scoreBoard.textContent = `SCORE: ${score[0]} - ${score[1]}`;
        break;
      case "game_over":
        gameState = "over";
        scoreBoard.textContent = data.winner === side ? "You Win!" : "You Lose!";
        break;
      default:
        console.error( "Unknown message type:", data );
    }
  };

  socket.onopen = function () {
    console.log( "Connected to game server" );
    socket.send( JSON.stringify( { type: "join_game", roomId } ) );
  };

  socket.onclose = function () {
    console.log( "Disconnected from game server" );
  };

  function sendPaddleMovement( direction ) {
    if ( socket.readyState === WebSocket.OPEN ) {
      socket.send( JSON.stringify( { type: "move_paddle", direction, playerId } ) );
    }
  }

  document.addEventListener( "keydown", ( event ) => {
    if ( event.key === "ArrowUp" || event.key === "w" ) {
      upPressed = true;
      sendPaddleMovement( "up" );
    }
    if ( event.key === "ArrowDown" || event.key === "s" ) {
      downPressed = true;
      sendPaddleMovement( "down" );
    }
  } );

  document.addEventListener( "keyup", ( event ) => {
    if ( event.key === "ArrowUp" || event.key === "w" ) {
      upPressed = false;
    }
    if ( event.key === "ArrowDown" || event.key === "s" ) {
      downPressed = false;
    }
  } );

  startButton.addEventListener( "click", () => {
    if ( socket.readyState === WebSocket.OPEN ) {
      socket.send( JSON.stringify( { type: "start_game" } ) );
    }
  } );

  function draw() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = "black";
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc( ballX, ballY, ballSize, 0, Math.PI * 2 );
    ctx.fill();

    ctx.fillRect( 0, leftPaddleY, paddleWidth, paddleHeight );
    ctx.fillRect( canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight );
  }

  function gameLoop() {
    draw();
    if ( gameState !== "over" ) requestAnimationFrame( gameLoop );
  }

  gameLoop();
}

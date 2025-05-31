// WebSocket bağlantısı
const socket = new WebSocket( 'wss://yumamur-mugurel-ogcetin-sbozan.com/ws/game/test/' );

let playerId = null;
let side = null;
let score = [0, 0];
let ballX = 600; // Başlangıç pozisyonları
let ballY = 300;
let leftPaddleY = 200;
let rightPaddleY = 200;
gameState = "waiting";

const canvas = document.getElementById( 'pongCanvas' );
const scoreBoard = document.getElementById( 'score' );
const readyButton = document.getElementById( 'readyButton' );
const ctx = canvas.getContext( '2d' );
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

// Oyuncu hareketleri
let upPressed = false;
let downPressed = false;
let upInterval;
let downInterval;

scoreBoard.innerHTML = "SCORE " + score[0] + " - " + score[1];

// Mesaj alındığında
socket.onmessage = function ( e ) {
  const data = JSON.parse( e.data );
  if ( data.type === "player_accept" ) {
    const { player_id, side, paddle } = data;
    playerId = player_id;
    if ( side === "left" ) {
      leftPaddleY = paddle;
    }
    if ( side === "right" ) {
      rightPaddleY = paddle;
    }
  } else if ( data.type === "player_movement" ) {
    if ( data.side === "left" ) {
      leftPaddleY = data.paddle;
    }
    if ( data.side === "right" ) {
      rightPaddleY = data.paddle;
    }
  } else if ( data.type === "game_status" ) {
    gameState = data.status;
    if ( gameState === "over" ) {
      if ( data.winner === side ) {
        scoreBoard.innerHTML = `Kaybettiniz! SCORE: ${score[0]} - ${score[1]}`;
      }
      if ( data.winner !== side ) {
        scoreBoard.innerHTML = `Kazandiniz! SCORE: ${score[0]} - ${score[1]}`;
      }
    }
  } else if ( data.type === "ball_movement" ) {
    ballX = data.position[1];
    ballY = data.position[0];
  } else if ( data.type === "score_update" ) {
    if ( data.side === "left" ) {
      score[0]++;
    }
    if ( data.side === "right" ) {
      score[1]++;
    }
    scoreBoard.innerHTML = `SCORE: ${score[0]} - ${score[1]}`;
  } else if ( data.type === "state" ) {

  }
};

socket.onopen = function () {
  console.log( "WebSocket bağlantısı kuruldu." );
};

socket.onclose = function () {
  console.log( "WebSocket bağlantısı kapandı." );
};

readyButton.addEventListener( "click", () => {
  if ( socket.readyState === WebSocket.OPEN ) {
    socket.send( JSON.stringify( {
      type: "player_ready",
      player_id: playerId
    } ) );
  }
} );

function sendMovement( direction ) {
  if ( socket.readyState === WebSocket.OPEN ) {
    socket.send( JSON.stringify( {
      type: "player_move",
      player_id: playerId,
      direction: direction
    } ) );
  }
}

// Klavye olayları
function startMovement( direction ) {
  sendMovement( direction );
  if ( direction === "up" ) {
    upInterval = setInterval( () => sendMovement( "up" ), 50 );
  } else if ( direction === "down" ) {
    downInterval = setInterval( () => sendMovement( "down" ), 50 );
  }
}

function stopMovement( direction ) {
  if ( direction === "up" ) {
    clearInterval( upInterval );
    upPressed = false;
  } else if ( direction === "down" ) {
    clearInterval( downInterval );
    downPressed = false;
  }
}

document.addEventListener( "keydown", ( event ) => {
  const key = event.key;

  if ( ( key === "ArrowUp" || key === "w" ) && !upPressed ) {
    upPressed = true;
    startMovement( "up" );
  }
  if ( ( key === "ArrowDown" || key === "s" ) && !downPressed ) {
    downPressed = true;
    startMovement( "down" );
  }
} );

document.addEventListener( "keyup", ( event ) => {
  const key = event.key;

  if ( key === "ArrowUp" || key === "w" ) {
    stopMovement( "up" );
  }
  if ( key === "ArrowDown" || key === "s" ) {
    stopMovement( "down" );
  }
} );


// Çizim fonksiyonları
function drawRect( x, y, width, height, color ) {
  ctx.fillStyle = color;
  ctx.fillRect( x, y, width, height );
}

function drawCircle( x, y, size, color ) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc( x, y, size, 0, Math.PI * 2 );
  ctx.fill();
}

// Ekranı çiz
function draw() {
  // Temizle
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  // Arkaplan
  drawRect( 0, 0, canvas.width, canvas.height, 'black' );

  // Top
  drawCircle( ballX, ballY, ballSize, 'white' );

  // Pedallar
  drawRect( 0, leftPaddleY, paddleWidth, paddleHeight, 'white' );
  drawRect( canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight, 'white' );
}

// Oyun döngüsü
function gameLoop() {
  draw();
  requestAnimationFrame( gameLoop );
}

gameLoop();
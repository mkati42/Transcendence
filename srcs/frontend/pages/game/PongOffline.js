export class PongGameOffline {
  constructor( {
    canvasWidth = 1200,
    canvasHeight = 600,
    leftPaddleColor = "white",
    rightPaddleColor = "white",
    ballColor = "white",
    maxScore = 5,
  } = {}, onMatchOver ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.leftPaddleColor = leftPaddleColor;
    this.rightPaddleColor = rightPaddleColor;
    this.ballColor = ballColor;

    this.canvas = document.createElement( "canvas" );
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvas.getContext( "2d" );

    this.ballRadius = 10;
    this.ballSpeedX = 4;
    this.ballSpeedY = 3;
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;

    this.paddleWidth = 10;
    this.paddleHeight = 130;
    this.leftPaddleY = ( this.canvasHeight - this.paddleHeight ) / 2;
    this.rightPaddleY = ( this.canvasHeight - this.paddleHeight ) / 2;
    this.paddleSpeed = 5;

    this.isRunning = false;
    this.isPaused = false;
    this.keysPressed = {};

    this.maxScore = maxScore;
    this.leftScore = 0;
    this.rightScore = 0;

    window.setBallColor = this.setBallColor.bind( this );
    window.setPaddleLeftColor = this.setPaddleLeftColor.bind( this );
    window.setPaddleRightColor = this.setPaddleRightColor.bind( this );

    this.onMatchOver = onMatchOver;

    this.setupListeners();

    this.drawText( "Press Enter to Start", this.canvasWidth / 2 - 100, this.canvasHeight / 2, "white", "20px" );
  }

  setupListeners() {
    document.addEventListener( "keydown", ( event ) => {
      this.keysPressed[event.key] = true;
      if ( event.key === " " ) {
        if ( this.isRunning ) {
          this.isPaused = !this.isPaused;
          if ( !this.isPaused ) {
            this.gameLoop();
          }
        }
      }
      if ( event.code === "KeyR" ) {
        this.resetGame();
      }
      if ( event.key === "Enter" && !this.isRunning ) {
        this.startGame();
      }
    } );

    document.addEventListener( "keyup", ( event ) => {
      delete this.keysPressed[event.key];
    } );
  }

  startGame() {
    this.isRunning = true;
    this.isPaused = false;
    this.resetGame();
    this.gameLoop();
  }

  resetGame() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballSpeedX = 4;
    this.ballSpeedY = 3;
    this.leftPaddleY = ( this.canvasHeight - this.paddleHeight ) / 2;
    this.rightPaddleY = ( this.canvasHeight - this.paddleHeight ) / 2;
  }

  gameLoop() {
    if ( !this.isPaused ) {
      this.update();
      this.draw();
      requestAnimationFrame( this.gameLoop.bind( this ) );
    }
  }

  setPaddleLeftColor( color ) {
    this.leftPaddleColor = color;
  }

  setPaddleRightColor( color ) {
    this.rightPaddleColor = color;
  }

  setBallColor( color ) {
    this.ballColor = color;
  }

  update() {
    if ( this.keysPressed["w"] && this.leftPaddleY > 0 ) {
      this.leftPaddleY -= this.paddleSpeed;
    }
    if ( this.keysPressed["s"] && this.leftPaddleY < this.canvasHeight - this.paddleHeight ) {
      this.leftPaddleY += this.paddleSpeed;
    }
    if ( this.keysPressed["ArrowUp"] && this.rightPaddleY > 0 ) {
      this.rightPaddleY -= this.paddleSpeed;
    }
    if ( this.keysPressed["ArrowDown"] && this.rightPaddleY < this.canvasHeight - this.paddleHeight ) {
      this.rightPaddleY += this.paddleSpeed;
    }

    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    if ( this.ballY - this.ballRadius <= 0 || this.ballY + this.ballRadius >= this.canvasHeight ) {
      this.ballSpeedY *= -1;
      const rand = Math.random() * 0.5 - 0.25;
      this.ballSpeedX += rand;
      this.paddleSpeed += 0.1;
    }

    if (
      this.ballX - this.ballRadius <= this.paddleWidth &&
      this.ballY >= this.leftPaddleY &&
      this.ballY <= this.leftPaddleY + this.paddleHeight
    ) {
      this.ballSpeedX *= -1;
      this.ballX = this.paddleWidth + this.ballRadius;
    }

    if (
      this.ballX + this.ballRadius >= this.canvasWidth - this.paddleWidth &&
      this.ballY >= this.rightPaddleY &&
      this.ballY <= this.rightPaddleY + this.paddleHeight
    ) {
      this.ballSpeedX *= -1;
      this.ballX = this.canvasWidth - this.paddleWidth - this.ballRadius;
    }

    if ( this.ballX < 0 ) {
      this.rightScore++;
      if ( this.rightScore >= this.maxScore ) {
        this.drawText( "Right Player Wins!", this.canvasWidth / 2 - 100, this.canvasHeight / 2, "white", "20px" );
        this.isPaused = true;
        this.onMatchOver?.apply( "right" );
      } else {
        this.resetGame();
      }
    } else if ( this.ballX > this.canvasWidth ) {
      this.leftScore++;
      if ( this.leftScore >= this.maxScore ) {
        this.drawText( "Left Player Wins!", this.canvasWidth / 2 - 100, this.canvasHeight / 2, "white", "20px" );
        this.isPaused = true;
        this.onMatchOver?.apply( "left" );
      } else {
        this.resetGame();
      }
    }
  }

  draw() {
    this.ctx.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );

    this.drawCircle( this.ballX, this.ballY, this.ballRadius, this.ballColor );

    this.drawRect( 0, this.leftPaddleY, this.paddleWidth, this.paddleHeight, this.leftPaddleColor );

    this.drawRect(
      this.canvasWidth - this.paddleWidth,
      this.rightPaddleY,
      this.paddleWidth,
      this.paddleHeight,
      this.rightPaddleColor
    );

    this.drawRect( this.canvasWidth / 2 - 1, 0, 2, this.canvasHeight, "white" );

    this.drawRect( 0, 0, this.canvasWidth, 5, "white" );
    this.drawRect( 0, this.canvasHeight - 5, this.canvasWidth, 5, "white" );
    this.drawRect( 0, 0, 5, this.canvasHeight, "white" );
    this.drawRect( this.canvasWidth - 5, 0, 5, this.canvasHeight, "white" );

    this.drawRect( this.canvasWidth / 2 - 2, 0, 4, this.canvasHeight, "white" );

    this.drawText( this.leftScore, this.canvasWidth / 4, 30, "white" );
    this.drawText( this.rightScore, ( this.canvasWidth / 4 ) * 3, 30, "white" );

    if ( this.isPaused ) {
      this.drawText( "Paused", this.canvasWidth / 2 - 40, this.canvasHeight / 2, "white", "30px" );
    }
  }

  drawRect( x, y, width, height, color ) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect( x, y, width, height );
  }

  drawCircle( x, y, radius, color ) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc( x, y, radius, 0, Math.PI * 2 );
    this.ctx.fill();
  }

  drawText( text, x, y, color, fontSize = "20px" ) {
    this.ctx.fillStyle = color;
    this.ctx.font = fontSize + " Arial";
    this.ctx.fillText( text, x, y );
  }

  getCanvas() {
    return this.canvas;
  }
}

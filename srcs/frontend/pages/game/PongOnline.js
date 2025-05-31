import { getCookie } from "../../src/api/ApiUtils.js";
import { EventSystem } from "../../src/api/EventSystem.js";
import router from "../../src/routing/Router.js";

export function onlinePong() {
  let connected = false;

  let playerId = null;
  let side = null;
  let score = [0, 0];
  let ballX = 600; // Başlangıç pozisyonları
  let ballY = 300;
  let leftPaddleY = 200;
  let rightPaddleY = 200;
  let gameState = "waiting";

  const container = document.createElement("div");

  const canvas = document.createElement("canvas");
  const scoreBoard = document.createElement("div");
  const readyButton = document.createElement("button");

  readyButton.innerHTML = "Ready";

  container.appendChild(canvas);
  container.appendChild(scoreBoard);
  container.appendChild(readyButton);

  canvas.width = 1200;
  canvas.height = 600;

  const ctx = canvas.getContext("2d");
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballSize = 10;

  // Oyuncu hareketleri
  let upPressed = false;
  let downPressed = false;
  let upInterval;
  let downInterval;

  scoreBoard.innerHTML = "SCORE " + score[0] + " - " + score[1];

  EventSystem.on("join-game", ({ uid }) => {
    if (!(connected = true)) {
      return;
    }

    localStorage.setItem("game_uid", uid);
    const socket = new WebSocket(
      `wss://${window.location.host}/ws/game/${uid}/${getCookie("username")}/`
    );

    // Mesaj alındığında
    socket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      if (data.type === "player_accept") {
        playerId = data.player_id;
        side = data.side;
        if (side === "left") {
          leftPaddleY = data.paddle;
        }
        if (side === "right") {
          rightPaddleY = data.paddle;
        }
      } else if (data.type === "player_movement") {
        if (data.side === "left") {
          leftPaddleY = data.paddle;
        }
        if (data.side === "right") {
          rightPaddleY = data.paddle;
        }
      } else if (data.type === "game_status") {
        gameState = data.status;
        if (gameState === "over") {
          router.navigate("/");
          console.log(data);
          if (data.winner === side) {
            scoreBoard.innerHTML = `Kaybettiniz! SCORE: ${score[0]} - ${score[1]}`;
          }
          if (data.winner !== side) {
            scoreBoard.innerHTML = `Kazandiniz! SCORE: ${score[0]} - ${score[1]}`;
          }
        }
      } else if (data.type === "ball_movement") {
        ballX = data.position[1];
        ballY = data.position[0];
      } else if (data.type === "score_update") {
        if (data.side === "left") {
          score[0] = data.score;
        }
        if (data.side === "right") {
          score[1] = data.score;
        }
        scoreBoard.innerHTML = `SCORE: ${score[0]} - ${score[1]}`;
      } else if (data.type === "state") {
      }
    };

    socket.onopen = function () {
      console.log("WebSocket bağlantısı kuruldu.");
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "get_state",
          })
        );
      }
    };

    socket.onclose = function () {
      localStorage.removeItem("game_uid");
      console.log("WebSocket bağlantısı kapandı.");
    };

    readyButton.addEventListener("click", () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "player_ready",
            player_id: playerId,
          })
        );
      }
      readyButton.remove();
    });

    function sendMovement(direction) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "player_move",
            player_id: playerId,
            direction: direction,
          })
        );
      }
    }

    // Klavye olayları
    function startMovement(direction) {
      sendMovement(direction);
      if (direction === "up") {
        upInterval = setInterval(() => sendMovement("up"), 50);
      } else if (direction === "down") {
        downInterval = setInterval(() => sendMovement("down"), 50);
      }
    }

    function stopMovement(direction) {
      if (direction === "up") {
        clearInterval(upInterval);
        upPressed = false;
      } else if (direction === "down") {
        clearInterval(downInterval);
        downPressed = false;
      }
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key;

      if ((key === "ArrowUp" || key === "w") && !upPressed) {
        upPressed = true;
        startMovement("up");
      }
      if ((key === "ArrowDown" || key === "s") && !downPressed) {
        downPressed = true;
        startMovement("down");
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key;

      if (key === "ArrowUp" || key === "w") {
        stopMovement("up");
      }
      if (key === "ArrowDown" || key === "s") {
        stopMovement("down");
      }
    });

    // Çizim fonksiyonları
    function drawRect(x, y, width, height, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    }

    function drawCircle(x, y, size, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ekranı çiz
    function draw() {
      // Temizle
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Arkaplan
      drawRect(0, 0, canvas.width, canvas.height, "black");

      // Top
      drawCircle(ballX, ballY, ballSize, "white");

      // Pedallar
      drawRect(0, leftPaddleY, paddleWidth, paddleHeight, "white");
      drawRect(
        canvas.width - paddleWidth,
        rightPaddleY,
        paddleWidth,
        paddleHeight,
        "white"
      );
    }

    // Oyun döngüsü
    function gameLoop() {
      draw();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  });

  if (localStorage.getItem("game_uid")) {
    const uid = localStorage.getItem("game_uid");
    localStorage.removeItem("game_uid");
    EventSystem.emit("join-game", { uid });
  }
  return container;
}

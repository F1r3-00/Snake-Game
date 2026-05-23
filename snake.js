const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

// Dimensioni fisse del sistema di coordinate interno
canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = 20;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
let food = { x: 5, y: 5 };
let gameRunning = true; // Stato del gioco

// Funzione principale (Game Loop)
function main() {
    if (!gameRunning) return; // Se il gioco è in game over, ferma il loop

    if (didGameEnd()) {
        showGameOver(); // Invece dell'alert, mostra il nostro popup
        return;
    }

    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        advanceSnake();
        drawSnake();
        main();
    }, 100);
}

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Griglia di sfondo
    ctx.strokeStyle = "#1a1a1a";
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

function drawSnake() {
    ctx.fillStyle = "#2ecc71";
    ctx.strokeStyle = "#27ae60";
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (dx !== 0 || dy !== 0) {
        snake.unshift(head);
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score += 10;
            scoreElement.innerHTML = "Punti: " + score;
            createFood();
        } else {
            snake.pop();
        }
    }
}

function didGameEnd() {
    if (dx === 0 && dy === 0) return false;

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > tileCount - 1;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > tileCount - 1;

    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function drawFood() {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// --- GESTIONE GAME OVER ---

function showGameOver() {
    gameRunning = false;
    // 1. Aggiunge sfocatura al canvas
    canvas.classList.add("blur-effect");
    // 2. Aggiorna il punteggio nel popup
    finalScoreElement.innerHTML = "Punteggio finale: " + score;
    // 3. Mostra il popup
    gameOverScreen.style.display = "flex";
}

function resetGame() {
    // 1. Rimuove sfocatura e nasconde popup
    canvas.classList.remove("blur-effect");
    gameOverScreen.style.display = "none";

    // 2. Reset dati
    score = 0;
    scoreElement.innerHTML = "Punti: 0";
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0;
    dy = 0;
    gameRunning = true;

    createFood();
    main();
}

// Collega il pulsante di riavvio
restartButton.onclick = resetGame;

// --- CONTROLLI ---

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
    if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
    if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
});

let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

canvas.addEventListener("touchend", e => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, { passive: false });

function handleSwipe(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 10 && dx !== -1) { dx = 1; dy = 0; }
        else if (diffX < -10 && dx !== 1) { dx = -1; dy = 0; }
    } else {
        if (diffY > 10 && dy !== -1) { dx = 0; dy = 1; }
        else if (diffY < -10 && dy !== 1) { dx = 0; dy = -1; }
    }
}

// Avvio iniziale
createFood();
main();
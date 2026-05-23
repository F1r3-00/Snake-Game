const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

// Coordinate interne del gioco
canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = 20;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
let food = { x: 5, y: 5 };
let gameRunning = true;

function main() {
    if (!gameRunning) return;

    if (didGameEnd()) {
        showGameOver();
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

    // Griglia di sfondo molto scura
    ctx.strokeStyle = "#111";
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
    const hitWall = snake[0].x < 0 || snake[0].x > tileCount - 1 || snake[0].y < 0 || snake[0].y > tileCount - 1;
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return hitWall;
}

function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function drawFood() {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function showGameOver() {
    gameRunning = false;
    canvas.classList.add("blur-effect");
    finalScoreElement.innerHTML = "Punteggio finale: " + score;
    gameOverScreen.style.display = "flex";
}

function resetGame() {
    canvas.classList.remove("blur-effect");
    gameOverScreen.style.display = "none";
    score = 0;
    scoreElement.innerHTML = "Punti: 0";
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0; dy = 0;
    gameRunning = true;
    createFood();
    main();
}

restartButton.onclick = resetGame;

// --- CONTROLLI TOUCH (SENSIBILITÀ AGGIUSTATA) ---
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

    // SOGLIA DI SENSIBILITÀ: Lo swipe deve essere lungo almeno 40px
    const threshold = 40;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (diffX < 0 && dx !== 1) { dx = -1; dy = 0; }
        }
    } else {
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (diffY < 0 && dy !== 1) { dx = 0; dy = -1; }
        }
    }
}

// Controlli Tastiera
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
    if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
    if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
});

createFood();
main();

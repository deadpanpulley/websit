
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;


const TETROMINOS = {
    I: {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000f0'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00f000'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#f00000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000f0'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#f0a000'
    }
};


let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece, nextPiece;
let score = 0, level = 1, lines = 0;
let gameActive = false, gamePaused = false;
let dropTime = 0, dropInterval = 1000;
let lastTime = 0;

let scoreElement, levelElement, linesElement;
let startScreen, gameOverScreen, pauseScreen;
let startBtn, restartBtn;
let gameOverlay;


function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    
    
    scoreElement = document.getElementById('score');
    levelElement = document.getElementById('level');
    linesElement = document.getElementById('lines');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    pauseScreen = document.getElementById('pauseScreen');
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    gameOverlay = document.getElementById('gameOverlay');
    
    
    gameOverlay.classList.add('active');
    
    
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    createBoard();
    drawBoard();
    drawNextPiece();
}


function createBoard() {
    board = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
        }
    }
}

function createPiece() {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const tetromino = TETROMINOS[randomPiece];
    
    return {
        shape: tetromino.shape,
        color: tetromino.color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
        y: 0
    };
}


function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
    
   
    if (currentPiece) {
        drawPiece(ctx, currentPiece);
    }
}


function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#333';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}


function drawPiece(context, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(context, piece.x + x, piece.y + y, piece.color);
            }
        });
    });
}


function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * BLOCK_SIZE) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * BLOCK_SIZE) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(
                        offsetX + x * BLOCK_SIZE,
                        offsetY + y * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    nextCtx.strokeStyle = '#333';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(
                        offsetX + x * BLOCK_SIZE,
                        offsetY + y * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            });
        });
    }
}

function isValid(piece, x = 0, y = 0) {
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            let newX = piece.x + dx + x;
            let newY = piece.y + dy + y;
            return (
                value === 0 ||
                (newX >= 0 && newX < BOARD_WIDTH &&
                 newY >= 0 && newY < BOARD_HEIGHT &&
                 !board[newY][newX])
            );
        });
    });
}

function movePiece(x, y) {
    if (isValid(currentPiece, x, y)) {
        currentPiece.x += x;
        currentPiece.y += y;
        return true;
    }
    return false;
}

function rotatePiece() {
    const rotated = [];
    const shape = currentPiece.shape;
    
    for (let i = 0; i < shape[0].length; i++) {
        rotated[i] = [];
        for (let j = shape.length - 1; j >= 0; j--) {
            rotated[i][shape.length - 1 - j] = shape[j][i];
        }
    }
    
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (!isValid(currentPiece)) {
        currentPiece.shape = originalShape;
    }
}


function hardDrop() {
    while (movePiece(0, 1)) {
        score += 2;
    }
    placePiece();
}


function placePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
    
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();
    drawNextPiece();
    
    if (!isValid(currentPiece)) {
        gameOver();
    }
}


function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; 
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        updateStats();
    }
}


function updateStats() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}


function handleKeyPress(event) {
    if (!gameActive || gamePaused) return;
    
    switch (event.code) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            if (movePiece(0, 1)) {
                score += 1;
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'Space':
            hardDrop();
            break;
        case 'KeyP':
            togglePause();
            break;
    }
}


function togglePause() {
    if (!gameActive) return;
    
    gamePaused = !gamePaused;
    if (gamePaused) {
        pauseScreen.style.display = 'block';
        gameOverlay.classList.add('active');
    } else {
        pauseScreen.style.display = 'none';
        gameOverlay.classList.remove('active');
    }
}


function gameLoop(currentTime) {
    if (!gameActive || gamePaused) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    dropTime += deltaTime;
    
    if (dropTime > dropInterval) {
        if (!movePiece(0, 1)) {
            placePiece();
        }
        dropTime = 0;
    }
    
    drawBoard();
    requestAnimationFrame(gameLoop);
}


function startGame() {
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    dropTime = 0;
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    gameActive = true;
    gamePaused = false;
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    gameOverlay.classList.remove('active');
    
    updateStats();
    drawBoard();
    drawNextPiece();
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}


function gameOver() {
    gameActive = false;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalLines').textContent = lines;
    
    gameOverScreen.style.display = 'block';
    gameOverlay.classList.add('active');
}


window.addEventListener('load', init); 
// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const FLAP_FORCE = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;

// Game state
let canvas, ctx;
let bird;
let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBest') || 0;
let gameActive = false;
let gameStarted = false;

// DOM elements
let scoreElement, bestScoreElement;
let startScreen, gameOverScreen;
let startBtn, restartBtn;
let gameOverlay;

// Bird class
class Bird {
    constructor() {
        this.x = 80;
        this.y = CANVAS_HEIGHT / 2;
        this.width = 30;
        this.height = 30;
        this.velocity = 0;
        this.gravity = GRAVITY;
    }

    update() {
        if (!gameActive) return;
        
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        // Ground collision
        if (this.y + this.height >= CANVAS_HEIGHT - 50) {
            this.y = CANVAS_HEIGHT - 50 - this.height;
            this.velocity = 0;
            gameOver();
        }
        
        // Ceiling collision
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    flap() {
        if (!gameActive) return;
        this.velocity = FLAP_FORCE;
    }

    draw() {
        // Bird body
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bird eye
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 20, this.y + 5, 5, 5);
        
        // Bird wing
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x + 5, this.y + 10, 15, 10);
        
        // Bird beak
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(this.x + this.width, this.y + 10, 8, 10);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Pipe class
class Pipe {
    constructor() {
        this.x = CANVAS_WIDTH;
        this.width = PIPE_WIDTH;
        this.gap = PIPE_GAP;
        this.gapY = Math.random() * (CANVAS_HEIGHT - 200 - this.gap) + 100;
        this.passed = false;
    }

    update() {
        this.x -= PIPE_SPEED;
    }

    draw() {
        // Top pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, 0, this.width, this.gapY);
        
        // Bottom pipe
        ctx.fillRect(this.x, this.gapY + this.gap, this.width, CANVAS_HEIGHT - (this.gapY + this.gap));
        
        // Pipe borders
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, 0, this.width, this.gapY);
        ctx.strokeRect(this.x, this.gapY + this.gap, this.width, CANVAS_HEIGHT - (this.gapY + this.gap));
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(this.x - 5, this.gapY - 20, this.width + 10, 20);
        ctx.fillRect(this.x - 5, this.gapY + this.gap, this.width + 10, 20);
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    checkCollision(bird) {
        const birdBounds = bird.getBounds();
        
        // Check collision with top pipe
        if (birdBounds.x < this.x + this.width &&
            birdBounds.x + birdBounds.width > this.x &&
            birdBounds.y < this.gapY) {
            return true;
        }
        
        // Check collision with bottom pipe
        if (birdBounds.x < this.x + this.width &&
            birdBounds.x + birdBounds.width > this.x &&
            birdBounds.y + birdBounds.height > this.gapY + this.gap) {
            return true;
        }
        
        return false;
    }

    checkScore(bird) {
        if (!this.passed && bird.x > this.x + this.width) {
            this.passed = true;
            score++;
            updateScore();
        }
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Get DOM elements
    scoreElement = document.getElementById('score');
    bestScoreElement = document.getElementById('bestScore');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    startBtn = document.getElementById('startBtn');
    restartBtn = document.getElementById('restartBtn');
    gameOverlay = document.getElementById('gameOverlay');
    
    // Show start screen
    gameOverlay.classList.add('active');
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('click', handleClick);
    
    // Update best score display
    bestScoreElement.textContent = bestScore;
    
    // Start game loop
    gameLoop();
}

// Handle keyboard input
function handleKeyPress(event) {
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            if (gameActive) {
                bird.flap();
            } else if (!gameStarted) {
                startGame();
            }
            break;
        case 'KeyR':
            if (!gameActive && gameStarted) {
                startGame();
            }
            break;
    }
}

// Handle mouse/touch input
function handleClick(event) {
    if (gameActive) {
        bird.flap();
    } else if (!gameStarted) {
        startGame();
    }
}

// Start game
function startGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    gameActive = true;
    gameStarted = true;
    
    // Hide overlay
    gameOverlay.classList.remove('active');
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    updateScore();
}

// Game over
function gameOver() {
    gameActive = false;
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBest', bestScore);
        bestScoreElement.textContent = bestScore;
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalBest').textContent = bestScore;
    gameOverScreen.style.display = 'block';
    gameOverlay.classList.add('active');
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();
    
    if (gameActive) {
        // Update and draw bird
        bird.update();
        bird.draw();
        
        // Generate new pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < CANVAS_WIDTH - 200) {
            pipes.push(new Pipe());
        }
        
        // Update and draw pipes
        pipes.forEach((pipe, index) => {
            pipe.update();
            pipe.draw();
            
            // Check collision
            if (pipe.checkCollision(bird)) {
                gameOver();
            }
            
            // Check score
            pipe.checkScore(bird);
            
            // Remove offscreen pipes
            if (pipe.isOffscreen()) {
                pipes.splice(index, 1);
            }
        });
        
        // Draw ground
        drawGround();
    } else if (gameStarted) {
        // Draw bird even when game is over
        bird.draw();
        pipes.forEach(pipe => pipe.draw());
        drawGround();
    }
    
    requestAnimationFrame(gameLoop);
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(50, 50, 60, 30);
    ctx.fillRect(300, 100, 80, 40);
    ctx.fillRect(150, 150, 70, 35);
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
    
    // Ground pattern
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
        ctx.fillRect(i, CANVAS_HEIGHT - 50, 10, 50);
    }
}

// Initialize when page loads
window.addEventListener('load', init); 
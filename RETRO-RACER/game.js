
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const ROAD_WIDTH = 300;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const PLAYER_SPEED = 5;
const BASE_SPEED = 3;
const MAX_OBSTACLES = 5;
const OBSTACLE_TYPES = ['car', 'truck', 'oil'];
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];


let gameState = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    score: 0,
    level: 1,
    speed: 0,
    maxSpeed: 5,
    acceleration: 0.1,
    deceleration: 0.05,
    gameOver: false,
    levelComplete: false,
    roadPosition: 0,
    player: {
        x: 0,
        y: CANVAS_HEIGHT - 120,
        width: 30,
        height: 50,
        lane: 1, 
        moving: false,
        invincible: false
    },
    obstacles: [],
    lastObstacleSpawn: 0,
    obstacleSpawnRate: 2000, 
    roadSegments: [],
    keys: {},
    lastScoreUpdate: 0,
    nextLevelScore: 1000
};


const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const levelCompleteScreen = document.getElementById('level-complete');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');
const finalScoreElement = document.getElementById('final-score');
const levelScoreElement = document.getElementById('level-score');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const speedElement = document.getElementById('speed');


function init() {
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    nextLevelButton.addEventListener('click', nextLevel);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    
    updatePlayerPosition();
    
   
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
   
    requestAnimationFrame(gameLoop);
}


function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    
    update(deltaTime);
    render();
    
    if (!gameState.gameOver && !gameState.levelComplete) {
        requestAnimationFrame(gameLoop);
    }
}


function update(deltaTime) {
    if (gameState.gameOver || gameState.levelComplete) return;
    
    
    updatePlayer();
    
    
    updateObstacles(deltaTime);
    
   
    updateScore();
    
    
    if (Date.now() - gameState.lastObstacleSpawn > gameState.obstacleSpawnRate) {
        spawnObstacle();
        gameState.lastObstacleSpawn = Date.now();
    }
    
    
    if (gameState.score >= gameState.nextLevelScore) {
        gameState.levelComplete = true;
        levelScoreElement.textContent = `Score: ${gameState.score}`;
        levelCompleteScreen.classList.remove('hidden');
    }
}


function updatePlayerPosition() {
    const roadX = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    gameState.player.x = roadX + (gameState.player.lane * LANE_WIDTH) + (LANE_WIDTH / 4);
}


function updatePlayer() {
    const { player, keys } = gameState;
    
    
    if (keys['ArrowLeft'] && player.lane > 0 && !player.moving) {
        player.lane--;
        player.moving = true;
        setTimeout(() => { player.moving = false; }, 200);
    } else if (keys['ArrowRight'] && player.lane < LANE_COUNT - 1 && !player.moving) {
        player.lane++;
        player.moving = true;
        setTimeout(() => { player.moving = false; }, 200);
    }
    
    
    updatePlayerPosition();
    
    
    if (keys['ArrowUp']) {
        gameState.speed = Math.min(gameState.speed + gameState.acceleration, gameState.maxSpeed);
    } else if (keys['ArrowDown']) {
        gameState.speed = Math.max(0, gameState.speed - gameState.deceleration * 2);
    } else {
        gameState.speed = Math.max(0, gameState.speed - gameState.deceleleration);
    }
    
    
    speedElement.textContent = Math.floor(gameState.speed * 20);
}


function updateObstacles(deltaTime) {
    const { obstacles, player } = gameState;
    
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacle.speed * gameState.speed;
        
        
        if (obstacle.y > CANVAS_HEIGHT) {
            obstacles.splice(i, 1);
            continue;
        }
        
        
        if (!player.invincible && isColliding(player, obstacle)) {
            if (obstacle.type === 'oil') {
                
                player.lane = Math.max(0, Math.min(LANE_COUNT - 1, player.lane + (Math.random() > 0.5 ? 1 : -1)));
                updatePlayerPosition();
            } else {
                
                gameState.lives--;
                player.invincible = true;
                
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    gameOverScreen.classList.remove('hidden');
                    finalScoreElement.textContent = `Score: ${gameState.score}`;
                } else {
                    
                    let blinkCount = 0;
                    const blinkInterval = setInterval(() => {
                        player.visible = !player.visible;
                        blinkCount++;
                        if (blinkCount > 6) {
                            clearInterval(blinkInterval);
                            player.visible = true;
                            player.invincible = false;
                        }
                    }, 200);
                }
            }
            
            
            obstacles.splice(i, 1);
        }
    }
}


function spawnObstacle() {
    if (gameState.obstacles.length >= MAX_OBSTACLES) return;
    
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const roadX = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    
    const obstacle = {
        type,
        x: roadX + (lane * LANE_WIDTH) + (Math.random() * (LANE_WIDTH - 40)),
        y: -50,
        width: 30,
        height: 50,
        speed: 1 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    
    if (type === 'truck') {
        obstacle.width = 40;
        obstacle.height = 70;
        obstacle.speed = 0.8 + Math.random() * 0.3;
    } else if (type === 'oil') {
        obstacle.width = 35;
        obstacle.height = 35;
        obstacle.color = '#333';
        obstacle.speed = 0.5 + Math.random() * 0.5;
    }
    
    gameState.obstacles.push(obstacle);
}


function updateScore() {
    const now = Date.now();
    if (now - gameState.lastScoreUpdate > 100) {
        gameState.score += Math.floor(gameState.speed * 2);
        scoreElement.textContent = gameState.score;
        levelElement.textContent = gameState.level;
        gameState.lastScoreUpdate = now;
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function startGame() {
    resetGame();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    
    if (gameState.gameOver) {
        gameState.gameOver = false;
        requestAnimationFrame(gameLoop);
    }
}

function nextLevel() {
    gameState.level++;
    gameState.levelComplete = false;
    gameState.nextLevelScore += 2000;
    gameState.maxSpeed += 1;
    gameState.obstacleSpawnRate = Math.max(500, gameState.obstacleSpawnRate - 200);
    
    levelCompleteScreen.classList.add('hidden');
    gameState.obstacles = [];
    
    if (gameState.gameOver) {
        gameState.gameOver = false;
        requestAnimationFrame(gameLoop);
    }
}

function resetGame() {
    gameState.gameOver = false;
    gameState.levelComplete = false;
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = 0;
    gameState.maxSpeed = 5;
    gameState.obstacles = [];
    gameState.player.lane = 1;
    gameState.player.invincible = false;
    gameState.player.visible = true;
    gameState.obstacleSpawnRate = 2000;
    gameState.nextLevelScore = 1000;
    gameState.lives = 3;
    
    updatePlayerPosition();
    
    requestAnimationFrame(gameLoop);
}

function render() {
    const { ctx, player, obstacles } = gameState;
    
    ctx.fillStyle = '#008000'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const roadX = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
    ctx.fillStyle = '#333333'; 
    ctx.fillRect(roadX, 0, ROAD_WIDTH, CANVAS_HEIGHT);
    
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
   
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    
   
    for (let i = 1; i < LANE_COUNT; i++) {
        const x = roadX + (i * LANE_WIDTH);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'oil') {
            
            ctx.fillStyle = obstacle.color;
            ctx.beginPath();
            ctx.ellipse(
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2,
                obstacle.width / 2,
                obstacle.height / 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(
                obstacle.x + obstacle.width / 3,
                obstacle.y + obstacle.height / 3,
                obstacle.width / 4,
                obstacle.height / 4,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        } else {
            
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            
            ctx.fillStyle = '#000';
            ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 5, 5);
            ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 5, 5, 5); 
        }
    });
    
    
    if (player.visible !== false) {
        ctx.fillStyle = player.invincible ? '#FFA500' : '#FF0000'; 
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        
        ctx.fillStyle = '#000';
        ctx.fillRect(player.x + 5, player.y + 5, 5, 5); 
        ctx.fillRect(player.x + player.width - 10, player.y + 5, 5, 5); 
    }
}


function handleKeyDown(e) {
    gameState.keys[e.key] = true;
    
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    
    if (e.key === ' ' && (gameState.gameOver || gameState.levelComplete)) {
        if (gameState.gameOver) {
            resetGame();
        } else {
            nextLevel();
        }
    }
}

function handleKeyUp(e) {
    gameState.keys[e.key] = false;
}


window.onload = init;

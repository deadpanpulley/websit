
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const LADDER_SPEED = 3;


let gameState = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    levelComplete: false,
    player: {
        x: 100,
        y: 500,
        width: 30,
        height: 40,
        velocityY: 0,
        isJumping: false,
        isOnLadder: false,
        direction: 1, 
        frame: 0,
        frameCount: 0
    },
    donkeyKong: {
        x: 100,
        y: 100,
        width: 60,
        height: 80,
        frame: 0,
        frameCount: 0
    },
    princess: {
        x: 650,
        y: 100,
        width: 30,
        height: 40
    },
    platforms: [
        { x: 0, y: 550, width: 800, height: 20 },
        { x: 100, y: 450, width: 200, height: 20 },
        { x: 500, y: 450, width: 200, height: 20 },
        { x: 0, y: 350, width: 200, height: 20 },
        { x: 400, y: 350, width: 200, height: 20 },
        { x: 200, y: 250, width: 200, height: 20 },
        { x: 600, y: 250, width: 200, height: 20 }
    ],
    ladders: [
        { x: 350, y: 350, width: 30, height: 120 },
        { x: 250, y: 250, width: 30, height: 120 },
        { x: 550, y: 250, width: 30, height: 120 },
        { x: 150, y: 150, width: 30, height: 120 }
    ],
    barrels: [],
    lastBarrelSpawn: 0,
    barrelSpawnRate: 2000, 
    keys: {}
};


const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const levelCompleteScreen = document.getElementById('level-complete');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');
const finalScoreElement = document.getElementById('final-score');


function init() {
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    nextLevelButton.addEventListener('click', nextLevel);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    
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
    
    if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}


function update(deltaTime) {
    if (gameState.gameOver || gameState.levelComplete) return;
    
    const { player, platforms, ladders, barrels } = gameState;
    
    
    updatePlayer();
    
    
    updateBarrels(deltaTime);
    
    
    checkCollisions();
    
    
    if (Date.now() - gameState.lastBarrelSpawn > gameState.barrelSpawnRate) {
        spawnBarrel();
        gameState.lastBarrelSpawn = Date.now();
    }
    
    
    if (isPlayerOnPrincess()) {
        gameState.levelComplete = true;
        levelCompleteScreen.classList.remove('hidden');
    }
}


function updatePlayer() {
    const { player, platforms, ladders } = gameState;
    
    
    if (gameState.keys['ArrowLeft']) {
        player.x -= MOVE_SPEED;
        player.direction = -1;
    }
    if (gameState.keys['ArrowRight']) {
        player.x += MOVE_SPEED;
        player.direction = 1;
    }
    
    
    if (gameState.keys['ArrowUp'] && !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }
    
    
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    
    
    player.isOnLadder = false;
    let onGround = false;
    
   
    platforms.forEach(platform => {
        
        if (player.y + player.height > platform.y && 
            player.y < platform.y &&
            player.x + player.width > platform.x && 
            player.x < platform.x + platform.width) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onGround = true;
        }
    });
    
    
    ladders.forEach(ladder => {
        if (player.x + player.width > ladder.x && 
            player.x < ladder.x + ladder.width &&
            player.y + player.height > ladder.y && 
            player.y < ladder.y + ladder.height) {
            player.isOnLadder = true;
            
            
            if (gameState.keys['ArrowUp']) {
                player.y -= LADDER_SPEED;
                player.velocityY = 0;
            } else if (gameState.keys['ArrowDown']) {
                player.y += LADDER_SPEED;
                player.velocityY = 0;
            }
        }
    });
    
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) {
        player.y = CANVAS_HEIGHT - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    
    player.frameCount++;
    if (player.frameCount > 10) {
        player.frame = (player.frame + 1) % 2;
        player.frameCount = 0;
    }
}


function updateBarrels(deltaTime) {
    gameState.barrels.forEach((barrel, index) => {
        
        barrel.x += barrel.velocityX;
        barrel.y += barrel.velocityY;
        
        
        let onPlatform = false;
        gameState.platforms.forEach(platform => {
            if (barrel.x + barrel.width > platform.x && 
                barrel.x < platform.x + platform.width &&
                barrel.y + barrel.height >= platform.y && 
                barrel.y < platform.y + platform.height) {
                barrel.y = platform.y - barrel.height;
                barrel.velocityY = 0;
                onPlatform = true;
            }
        });
        
        
        if (!onPlatform && barrel.velocityY === 0) {
            barrel.velocityY = 2;
        }
        
        
        if (barrel.y > CANVAS_HEIGHT) {
            gameState.barrels.splice(index, 1);
        }
    });
}


function spawnBarrel() {
    const { donkeyKong } = gameState;
    gameState.barrels.push({
        x: donkeyKong.x + donkeyKong.width / 2 - 10,
        y: donkeyKong.y + donkeyKong.height,
        width: 20,
        height: 20,
        velocityX: 2,
        velocityY: 0
    });
}


function checkCollisions() {
    const { player, barrels } = gameState;
    
    
    barrels.forEach((barrel, index) => {
        if (isColliding(player, barrel)) {
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                gameOverScreen.classList.remove('hidden');
                finalScoreElement.textContent = `Score: ${gameState.score}`;
            } else {
                
                resetPlayer();
            
                gameState.barrels.splice(index, 1);
            }
        }
    });
}


function isPlayerOnPrincess() {
    const { player, princess } = gameState;
    return isColliding(player, princess);
}


function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}


function resetPlayer() {
    gameState.player.x = 100;
    gameState.player.y = 500;
    gameState.player.velocityY = 0;
    gameState.player.isJumping = false;
}


function startGame() {
    gameState.gameOver = false;
    gameState.levelComplete = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.barrels = [];
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    
    resetPlayer();
    
    
    if (gameState.gameOver) {
        gameState.gameOver = false;
        requestAnimationFrame(gameLoop);
    }
}


function nextLevel() {
    gameState.level++;
    gameState.levelComplete = false;
    levelCompleteScreen.classList.add('hidden');
    
    
    gameState.barrelSpawnRate = Math.max(1000, 2000 - (gameState.level - 1) * 200);
    
    
    resetPlayer();
    
    
    gameState.barrels = [];
}


function resetGame() {
    gameState.gameOver = false;
    gameState.levelComplete = false;
    gameOverScreen.classList.add('hidden');
    
    
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.barrels = [];
    
    resetPlayer();
    
   
    requestAnimationFrame(gameLoop);
}


function render() {
    const { ctx, player, donkeyKong, princess, platforms, ladders, barrels } = gameState;
    
   
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    
    ctx.fillStyle = '#00f';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    
    ctx.fillStyle = '#8B4513'; 
    ladders.forEach(ladder => {
        
        ctx.fillRect(ladder.x, ladder.y, 5, ladder.height);
        ctx.fillRect(ladder.x + ladder.width - 5, ladder.y, 5, ladder.height);
        
       
        for (let y = ladder.y + 10; y < ladder.y + ladder.height; y += 20) {
            ctx.fillRect(ladder.x, y, ladder.width, 5);
        }
    });
    
    
    ctx.fillStyle = '#8B0000'; 
    barrels.forEach(barrel => {
        ctx.beginPath();
        ctx.arc(
            barrel.x + barrel.width / 2,
            barrel.y + barrel.height / 2,
            barrel.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
       
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            barrel.x + barrel.width / 2,
            barrel.y + barrel.height / 2,
            barrel.width / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        
        ctx.beginPath();
        ctx.moveTo(barrel.x + 2, barrel.y + barrel.height / 2);
        ctx.lineTo(barrel.x + barrel.width - 2, barrel.y + barrel.height / 2);
        ctx.stroke();
    });
    
    
    ctx.fillStyle = '#8B4513'; 
    ctx.fillRect(donkeyKong.x, donkeyKong.y, donkeyKong.width, donkeyKong.height);
    
    
    ctx.fillStyle = '#ff69b4'; 
    ctx.fillRect(princess.x, princess.y, princess.width, princess.height);
    
    
    ctx.fillStyle = '#ff0000'; 
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    
    ctx.fillStyle = '#000';
    const eyeX = player.direction > 0 ? player.x + player.width - 10 : player.x + 10;
    ctx.fillRect(eyeX, player.y + 10, 5, 5);
    
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`LIVES: ${gameState.lives}`, 20, 30);
    ctx.fillText(`SCORE: ${gameState.score}`, 20, 60);
    ctx.fillText(`LEVEL: ${gameState.level}`, 20, 90);
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

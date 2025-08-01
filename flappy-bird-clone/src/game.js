const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird;
let pipes = [];
let score = 0;
let gameActive = false;
let frames = 0; 

function startGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameActive) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    bird.update();

    if (frames % 75 === 0) {
        pipes.push(new Pipe());
    }

    pipes.forEach(pipe => {
        pipe.update();
        if (pipe.offscreen()) {
            pipes.shift();
            score++;
        }
        if (pipe.collides(bird)) {
            gameOver();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw(ctx);
    pipes.forEach(pipe => pipe.draw(ctx));

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function gameOver() {
    gameActive = false;
    alert(`Game Over! Your score: ${score}`);
}

document.addEventListener('keydown', () => {
    if (gameActive) {
        bird.flap();
    } else {
        startGame();
    }
});

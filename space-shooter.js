class SpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameActive = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.enemiesDestroyed = 0;
        
       
        this.player = { x: 400, y: 550, width: 30, height: 30, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        
        
        this.enemySpawnRate = 0.02;
        this.bulletSpeed = 8;
        this.enemySpeed = 2;
        this.enemyBulletSpeed = 3;
        
       
        this.mouseX = 400;
        this.mouseY = 550;
        
        this.init();
    }
    
    init() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameActive) this.shoot();
        });
        
        this.showStartScreen();
    }
    
    showStartScreen() {
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    showGameOverScreen() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('gameOverlay').style.display = 'flex';
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTime').textContent = this.gameTime;
        document.getElementById('finalEnemies').textContent = this.enemiesDestroyed;
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.enemiesDestroyed = 0;
        
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        
        document.getElementById('gameOverlay').style.display = 'none';
        this.updateDisplay();
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        this.gameTime += 1/60;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        
        this.player.x = this.mouseX;
        this.player.x = Math.max(15, Math.min(785, this.player.x));
        
        
        this.bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });
        
        
        this.enemyBullets.forEach((bullet, index) => {
            bullet.y += bullet.speed;
            if (bullet.y > 600) {
                this.enemyBullets.splice(index, 1);
            }
        });
        
      
        this.enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            if (enemy.y > 600) {
                this.enemies.splice(index, 1);
                this.lives--;
                this.updateDisplay();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
     
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        if (Math.random() < this.enemySpawnRate) {
            this.spawnEnemy();
        }
        
        
        this.enemies.forEach(enemy => {
            if (Math.random() < 0.005) {
                this.enemyShoot(enemy);
            }
        });
        
        
        this.checkCollisions();
        
        this.updateDisplay();
    }
    
    draw() {
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 800, 600);
        
       
        this.drawStars();
        
      
        this.drawPlayer();
        
        
        this.bullets.forEach(bullet => this.drawBullet(bullet));
        
       
        this.enemyBullets.forEach(bullet => this.drawEnemyBullet(bullet));
        
     
        this.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        
        this.particles.forEach(particle => this.drawParticle(particle));
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % 800;
            const y = (i * 23) % 600;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x - 15, this.player.y - 15, 30, 30);
        
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x - 10, this.player.y - 5, 20, 10);
        this.ctx.fillRect(this.player.x - 5, this.player.y - 10, 10, 20);
    }
    
    drawBullet(bullet) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
    }
    
    drawEnemyBullet(bullet) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
    }
    
    drawEnemy(enemy) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
        
        // Draw enemy details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(enemy.x - 10, enemy.y - 5, 20, 10);
        this.ctx.fillRect(enemy.x - 5, enemy.y - 10, 10, 20);
    }
    
    drawParticle(particle) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.life / 30})`;
        this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - 15,
            speed: this.bulletSpeed
        });
    }
    
    enemyShoot(enemy) {
        this.enemyBullets.push({
            x: enemy.x,
            y: enemy.y + 15,
            speed: this.enemyBulletSpeed
        });
    }
    
    spawnEnemy() {
        this.enemies.push({
            x: Math.random() * 700 + 50,
            y: -30,
            speed: this.enemySpeed + Math.random() * 2
        });
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30
            });
        }
    }
    
    checkCollisions() {
        // Bullet vs Enemy
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.score += 10;
                    this.enemiesDestroyed++;
                    this.createExplosion(enemy.x, enemy.y);
                }
            });
        });
        
       
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.checkCollision(bullet, this.player)) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                this.createExplosion(this.player.x, this.player.y);
                this.updateDisplay();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.checkCollision(enemy, this.player)) {
                this.enemies.splice(enemyIndex, 1);
                this.lives--;
                this.createExplosion(this.player.x, this.player.y);
                this.updateDisplay();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + 30 &&
               obj1.x + 4 > obj2.x &&
               obj1.y < obj2.y + 30 &&
               obj1.y + 16 > obj2.y;
    }
    
    gameOver() {
        this.gameActive = false;
        this.showGameOverScreen();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = Math.floor(this.gameTime);
        document.getElementById('lives').textContent = this.lives;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new SpaceShooter();
}); 
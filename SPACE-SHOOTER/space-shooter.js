class SpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameActive = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.enemiesDestroyed = 0;
        
        // Game objects
        this.player = { x: 400, y: 550, width: 30, height: 30, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.powerUps = [];
        
        // Game settings
        this.enemySpawnRate = 0.01; 
        this.bulletSpeed = 10;
        this.enemySpeed = 1.5; 
        this.enemyBulletSpeed = 2; 
        this.maxEnemies = 8; 
        this.powerUpSpawnRate = 0.001; 
        
        // Player upgrades
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.shield = false;
        this.shieldTimer = 0;
        
        // Mouse tracking
        this.mouseX = 400;
        this.mouseY = 550;
        this.canvasRect = null;
        
        this.init();
    }
    
    init() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.canvasRect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - this.canvasRect.left;
            this.mouseY = e.clientY - this.canvasRect.top;
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
        document.getElementById('finalTime').textContent = Math.floor(this.gameTime);
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
        this.powerUps = [];
        
        // Reset player upgrades
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.shield = false;
        this.shieldTimer = 0;
        
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
        // Update player position
        this.player.x = this.mouseX;
        this.player.x = Math.max(15, Math.min(785, this.player.x));
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].y += this.enemyBullets[i].speed;
            if (this.enemyBullets[i].y > 600) {
                this.enemyBullets.splice(i, 1);
            }
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].y += this.enemies[i].speed;
            if (this.enemies[i].y > 600) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateDisplay();
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].y += 2;
            if (this.powerUps[i].y > 600) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].x += this.particles[i].vx;
            this.particles[i].y += this.particles[i].vy;
            this.particles[i].life--;
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update power-up timers
        if (this.rapidFire) {
            this.rapidFireTimer--;
            if (this.rapidFireTimer <= 0) {
                this.rapidFire = false;
            }
        }
        
        if (this.shield) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shield = false;
            }
        }
        
        // Spawn enemies
        if (this.enemies.length < this.maxEnemies && Math.random() < this.enemySpawnRate) {
            this.spawnEnemy();
        }
        
        // Spawn power-ups
        if (Math.random() < this.powerUpSpawnRate) {
            this.spawnPowerUp();
        }
        
        // Enemy shooting
        this.enemies.forEach(enemy => {
            if (Math.random() < 0.003) { 
                this.enemyShoot(enemy);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        this.updateDisplay();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Draw stars
        this.drawStars();
        
        // Draw player
        this.drawPlayer();
        
        // Draw bullets
        this.bullets.forEach(bullet => this.drawBullet(bullet));
        
        // Draw enemy bullets
        this.enemyBullets.forEach(bullet => this.drawEnemyBullet(bullet));
        
        // Draw enemies
        this.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw shield effect
        if (this.shield) {
            this.drawShield();
        }
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
        // Player body
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x - 15, this.player.y - 15, 30, 30);
        
        // Player details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x - 10, this.player.y - 5, 20, 10);
        this.ctx.fillRect(this.player.x - 5, this.player.y - 10, 10, 20);
        
        // Player glow effect
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x - 15, this.player.y - 15, 30, 30);
    }
    
    drawShield() {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 30, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawBullet(bullet) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
        
        // Bullet glow
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bullet.x - 2, bullet.y - 8, 4, 16);
    }
    
    drawEnemyBullet(bullet) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
        
        // Bullet glow
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bullet.x - 2, bullet.y - 8, 4, 16);
    }
    
    drawEnemy(enemy) {
        // Enemy body
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
        
        // Enemy details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(enemy.x - 10, enemy.y - 5, 20, 10);
        this.ctx.fillRect(enemy.x - 5, enemy.y - 10, 10, 20);
        
        // Enemy glow effect
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(enemy.x - 15, enemy.y - 15, 30, 30);
    }
    
    drawPowerUp(powerUp) {
        const size = 20;
        this.ctx.fillStyle = powerUp.type === 'rapidFire' ? '#ffff00' : '#00ffff';
        this.ctx.fillRect(powerUp.x - size/2, powerUp.y - size/2, size, size);
        
        // Power-up glow
        this.ctx.strokeStyle = powerUp.type === 'rapidFire' ? '#ffff00' : '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(powerUp.x - size/2, powerUp.y - size/2, size, size);
        
        // Power-up symbol
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(powerUp.type === 'rapidFire' ? 'R' : 'S', powerUp.x, powerUp.y + 5);
    }
    
    drawParticle(particle) {
        const alpha = particle.life / 30;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - 15,
            speed: this.bulletSpeed
        });
        
        // Rapid fire mode
        if (this.rapidFire) {
            setTimeout(() => {
                if (this.gameActive) {
                    this.bullets.push({
                        x: this.player.x,
                        y: this.player.y - 15,
                        speed: this.bulletSpeed
                    });
                }
            }, 100);
        }
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
            speed: this.enemySpeed + Math.random() * 1
        });
    }
    
    spawnPowerUp() {
        const types = ['rapidFire', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push({
            x: Math.random() * 700 + 50,
            y: -20,
            type: type
        });
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30
            });
        }
    }
    
    checkCollisions() {
        // Bullet vs Enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[i], this.enemies[j])) {
                    // Store enemy position before removing it
                    const enemyX = this.enemies[j].x;
                    const enemyY = this.enemies[j].y;
                    
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    this.enemiesDestroyed++;
                    this.createExplosion(enemyX, enemyY);
                    break; 
                }
            }
        }
        
    
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.enemyBullets[i], this.player)) {
                this.enemyBullets.splice(i, 1);
                if (!this.shield) {
                    this.lives--;
                    this.createExplosion(this.player.x, this.player.y);
                    this.updateDisplay();
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
       
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.enemies[i], this.player)) {
                this.enemies.splice(i, 1);
                if (!this.shield) {
                    this.lives--;
                    this.createExplosion(this.player.x, this.player.y);
                    this.updateDisplay();
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
      
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.powerUps[i], this.player)) {
                const powerUp = this.powerUps.splice(i, 1)[0];
                if (powerUp.type === 'rapidFire') {
                    this.rapidFire = true;
                    this.rapidFireTimer = 300; 
                } else if (powerUp.type === 'shield') {
                    this.shield = true;
                    this.shieldTimer = 300; 
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        // Improved collision detection
        const margin = 5; 
        return obj1.x < obj2.x + obj2.width + margin &&
               obj1.x + 4 > obj2.x - margin &&
               obj1.y < obj2.y + obj2.height + margin &&
               obj1.y + 16 > obj2.y - margin;
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpaceShooter();
}); 
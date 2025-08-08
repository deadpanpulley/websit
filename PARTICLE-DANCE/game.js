
const config = {
    particleCount: 100,
    particleSize: 3,
    mouseInfluence: 0.2,
    mouseRadius: 100,
    friction: 0.95,
    colors: [
        ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
        ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA'],
        ['#F8BBD0', '#F06292', '#EC407A', '#E91E63', '#D81B60'],
        ['#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50']
    ]
};


let canvas, ctx;
let particles = [];
let colorTheme = 0;
let mouse = { x: 0, y: 0, isDown: false };

class Particle {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x || Math.random() * canvas.width;
        this.baseY = this.y || Math.random() * canvas.height;
        this.density = (Math.random() * 30) + 1;
        this.color = config.colors[colorTheme][Math.floor(Math.random() * config.colors[colorTheme].length)];
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let directionX = dx / distance;
        let directionY = dy / distance;
        
        let maxDistance = mouse.isDown ? 300 : config.mouseRadius;
        let force = (maxDistance - distance) / maxDistance;
        
        if (force < 0) force = 0;
        
       
        let directionForce = force * config.mouseInfluence * this.density;
        this.x = this.x + (directionX * directionForce);
        this.y = this.y + (directionY * directionForce);
        
        
        let dx2 = this.baseX - this.x;
        let dy2 = this.baseY - this.y;
        this.x += dx2 * 0.1;
        this.y += dy2 * 0.1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
   
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mousedown', () => {
        mouse.isDown = true;
        createRipple();
    });
    
    canvas.addEventListener('mouseup', () => {
        mouse.isDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = -100;
        mouse.y = -100;
    });
    
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            colorTheme = (colorTheme + 1) % config.colors.length;
            particles.forEach(particle => particle.reset());
        }
    });
    
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
    }, false);
    
    canvas.addEventListener('touchend', () => {
        mouse.x = -100;
        mouse.y = -100;
    });
    
    
    animate();
}

function createRipple() {
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100 + 50;
        const particle = new Particle();
        particle.x = mouse.x + Math.cos(angle) * radius;
        particle.y = mouse.y + Math.sin(angle) * radius;
        particles.push(particle);
        
        
        if (particles.length > config.particleCount * 1.5) {
            particles.shift();
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function animate() {
    
    ctx.fillStyle = 'rgba(18, 18, 18, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
   
    connectParticles();
    
    requestAnimationFrame(animate);
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const opacity = 1 - (distance / 100);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}


window.onload = init;
class Pipe {
    constructor(x, width, gap) {
        this.x = x;
        this.width = width;
        this.gap = gap;
        this.height = Math.floor(Math.random() * (canvas.height - gap));
        this.passed = false; // To track if the bird has passed the pipe
    }

    update(speed) {
        this.x -= speed;
    }

    draw(ctx) {
        ctx.fillStyle = '#008000'; // Green color for the pipe
        ctx.fillRect(this.x, 0, this.width, this.height); // Top pipe
        ctx.fillRect(this.x, this.height + this.gap, this.width, canvas.height); // Bottom pipe
    }

    checkCollision(bird) {
        // Check for collision with the pipes
        if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
            if (bird.y < this.height || bird.y + bird.height > this.height + this.gap) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }
}
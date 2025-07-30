class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 34; // Width of the bird image
        this.height = 24; // Height of the bird image
        this.gravity = 0.6; // Gravity effect
        this.lift = -15; // Lift effect when flapping
        this.velocity = 0; // Initial velocity
    }

    update() {
        this.velocity += this.gravity; // Apply gravity
        this.y += this.velocity; // Update position based on velocity

        // Prevent the bird from going off the canvas
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0; // Reset velocity
        }

        if (this.y < 0) {
            this.y = 0; // Prevent going above the canvas
            this.velocity = 0; // Reset velocity
        }
    }

    flap() {
        this.velocity += this.lift; // Apply lift when flapping
    }

    render(ctx) {
        ctx.fillStyle = '#FFCC00'; // Color of the bird
        ctx.fillRect(this.x, this.y, this.width, this.height); // Draw the bird
    }
}

export default Bird;
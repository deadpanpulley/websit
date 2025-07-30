function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawText(ctx, text, x, y, font = '20px Arial', color = '#000') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
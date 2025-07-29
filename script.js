class ToiletPaperDash {
    constructor() {
        this.gameActive = false;
        this.timeLeft = 10;
        this.sheetsUnrolled = 0;
        this.rips = 0;
        this.gameTimer = null;
        this.ripChance = 0.1; 
        
        this.elements = {
            timeLeft: document.getElementById('timeLeft'),
            sheetsUnrolled: document.getElementById('sheetsUnrolled'),
            rips: document.getElementById('rips'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            results: document.getElementById('results'),
            finalSheets: document.getElementById('finalSheets'),
            finalRips: document.getElementById('finalRips'),
            efficiency: document.getElementById('efficiency'),
            memeMessage: document.getElementById('memeMessage'),
            mashZone: document.getElementById('mashZone'),
            paperSheets: document.getElementById('paperSheets'),
            paperTrail: document.getElementById('paperTrail'),
            particles: document.getElementById('particles')
        };
        
        this.sounds = {
            unroll: this.createSound(200, 'sine', 0.1),
            rip: this.createSound(150, 'sawtooth', 0.2),
            click: this.createSound(300, 'square', 0.05),
            gameOver: this.createSound(100, 'triangle', 0.3)
        };
        
        this.init();
    }
    
    init() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.mashZone.addEventListener('click', () => this.handleClick());
        this.elements.mashZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick();
        });
        
        // Prevent context menu on right click
        this.elements.mashZone.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    createSound(frequency, type, duration) {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (e) {
                console.log('Sound effect played');
            }
        };
    }
                 
    startGame() {
        this.gameActive = true;
        this.timeLeft = 10;
        this.sheetsUnrolled = 0;
        this.rips = 0;
        
        this.elements.startBtn.style.display = 'none';
        this.elements.resetBtn.style.display = 'none';
        this.elements.results.style.display = 'none';
        
        this.updateDisplay();
        this.startTimer();
        
        
        this.createParticles(this.elements.mashZone, 10);
        this.sounds.click();
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    handleClick() {
        if (!this.gameActive) return;
        
        this.sheetsUnrolled++;
        
     
        if (Math.random() < this.ripChance) {
            this.handleRip();
        } else {
            this.handleUnroll();
        }
        
        this.updateDisplay();
        this.createParticles(this.elements.mashZone, 5);
        
        this.elements.mashZone.style.transform = 'translateX(-50%) scale(0.95)';
        setTimeout(() => {
            this.elements.mashZone.style.transform = 'translateX(-50%) scale(1)';
        }, 100);
    }
    
    handleUnroll() {
        this.sounds.unroll();
        this.createPaperSheet();
        this.elements.paperSheets.classList.add('shrinking');
        setTimeout(() => {
            this.elements.paperSheets.classList.remove('shrinking');
        }, 300);
    }
    
    handleRip() {
        this.rips++;
        this.sounds.rip();
        
        
        this.createRipEffect();
        
        
        this.showTemporaryMessage(" OH NO! IT RIPPED! ", '#ff0000');
        
   
        this.elements.mashZone.parentElement.classList.add('game-over');
        
        
        setTimeout(() => {
            this.endGameWithRip();
        }, 1000);
    }
    
    createPaperSheet() {
        const sheet = document.createElement('div');
        sheet.className = 'paper-sheet';
        sheet.style.setProperty('--rotation', `${Math.random() * 360}deg`);
        sheet.style.left = `${Math.random() * 140}px`;
        
        this.elements.paperTrail.appendChild(sheet);
        
        setTimeout(() => {
            if (sheet.parentNode) {
                sheet.parentNode.removeChild(sheet);
            }
        }, 2000);
    }
    
    createRipEffect() {
        const rip = document.createElement('div');
        rip.className = 'rip-effect';
        rip.style.left = `${Math.random() * 300}px`;
        rip.style.top = `${Math.random() * 150}px`;
        
        this.elements.mashZone.appendChild(rip);
        
        setTimeout(() => {
            if (rip.parentNode) {
                rip.parentNode.removeChild(rip);
            }
        }, 500);
    }
    
    createParticles(element, count) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${rect.left + Math.random() * rect.width}px`;
            particle.style.top = `${rect.top + Math.random() * rect.height}px`;
            
            this.elements.particles.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    showTemporaryMessage(message, color) {
        const tempMessage = document.createElement('div');
        tempMessage.textContent = message;
        tempMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: ${color};
            padding: 30px;
            border-radius: 15px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 2000;
            animation: fadeInOut 3s ease-in-out;
            border: 3px solid ${color};
        `;
        
        document.body.appendChild(tempMessage);
        
        setTimeout(() => {
            if (tempMessage.parentNode) {
                tempMessage.parentNode.removeChild(tempMessage);
            }
        }, 3000);
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        this.sounds.gameOver();
        
        this.elements.startBtn.style.display = 'none';
        this.elements.resetBtn.style.display = 'inline-block';
        this.elements.results.style.display = 'block';
        
        this.showResults();
    }
    
    endGameWithRip() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        this.sounds.gameOver();
        
        this.elements.startBtn.style.display = 'none';
        this.elements.resetBtn.style.display = 'inline-block';
        this.elements.results.style.display = 'block';
        
        this.showRipResults();
    }
    
    showResults() {
        this.elements.finalSheets.textContent = this.sheetsUnrolled;
        this.elements.finalRips.textContent = this.rips;
        this.elements.efficiency.textContent = `${this.sheetsUnrolled} sheets!`;
        
        // Simple kid-friendly messages
        let memeMessage;
        if (this.sheetsUnrolled >= 20) {
            memeMessage = "YAY! YOU DID GREAT! ";
        } else if (this.sheetsUnrolled >= 10) {
            memeMessage = " GOOD JOB! ";
        } else {
            memeMessage = "NICE TRY! ";
        }
        
        this.elements.memeMessage.textContent = memeMessage;
        
        this.createParticles(document.body, 20);
    }
    
    showRipResults() {
        this.elements.finalSheets.textContent = this.sheetsUnrolled;
        this.elements.finalRips.textContent = this.rips;
        this.elements.efficiency.textContent = "GAME OVER!";
        
        
        this.elements.memeMessage.textContent = " YOU LOSE! THE PAPER RIPPED! ";
        this.elements.memeMessage.style.color = '#ff0000';
        this.elements.memeMessage.style.fontSize = '2rem';
        
       
        this.createParticles(document.body, 30);
    }
    
    resetGame() {
        this.gameActive = false;
        this.timeLeft = 10;
        this.sheetsUnrolled = 0;
        this.rips = 0;
        
        clearInterval(this.gameTimer);
        
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.resetBtn.style.display = 'none';
        this.elements.results.style.display = 'none';
        
      
        this.elements.memeMessage.style.color = '#ff4757';
        this.elements.memeMessage.style.fontSize = '1.5rem';
        
       
        this.elements.paperTrail.innerHTML = '';
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.elements.timeLeft.textContent = this.timeLeft;
        this.elements.sheetsUnrolled.textContent = this.sheetsUnrolled;
        this.elements.rips.textContent = this.rips;
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);


document.addEventListener('DOMContentLoaded', () => {
    new ToiletPaperDash();
}); 

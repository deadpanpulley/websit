class RetroEmulator {
    constructor() {
        this.currentGame = 0;
        this.games = [
            { name: 'tetris', file: 'TETRIS/tetris.html', icon: '', title: 'TETRIS' },
            { name: 'flappy-bird', file: 'FLAPPY BIRD/flappy-bird.html', icon: '', title: 'FLAPPY BIRD' },
            { name: 'space-shooter', file: 'SPACE-SHOOTER/space-shooter.html', icon: '', title: 'SPACE SHOOTER' },
            { name: 'toilet-paper', file: 'TOILET/game.html', icon: '', title: 'TOILET PAPER DASH' },
            { name: 'donkey-kong', file: 'DONKEY-KONG/index.html', icon: '', title: 'DONKEY KONG' }
        ];
        this.isGameRunning = false;
        this.currentGameFrame = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateGameCounter();
        this.loadSettings();
        this.addScanlines();
    }

    bindEvents() {
        
        document.getElementById('prevBtn').addEventListener('click', () => this.navigate(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.navigate(1));
        
        
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('closeGame').addEventListener('click', () => this.closeGame());
        
        
        document.querySelectorAll('.game-card').forEach((card, index) => {
            card.addEventListener('click', () => this.selectGame(index));
        });
        
        
        document.getElementById('crtEffect').addEventListener('change', (e) => this.toggleCRTEffect(e.target.checked));
        document.getElementById('scanlines').addEventListener('change', (e) => this.toggleScanlines(e.target.checked));
        document.getElementById('volume').addEventListener('input', (e) => this.setVolume(e.target.value));
        
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    navigate(direction) {
        this.currentGame = (this.currentGame + direction + this.games.length) % this.games.length;
        this.updateGameSelection();
        this.updateGameCounter();
    }

    selectGame(index) {
        this.currentGame = index;
        this.updateGameSelection();
        this.updateGameCounter();
    }

    updateGameSelection() {
        document.querySelectorAll('.game-card').forEach((card, index) => {
            card.classList.toggle('active', index === this.currentGame);
        });
    }

    updateGameCounter() {
        document.getElementById('gameCounter').textContent = `${this.currentGame + 1}/${this.games.length}`;
    }

    startGame() {
        if (this.isGameRunning) return;
        
        const game = this.games[this.currentGame];
        const gameFrame = document.getElementById('gameFrame');
        const gameIframe = document.getElementById('gameIframe');
        
        
        this.showLoading();
        
       
        this.playBootSequence();
        
        
        gameIframe.src = game.file;
        
        
        gameFrame.style.display = 'block';
        gameFrame.style.animation = 'bootUp 0.5s ease-out';
        
        document.querySelector('.display-status').textContent = `LOADING ${game.title}...`;
        
        this.isGameRunning = true;
        this.currentGameFrame = gameFrame;
        
        
        this.addCRTStartupEffect();
        
        
        setTimeout(() => {
            this.hideLoading();
            document.querySelector('.display-status').textContent = `${game.title} RUNNING`;
        }, 1500);
    }

    pauseGame() {
        if (!this.isGameRunning) return;
        
        
        console.log('Pause game - would need game-specific implementation');
    }

    resetGame() {
        if (!this.isGameRunning) return;
        
        
        const gameIframe = document.getElementById('gameIframe');
        gameIframe.src = gameIframe.src;
    }

    closeGame() {
        if (!this.isGameRunning) return;
        
        const gameFrame = document.getElementById('gameFrame');
        const gameIframe = document.getElementById('gameIframe');
        
        
        gameIframe.src = '';
        
        
        gameFrame.style.display = 'none';
        
        
        document.querySelector('.display-status').textContent = 'NO GAME LOADED';
        
        this.isGameRunning = false;
        this.currentGameFrame = null;
    }

    showLoading() {
        const displayContent = document.querySelector('.display-content');
        displayContent.innerHTML = `
            <div class="loading-screen">
                <h2 style="color: #00ff00; text-shadow: 0 0 10px #00ff00; font-family: 'Courier New', monospace;">
                     SYSTEM BOOT SEQUENCE 
                </h2>
                <div style="margin: 20px 0; color: #00ff00; font-family: 'Courier New', monospace;">
                    <p>INITIALIZING GAME ENGINE...</p>
                    <p>LOADING ASSETS...</p>
                    <p>ESTABLISHING CONNECTION...</p>
                </div>
                <div class="loading-animation">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
    }

    hideLoading() {
        const displayContent = document.querySelector('.display-content');
        displayContent.innerHTML = `
            <div class="welcome-screen">
                <h2> RETRO GAME STATION </h2>
                <p>Select a game from the library to begin</p>
                <div class="loading-animation">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
    }

    toggleCRTEffect(enabled) {
        const container = document.querySelector('.emulator-container');
        if (enabled) {
            container.classList.remove('crt-effect-off');
        } else {
            container.classList.add('crt-effect-off');
        }
        this.saveSettings();
    }

    toggleScanlines(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.remove('scanlines-off');
        } else {
            body.classList.add('scanlines-off');
        }
        this.saveSettings();
    }

    setVolume(value) {
        
        console.log('Volume set to:', value);
        this.saveSettings();
    }

    addScanlines() {
        const scanlines = document.createElement('div');
        scanlines.className = 'scanlines';
        document.body.appendChild(scanlines);
        
        
        const crtShader = document.createElement('div');
        crtShader.className = 'crt-shader';
        document.body.appendChild(crtShader);
        
       
        const phosphorEffect = document.createElement('div');
        phosphorEffect.className = 'phosphor-effect';
        document.body.appendChild(phosphorEffect);
    }

    playBootSequence() {
        
        console.log(' BOOT SEQUENCE INITIATED');
        
      
        const bootEffect = document.createElement('div');
        bootEffect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #00ff00;
            z-index: 3000;
            opacity: 0.3;
            animation: bootFlash 0.3s ease-out;
        `;
        document.body.appendChild(bootEffect);
        
        setTimeout(() => {
            document.body.removeChild(bootEffect);
        }, 300);
    }

    addCRTStartupEffect() {
        
        const crtEffect = document.createElement('div');
        crtEffect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(transparent 50%, rgba(0, 255, 0, 0.1) 50%),
                radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
            background-size: 100% 2px, 100% 100%;
            z-index: 2001;
            animation: crtStartup 1s ease-out;
            pointer-events: none;
        `;
        document.body.appendChild(crtEffect);
        
        
        const powerEffect = document.createElement('div');
        powerEffect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(0, 255, 0, 0.8) 0%, transparent 70%);
            z-index: 2002;
            animation: powerOn 0.8s ease-out;
            pointer-events: none;
        `;
        document.body.appendChild(powerEffect);
        
        setTimeout(() => {
            document.body.removeChild(crtEffect);
            document.body.removeChild(powerEffect);
        }, 1000);
    }

    handleKeyboard(event) {
        switch (event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.navigate(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.navigate(1);
                break;
            case 'Enter':
            case 'Space':
                event.preventDefault();
                if (!this.isGameRunning) {
                    this.startGame();
                }
                break;
            case 'Escape':
                if (this.isGameRunning) {
                    this.closeGame();
                }
                break;
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('retroEmulatorSettings') || '{}');
        
        if (settings.crtEffect !== undefined) {
            document.getElementById('crtEffect').checked = settings.crtEffect;
            this.toggleCRTEffect(settings.crtEffect);
        }
        
        if (settings.scanlines !== undefined) {
            document.getElementById('scanlines').checked = settings.scanlines;
            this.toggleScanlines(settings.scanlines);
        }
        
        if (settings.volume !== undefined) {
            document.getElementById('volume').value = settings.volume;
            this.setVolume(settings.volume);
        }
    }

    saveSettings() {
        const settings = {
            crtEffect: document.getElementById('crtEffect').checked,
            scanlines: document.getElementById('scanlines').checked,
            volume: document.getElementById('volume').value
        };
        localStorage.setItem('retroEmulatorSettings', JSON.stringify(settings));
    }
}


window.addEventListener('load', () => {
    new RetroEmulator();
});
   
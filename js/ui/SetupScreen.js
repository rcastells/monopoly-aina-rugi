// Setup Screen for Disney Monopoly
import { TOKENS, renderToken } from '../data/tokens.js';
import { GAME_MODES, createCustomConfig } from '../data/gameModes.js';

class SetupScreen {
    constructor() {
        this.selectedMode = 'classic';
        this.playerCount = 0;
        this.playerSelections = {};
        this.gameConfig = { ...GAME_MODES.classic };
        this.onGameStart = null;
    }

    init() {
        this.setupModeButtons();
        this.setupConfigSliders();
        this.setupPlayerCountButtons();
        this.setupStartButton();
    }

    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectGameMode(btn.dataset.mode);
            });
        });
    }

    selectGameMode(mode) {
        this.selectedMode = mode;
        const customConfig = document.getElementById('custom-config');

        if (mode === 'custom') {
            customConfig?.classList.add('visible');
            this.updateCustomConfig();
        } else {
            customConfig?.classList.remove('visible');
            this.gameConfig = { ...GAME_MODES[mode] };
        }
        this.updateConfigSummary();
    }

    setupConfigSliders() {
        const moneySlider = document.getElementById('cfg-money');
        const goSlider = document.getElementById('cfg-go');
        const turnsSlider = document.getElementById('cfg-turns');
        const timeSlider = document.getElementById('cfg-time');

        moneySlider?.addEventListener('input', () => {
            document.getElementById('cfg-money-value').textContent = moneySlider.value + '€';
            this.updateCustomConfig();
        });

        goSlider?.addEventListener('input', () => {
            document.getElementById('cfg-go-value').textContent = goSlider.value + '€';
            this.updateCustomConfig();
        });

        turnsSlider?.addEventListener('input', () => {
            const val = parseInt(turnsSlider.value);
            document.getElementById('cfg-turns-value').textContent = val === 0 ? 'Sense limit' : val + ' torns';
            this.updateCustomConfig();
        });

        timeSlider?.addEventListener('input', () => {
            const val = parseInt(timeSlider.value);
            document.getElementById('cfg-time-value').textContent = val === 0 ? 'Sense limit' : val + ' minuts';
            this.updateCustomConfig();
        });

        // Toggle for auctions
        const auctionToggle = document.getElementById('cfg-auctions');
        auctionToggle?.addEventListener('click', () => {
            auctionToggle.classList.toggle('active');
            const isActive = auctionToggle.classList.contains('active');
            auctionToggle.dataset.value = isActive;
            const label = auctionToggle.nextElementSibling;
            if (label) label.textContent = isActive ? 'Activades' : 'Desactivades';
            this.updateCustomConfig();
        });

        // Initial properties select
        const propsSelect = document.getElementById('cfg-initial-props');
        propsSelect?.addEventListener('change', () => this.updateCustomConfig());
    }

    updateCustomConfig() {
        this.gameConfig = createCustomConfig({
            startingMoney: parseInt(document.getElementById('cfg-money')?.value || 1500),
            goReward: parseInt(document.getElementById('cfg-go')?.value || 200),
            maxTurns: parseInt(document.getElementById('cfg-turns')?.value || 0),
            timeLimit: parseInt(document.getElementById('cfg-time')?.value || 0),
            initialProperties: parseInt(document.getElementById('cfg-initial-props')?.value || 0),
            auctionsEnabled: document.getElementById('cfg-auctions')?.classList.contains('active') ?? true
        });
        this.updateConfigSummary();
    }

    updateConfigSummary() {
        const summary = document.getElementById('config-summary');
        if (!summary) return;

        const badges = [];
        badges.push(`💰 ${this.gameConfig.startingMoney}€`);
        badges.push(`🏁 Sortida: ${this.gameConfig.goReward}€`);

        if (this.gameConfig.maxTurns > 0) {
            badges.push(`🔄 ${this.gameConfig.maxTurns} torns`);
        }
        if (this.gameConfig.timeLimit > 0) {
            badges.push(`⏱️ ${this.gameConfig.timeLimit} min`);
        }
        if (this.gameConfig.initialProperties > 0) {
            badges.push(`🏠 ${this.gameConfig.initialProperties} propietats`);
        }
        badges.push(this.gameConfig.auctionsEnabled ? '🔨 Subhastes' : '❌ Sense subhastes');

        summary.innerHTML = badges.map(b => `<span class="config-badge">${b}</span>`).join('');
    }

    setupPlayerCountButtons() {
        const countButtons = document.querySelectorAll('.player-count button');
        countButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                countButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.showPlayerInputs(parseInt(btn.dataset.count));
            });
        });
    }

    showPlayerInputs(count) {
        this.playerCount = count;
        this.playerSelections = {};

        const container = document.getElementById('player-setup');
        if (!container) return;

        container.classList.add('visible');
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input-row';
            playerDiv.innerHTML = `
                <div class="player-input-header">
                    <span class="player-label">Jugador ${i + 1}</span>
                    <input type="text" id="player-name-${i}" placeholder="Nom del jugador..." maxlength="15">
                    <div class="selected-avatar-display empty" id="selected-avatar-${i}">
                        Escull avatar ↓
                    </div>
                </div>
                <p class="gallery-label">Escull el teu personatge:</p>
                <div class="avatar-gallery" id="gallery-${i}">
                    ${TOKENS.map((token, tokenIndex) => `
                        <div class="avatar-option" data-player="${i}" data-token="${tokenIndex}">
                            ${token.image
                                ? `<img src="${token.image}" alt="${token.name}">`
                                : `<span class="emoji">${token.emoji}</span>`
                            }
                            <span class="avatar-name">${token.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(playerDiv);
        }

        // Add click handlers for avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => this.handleAvatarSelection(option));
        });

        this.updateStartButton();
    }

    handleAvatarSelection(option) {
        const playerIndex = parseInt(option.dataset.player);
        const tokenIndex = parseInt(option.dataset.token);

        if (option.classList.contains('taken')) return;

        const token = TOKENS[tokenIndex];

        // Remove previous selection for this player
        if (this.playerSelections[playerIndex] !== undefined) {
            const prevToken = this.playerSelections[playerIndex];
            document.querySelectorAll(`.avatar-option[data-token="${prevToken}"]`).forEach(el => {
                el.classList.remove('taken', 'selected');
            });
        }

        // Mark new selection
        this.playerSelections[playerIndex] = tokenIndex;

        // Update all galleries to show this token as taken
        document.querySelectorAll(`.avatar-option[data-token="${tokenIndex}"]`).forEach(el => {
            const isThisPlayer = parseInt(el.dataset.player) === playerIndex;
            el.classList.toggle('selected', isThisPlayer);
            el.classList.toggle('taken', !isThisPlayer);
        });

        // Update the selected avatar display
        const display = document.getElementById(`selected-avatar-${playerIndex}`);
        if (display) {
            display.classList.remove('empty');
            display.innerHTML = `
                ${token.image
                    ? `<img src="${token.image}" alt="${token.name}">`
                    : `<span style="font-size: 1.5rem">${token.emoji}</span>`
                }
                <span class="avatar-name">${token.name}</span>
            `;
        }

        this.updateStartButton();
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-game');
        if (!startBtn) return;

        // Check if all players have selected an avatar
        const allSelected = this.playerCount > 0 &&
            Object.keys(this.playerSelections).length === this.playerCount;

        startBtn.classList.toggle('visible', allSelected);
    }

    setupStartButton() {
        const startBtn = document.getElementById('start-game');
        startBtn?.addEventListener('click', () => this.startGame());
    }

    startGame() {
        if (Object.keys(this.playerSelections).length !== this.playerCount) return;

        // Collect player data
        const players = [];
        for (let i = 0; i < this.playerCount; i++) {
            const nameInput = document.getElementById(`player-name-${i}`);
            const name = nameInput?.value.trim() || `Jugador ${i + 1}`;
            const tokenIndex = this.playerSelections[i];
            const token = TOKENS[tokenIndex];

            players.push({
                name,
                token,
                money: this.gameConfig.startingMoney,
                position: 0,
                properties: [],
                inJail: false,
                jailTurns: 0,
                bankrupt: false,
                getOutOfJailCards: 0
            });
        }

        // Hide setup, show game
        document.getElementById('setup-screen')?.classList.add('hidden');
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-screen')?.classList.add('visible');

        // Trigger game start callback
        if (this.onGameStart) {
            this.onGameStart(players, this.gameConfig, this.selectedMode);
        }
    }

    setGameStartHandler(handler) {
        this.onGameStart = handler;
    }

    getGameConfig() {
        return this.gameConfig;
    }
}

// Export singleton instance
export const setupScreen = new SetupScreen();
export default setupScreen;

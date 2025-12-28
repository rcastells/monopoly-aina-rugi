// Main entry point for Disney Monopoly
import { gameEngine } from './game/GameEngine.js';
import { setupScreen } from './ui/SetupScreen.js';
import { boardRenderer } from './ui/BoardRenderer.js';
import { playersPanel } from './ui/PlayersPanel.js';
import { modalManager } from './ui/ModalManager.js';
import { showPanelTab } from './ui/HistoryPanel.js';
import { musicPlayer } from './audio/MusicPlayer.js';
import { SQUARES } from './data/squares.js';

// Initialize the application
function init() {
    console.log('Disney Monopoly - Initializing...');

    // Initialize modal manager
    modalManager.init();

    // Initialize setup screen
    setupScreen.init();

    // Set up game start handler
    setupScreen.setGameStartHandler((players, config, mode) => {
        console.log('Starting game with', players.length, 'players');
        gameEngine.initialize(players, config, mode);
    });

    // Set up board square click handler
    boardRenderer.setSquareClickHandler((square) => {
        showSquareInfo(square);
    });

    // Set up player panel click handler
    playersPanel.setPlayerClickHandler((playerIndex) => {
        // This will be handled by the game engine when needed
        console.log('Player clicked:', playerIndex);
    });

    // Set up music controls
    setupMusicControls();

    // Set up panel tabs
    setupPanelTabs();

    // Set up header buttons
    setupHeaderButtons();

    console.log('Disney Monopoly - Ready!');
}

function showSquareInfo(square) {
    // Show information about the clicked square
    const { showModal, closeModal } = modalManager;

    import('./ui/ModalManager.js').then(({ showModal, closeModal }) => {
        import('./data/squares.js').then(({ PROPERTY_GROUPS }) => {
            const groupInfo = square.group ? PROPERTY_GROUPS[square.group] : null;
            const color = groupInfo?.color || '#607D8B';

            let rentHtml = '';
            if (square.rent) {
                rentHtml = `
                    <div class="rent-info">
                        <h4>Lloguers:</h4>
                        <div class="rent-row"><span>Sense cases:</span><span>${square.rent[0]}€</span></div>
                        <div class="rent-row"><span>1 casa:</span><span>${square.rent[1]}€</span></div>
                        <div class="rent-row"><span>2 cases:</span><span>${square.rent[2]}€</span></div>
                        <div class="rent-row"><span>3 cases:</span><span>${square.rent[3]}€</span></div>
                        <div class="rent-row"><span>4 cases:</span><span>${square.rent[4]}€</span></div>
                        <div class="rent-row"><span>Hotel:</span><span>${square.rent[5]}€</span></div>
                    </div>
                `;
            } else if (square.type === 'station') {
                rentHtml = `
                    <div class="rent-info">
                        <h4>Lloguers:</h4>
                        <div class="rent-row"><span>1 estació:</span><span>25€</span></div>
                        <div class="rent-row"><span>2 estacions:</span><span>50€</span></div>
                        <div class="rent-row"><span>3 estacions:</span><span>100€</span></div>
                        <div class="rent-row"><span>4 estacions:</span><span>200€</span></div>
                    </div>
                `;
            }

            showModal({
                headerHtml: `
                    <div class="property-header" style="background: ${color}">
                        <div class="property-name">${square.name}</div>
                        ${groupInfo ? `<div class="property-movie">${groupInfo.name}</div>` : ''}
                    </div>
                `,
                bodyHtml: `
                    ${square.image ? `<div class="property-large-image"><img src="${square.image}" alt="${square.name}"></div>` : ''}
                    ${square.price ? `<div class="property-price">${square.price}€</div>` : ''}
                    ${rentHtml}
                `,
                landscape: !!square.image,
                buttons: [
                    {
                        text: 'Tancar',
                        class: 'btn-close',
                        action: closeModal
                    }
                ]
            });
        });
    });
}

function setupMusicControls() {
    const musicBtn = document.getElementById('btn-music');
    const musicControls = document.getElementById('music-controls');
    const nowPlaying = document.getElementById('now-playing');
    const volumeSlider = document.getElementById('volume-slider');

    if (musicBtn) {
        musicBtn.addEventListener('click', async () => {
            try {
                const isPlaying = await musicPlayer.toggle();
                musicBtn.classList.toggle('playing', isPlaying);
                musicBtn.innerHTML = isPlaying ? '🎶' : '🎵';
                musicControls?.classList.toggle('visible', isPlaying);
            } catch (err) {
                console.error('Music playback failed:', err);
            }
        });
    }

    // Track change callback
    musicPlayer.onTrackChange = (title) => {
        if (nowPlaying) {
            nowPlaying.textContent = title;
        }
    };

    // Previous/Next track buttons
    const prevBtn = document.querySelector('.music-nav-btn[title="Anterior"]');
    const nextBtn = document.querySelector('.music-nav-btn[title="Següent"]');

    prevBtn?.addEventListener('click', () => musicPlayer.playPrevious());
    nextBtn?.addEventListener('click', () => musicPlayer.playNext());

    // Volume control
    volumeSlider?.addEventListener('input', (e) => {
        musicPlayer.setVolume(parseInt(e.target.value));
    });
}

function setupPanelTabs() {
    const historyTab = document.querySelector('.panel-tab:first-child');
    const statsTab = document.querySelector('.panel-tab:last-child');

    historyTab?.addEventListener('click', () => showPanelTab('history'));
    statsTab?.addEventListener('click', () => showPanelTab('stats'));
}

function setupHeaderButtons() {
    const saveBtn = document.getElementById('btn-save');
    const loadBtn = document.getElementById('btn-load');
    const rulesBtn = document.querySelector('.btn-rules');

    saveBtn?.addEventListener('click', () => saveGame());
    loadBtn?.addEventListener('click', () => loadGame());
    rulesBtn?.addEventListener('click', () => showRules());

    // Check if there's a saved game
    updateLoadButton();
}

function saveGame() {
    import('./game/GameState.js').then(({ gameState }) => {
        const saveData = gameState.toJSON();
        localStorage.setItem('disneyMonopolySave', JSON.stringify(saveData));

        // Show save indicator
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.textContent = '💾 Partida guardada!';
        document.body.appendChild(indicator);

        setTimeout(() => indicator.remove(), 2000);
        updateLoadButton();
    });
}

function loadGame() {
    const saveData = localStorage.getItem('disneyMonopolySave');
    if (!saveData) return;

    try {
        const data = JSON.parse(saveData);

        import('./game/GameState.js').then(({ gameState }) => {
            gameState.fromJSON(data);

            // Hide setup, show game
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('game-screen').classList.add('visible');

            // Re-initialize UI
            import('./ui/BoardRenderer.js').then(({ boardRenderer }) => {
                boardRenderer.render(gameState);
                boardRenderer.updateCenterZoom(gameState);
            });

            import('./ui/PlayersPanel.js').then(({ playersPanel }) => {
                playersPanel.update(gameState);
            });

            // Enable dice if it's a player's turn
            document.getElementById('roll-dice').disabled = gameState.diceRolled;
        });
    } catch (err) {
        console.error('Failed to load game:', err);
    }
}

function updateLoadButton() {
    const loadBtn = document.getElementById('btn-load');
    const hasSave = localStorage.getItem('disneyMonopolySave') !== null;
    if (loadBtn) {
        loadBtn.disabled = !hasSave;
    }
}

function showRules() {
    import('./ui/ModalManager.js').then(({ showModal, closeModal }) => {
        showModal({
            headerHtml: `
                <div class="property-header" style="background: linear-gradient(135deg, #FF9800, #F57C00)">
                    <div class="property-name">📖 Regles del Joc</div>
                </div>
            `,
            bodyHtml: `
                <div class="rules-content">
                    <h4>🎯 Objectiu</h4>
                    <p>Ser l'últim jugador que no hagi quebrat, o tenir més diners quan s'acabi el temps/torns.</p>

                    <h4>🎲 Tirar Daus</h4>
                    <ul>
                        <li>Tira els daus i mou la teva fitxa</li>
                        <li>Si treus dobles, torna a tirar</li>
                        <li>3 dobles seguits = a la presó!</li>
                    </ul>

                    <h4>🏠 Propietats</h4>
                    <ul>
                        <li>Compra propietats quan hi caus</li>
                        <li>Cobra lloguer quan altres hi cauen</li>
                        <li>Amb el color complet, pots construir cases</li>
                    </ul>

                    <h4>🔒 Presó</h4>
                    <ul>
                        <li>Paga 50€ per sortir</li>
                        <li>Usa una targeta de sortida</li>
                        <li>Treu dobles per sortir gratis</li>
                        <li>Després de 3 torns, has de pagar</li>
                    </ul>

                    <h4>💀 Bancarrota</h4>
                    <p>Si no pots pagar, has de vendre propietats o hipotecar-les. Si no pots cobrir el deute, perds!</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Entès!',
                    class: 'btn-close',
                    action: closeModal
                }
            ]
        });
    });
}

// Make showPanelTab available globally for HTML onclick handlers
window.showPanelTab = showPanelTab;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Game Engine for Disney Monopoly
import { gameState } from './GameState.js';
import { cardManager } from './CardManager.js';
import { propertyManager } from './PropertyManager.js';
import { SQUARES, PROPERTY_GROUPS } from '../data/squares.js';
import { BOARD, DELAYS, JAIL } from '../constants.js';
import { randomInt } from '../utils/helpers.js';
import audioManager from '../audio/AudioManager.js';
import { boardRenderer } from '../ui/BoardRenderer.js';
import { playersPanel } from '../ui/PlayersPanel.js';
import { showModal, closeModal } from '../ui/ModalManager.js';
import { historyPanel, statsPanel } from '../ui/HistoryPanel.js';
import { renderToken } from '../data/tokens.js';

class GameEngine {
    constructor() {
        this.autoRollEnabled = false;
        this.autoRollTimer = null;
        this.autoRollCountdown = 2;
        this.countdownInterval = null;
        this.gameTimerInterval = null;
    }

    // ==================== AUTO-ROLL SYSTEM ====================
    toggleAutoRoll() {
        const checkbox = document.getElementById('auto-roll-checkbox');
        this.autoRollEnabled = checkbox?.checked || false;

        if (this.autoRollEnabled) {
            // Start timer if it's player's turn to roll
            const rollBtn = document.getElementById('roll-dice');
            if (rollBtn && !rollBtn.disabled && !gameState.diceRolled) {
                this.startAutoRollTimer();
            }
        } else {
            this.stopAutoRollTimer();
        }
    }

    startAutoRollTimer() {
        this.stopAutoRollTimer();
        if (!this.autoRollEnabled) return;

        this.autoRollCountdown = 2;
        this.updateAutoRollDisplay();

        const countdownEl = document.getElementById('auto-roll-countdown');
        if (countdownEl) countdownEl.classList.add('active');

        this.countdownInterval = setInterval(() => {
            this.autoRollCountdown--;
            this.updateAutoRollDisplay();

            if (this.autoRollCountdown <= 0) {
                this.stopAutoRollTimer();
                this.tryAutoRoll();
            }
        }, 1000);
    }

    stopAutoRollTimer() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        const countdownEl = document.getElementById('auto-roll-countdown');
        if (countdownEl) countdownEl.classList.remove('active');
    }

    updateAutoRollDisplay() {
        const countdownEl = document.getElementById('auto-roll-countdown');
        if (countdownEl) {
            countdownEl.textContent = this.autoRollCountdown;
        }
    }

    tryAutoRoll() {
        const rollBtn = document.getElementById('roll-dice');
        if (this.autoRollEnabled && rollBtn && !rollBtn.disabled && !gameState.diceRolled) {
            this.rollDice();
        }
    }

    enableRollButton() {
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) {
            rollBtn.disabled = false;
            // Re-attach click handler in case button was recreated
            rollBtn.onclick = () => this.rollDice();
            // Start auto-roll timer if enabled
            if (this.autoRollEnabled) {
                this.startAutoRollTimer();
            }
        }
        // Also re-attach build button handler
        const buildBtn = document.getElementById('build-btn');
        if (buildBtn) {
            buildBtn.onclick = () => this.showBuildModal();
        }
    }

    initialize(players, config, mode) {
        gameState.initialize(players, config, mode);
        cardManager.initializeDecks();
        propertyManager.reset();

        // Link decks to game state for save/load
        const decks = cardManager.getDecks();
        gameState.chanceDeck = decks.chanceDeck;
        gameState.chestDeck = decks.chestDeck;

        // Initialize stats panel
        statsPanel.init(players.length);

        // Render initial board
        boardRenderer.render(gameState);
        playersPanel.update(gameState);
        boardRenderer.updateCenterZoom(gameState);

        // Enable dice roll
        const rollBtn = document.getElementById('roll-dice');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollDice());
        }
        this.enableRollButton();

        // Setup auto-roll toggle
        const autoRollCheckbox = document.getElementById('auto-roll-checkbox');
        if (autoRollCheckbox) {
            autoRollCheckbox.addEventListener('change', () => this.toggleAutoRoll());
        }

        // Setup build button
        const buildBtn = document.getElementById('build-btn');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => this.showBuildModal());
        }

        // Setup timer if needed
        if (config.timeLimit > 0) {
            this.startGameTimer();
        }

        // Add initial history entry
        historyPanel.addEntry('move', '🎮', 'La partida ha començat!');
        this.showMessage(`Torn de ${players[0].name}. Tira els daus!`);
    }

    rollDice() {
        if (gameState.diceRolled) return;

        const player = gameState.getCurrentPlayer();
        if (player.bankrupt) return;

        // Stop auto-roll timer when dice are rolled
        this.stopAutoRollTimer();

        gameState.diceRolled = true;
        document.getElementById('roll-dice').disabled = true;

        const die1El = document.getElementById('die1');
        const die2El = document.getElementById('die2');

        // Play rolling sound
        audioManager.playDiceRoll();

        // Animate dice
        die1El.classList.add('rolling');
        die2El.classList.add('rolling');

        setTimeout(() => {
            const die1 = randomInt(1, 6);
            const die2 = randomInt(1, 6);
            const total = die1 + die2;
            const isDoubles = die1 === die2;

            die1El.classList.remove('rolling');
            die2El.classList.remove('rolling');
            die1El.classList.add('landed');
            die2El.classList.add('landed');
            die1El.textContent = this.getDieFace(die1);
            die2El.textContent = this.getDieFace(die2);

            // Play land sound
            audioManager.playDiceLand();

            // Handle doubles
            if (isDoubles) {
                die1El.classList.add('doubles');
                die2El.classList.add('doubles');
                gameState.consecutiveDoubles++;
                gameState.updateStat('doublesRolled', gameState.currentPlayerIndex, 1);

                // Three doubles = jail
                if (gameState.consecutiveDoubles >= 3) {
                    setTimeout(() => {
                        this.showMessage(`${player.name} ha tret 3 dobles seguits! A la presó!`);
                        this.sendToJail(player);
                    }, 500);
                    return;
                }

                gameState.lastRollWasDoubles = true;
            } else {
                gameState.lastRollWasDoubles = false;
            }

            // Add history entry
            historyPanel.addEntry('move', '🎲', `${player.name} tira ${die1}+${die2}=${total}${isDoubles ? ' (DOBLES!)' : ''}`);

            // Move player
            setTimeout(() => {
                this.movePlayer(player, total);
            }, 500);

            // Remove animation classes
            setTimeout(() => {
                die1El.classList.remove('landed', 'doubles');
                die2El.classList.remove('landed', 'doubles');
            }, 1000);

        }, DELAYS.DICE_ROLL);
    }

    getDieFace(value) {
        const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return faces[value] || value;
    }

    movePlayer(player, spaces) {
        const oldPosition = player.position;
        const finalPosition = (oldPosition + spaces) % BOARD.TOTAL_SQUARES;
        let currentStep = 0;

        const moveOneStep = () => {
            currentStep++;
            const newPos = (oldPosition + currentStep) % BOARD.TOTAL_SQUARES;
            player.position = newPos;

            // Check if passed GO (when crossing from 39 to 0)
            if (newPos === 0 && currentStep > 0) {
                const reward = gameState.gameConfig.goReward;
                player.money += reward;
                gameState.updateStat('totalMoneyEarned', gameState.currentPlayerIndex, reward);
                historyPanel.addEntry('money', '💰', `${player.name} passa per SORTIDA i cobra ${reward}€!`);
                audioManager.playPassGo();
                playersPanel.update(gameState);
            }

            // Update UI with moving animation
            boardRenderer.positionTokens(gameState, gameState.currentPlayerIndex);
            boardRenderer.updateCenterZoom(gameState);

            if (currentStep < spaces) {
                // More steps to go
                setTimeout(moveOneStep, DELAYS.TOKEN_MOVE_STEP);
            } else {
                // Movement complete - execute square action
                playersPanel.update(gameState);
                setTimeout(() => {
                    this.executeSquareAction(player, SQUARES[finalPosition]);
                }, DELAYS.TOKEN_MOVE_STEP);
            }
        };

        // Start the step-by-step movement
        moveOneStep();
    }

    executeSquareAction(player, square) {
        switch (square.type) {
            case 'property':
            case 'station':
            case 'utility':
                this.handlePropertySquare(player, square);
                break;
            case 'tax':
                this.handleTax(player, square);
                break;
            case 'go-jail':
                this.sendToJail(player);
                break;
            case 'chance':
                this.handleCardSquare(player, 'chance');
                break;
            case 'chest':
                this.handleCardSquare(player, 'chest');
                break;
            case 'jail':
                if (!player.inJail) {
                    this.showSquareModal(square, player, 'Visita a la Presó', `${player.name} està de visita a la presó. Només de pas!`);
                } else {
                    this.endTurn();
                }
                break;
            case 'parking':
                this.showSquareModal(square, player, 'Pàrquing Gratuït', `${player.name} descansa al Pàrquing Gratuït. Un respir!`);
                break;
            case 'go':
                this.showSquareModal(square, player, 'SORTIDA', `${player.name} és a la SORTIDA. Punt de partida!`);
                break;
            default:
                this.endTurn();
        }
    }

    handlePropertySquare(player, square) {
        const propState = gameState.getProperty(square.id);

        if (!propState) {
            // Property is unowned - offer to buy
            this.showBuyPropertyModal(player, square);
        } else if (propState.owner !== gameState.currentPlayerIndex) {
            // Property owned by someone else - pay rent
            const rent = propertyManager.calculateRent(square, propState, gameState.properties);
            const owner = gameState.getPlayer(propState.owner);
            this.handleRentPayment(player, owner, square, rent);
        } else {
            // Player owns this property
            this.showMessage(`${player.name} és a la seva propietat: ${square.name}`);
            this.endTurn();
        }
    }

    showBuyPropertyModal(player, square) {
        const groupInfo = square.group ? PROPERTY_GROUPS[square.group] : null;
        const color = groupInfo?.color || '#607D8B';

        const canAfford = player.money >= square.price;

        showModal({
            headerHtml: `
                <div class="property-header" style="background: ${color}">
                    <div class="property-name">${square.name}</div>
                    ${groupInfo ? `<div class="property-movie">${groupInfo.name}</div>` : ''}
                </div>
            `,
            bodyHtml: `
                ${square.image ? `<div class="property-large-image"><img src="${square.image}" alt="${square.name}"></div>` : ''}
                <div class="property-price">${square.price}€</div>
                <p>${canAfford ? 'Vols comprar aquesta propietat?' : 'No tens prou diners per comprar.'}</p>
            `,
            buttons: canAfford ? [
                {
                    text: `Comprar per ${square.price}€`,
                    class: 'btn-buy',
                    action: () => {
                        this.buyProperty(player, square);
                        closeModal();
                    }
                },
                {
                    text: 'Passar',
                    class: 'btn-pass',
                    action: () => {
                        closeModal();
                        this.endTurn();
                    }
                }
            ] : [
                {
                    text: 'Continuar',
                    class: 'btn-close',
                    action: () => {
                        closeModal();
                        this.endTurn();
                    }
                }
            ]
        });
    }

    buyProperty(player, square) {
        const playerIndex = gameState.currentPlayerIndex;
        player.money -= square.price;
        player.properties.push(square.id);

        gameState.setProperty(square.id, {
            owner: playerIndex,
            houses: 0,
            mortgaged: false
        });

        gameState.updateStat('propertiesBought', playerIndex, 1);
        gameState.updateStat('totalMoneySpent', playerIndex, square.price);

        audioManager.playBuyProperty();
        historyPanel.addEntry('buy', '🏠', `${player.name} compra ${square.name} per ${square.price}€`);

        playersPanel.update(gameState);
        boardRenderer.render(gameState);

        this.showMessage(`${player.name} ha comprat ${square.name}!`);
        this.endTurn();
    }

    handleRentPayment(player, owner, square, rent) {
        const propState = gameState.getProperty(square.id);

        if (propState.mortgaged) {
            this.showMessage(`${square.name} està hipotecada. No es paga lloguer.`);
            this.endTurn();
            return;
        }

        showModal({
            headerHtml: `
                <div class="property-header" style="background: #f44336">
                    <div class="property-name">Pagar Lloguer!</div>
                </div>
            `,
            bodyHtml: `
                ${square.image ? `<div class="property-large-image"><img src="${square.image}" alt="${square.name}"></div>` : ''}
                <p>${player.name} ha de pagar <strong>${rent}€</strong> a ${owner.name} per ${square.name}</p>
            `,
            buttons: [
                {
                    text: `Pagar ${rent}€`,
                    class: 'btn-pay',
                    action: () => {
                        player.money -= rent;
                        owner.money += rent;

                        gameState.updateStat('rentPaid', gameState.currentPlayerIndex, rent);
                        gameState.updateStat('rentReceived', gameState.players.indexOf(owner), rent);

                        audioManager.playCollectRent();
                        historyPanel.addEntry('rent', '💸', `${player.name} paga ${rent}€ a ${owner.name}`);

                        playersPanel.update(gameState);
                        closeModal();
                        this.checkBankruptcy(player);
                        this.endTurn();
                    }
                }
            ]
        });
    }

    handleTax(player, square) {
        showModal({
            headerHtml: `
                <div class="property-header" style="background: #f44336">
                    <div class="property-name">${square.name}</div>
                </div>
            `,
            bodyHtml: `
                ${square.image ? `<div class="property-large-image"><img src="${square.image}" alt="${square.name}"></div>` : ''}
                <p>Has de pagar <strong>${square.amount}€</strong> d'impostos.</p>
            `,
            buttons: [
                {
                    text: `Pagar ${square.amount}€`,
                    class: 'btn-pay',
                    action: () => {
                        player.money -= square.amount;
                        audioManager.playPayMoney();
                        playersPanel.update(gameState);
                        closeModal();
                        this.checkBankruptcy(player);
                        this.endTurn();
                    }
                }
            ]
        });
    }

    handleCardSquare(player, cardType) {
        audioManager.playCard();
        const card = cardManager.drawCard(cardType);
        const isChance = cardType === 'chance';
        const cardTitle = isChance ? '🎲 Sort' : '📦 Cofre del Tresor';
        const cardColor = isChance ? '#FF9800' : '#9C27B0';
        const cardImage = isChance ? 'images/special/suerte.png' : 'images/special/cofre.png';

        historyPanel.addEntry('card', isChance ? '🎲' : '📦', `${player.name} treu carta: "${card.text}"`);

        showModal({
            headerHtml: `
                <div class="property-header" style="background: ${cardColor}">
                    <div class="property-name">${cardTitle}</div>
                </div>
            `,
            bodyHtml: `
                <div class="card-layout">
                    <div class="card-image"><img src="${cardImage}" alt="${cardTitle}"></div>
                    <div class="card-text">${card.text}</div>
                </div>
            `,
            buttons: [
                {
                    text: 'Continuar',
                    class: 'btn-close',
                    action: () => {
                        closeModal();
                        this.executeCardResult(player, card);
                    }
                }
            ]
        });
    }

    executeCardResult(player, card) {
        const result = cardManager.executeCardAction(player, card, gameState, gameState.gameConfig);

        // Apply money change
        if (result.moneyChange !== 0) {
            player.money += result.moneyChange;
            if (result.moneyChange > 0) {
                audioManager.playCollectMoney();
            } else {
                audioManager.playPayMoney();
            }
        }

        // Handle collect from all
        if (result.collectFromAll) {
            gameState.players.forEach((p, i) => {
                if (i !== gameState.currentPlayerIndex && !p.bankrupt) {
                    p.money -= result.collectFromAllAmount;
                }
            });
        }

        // Handle get out of jail card
        if (result.getOutOfJailCard) {
            player.getOutOfJailCards++;
        }

        // Handle jail
        if (result.goToJail) {
            this.sendToJail(player);
            return;
        }

        // Handle position change
        if (result.newPosition !== null) {
            player.position = result.newPosition;
            boardRenderer.positionTokens(gameState, gameState.currentPlayerIndex);
            boardRenderer.updateCenterZoom(gameState);
        }

        playersPanel.update(gameState);

        if (result.message) {
            this.showMessage(result.message);
        }

        // Execute square action if needed
        if (result.executeSquareAction && result.newPosition !== null) {
            setTimeout(() => {
                this.executeSquareAction(player, SQUARES[result.newPosition]);
            }, DELAYS.CARD_SHOW);
        } else if (result.endTurn) {
            this.checkBankruptcy(player);
            this.endTurn();
        }
    }

    sendToJail(player) {
        audioManager.playJail();
        player.position = BOARD.JAIL_POSITION;
        player.inJail = true;
        player.jailTurns = 0;

        gameState.updateStat('timesInJail', gameState.currentPlayerIndex, 1);
        historyPanel.addEntry('jail', '🔒', `${player.name} va a la presó!`);

        boardRenderer.positionTokens(gameState, gameState.currentPlayerIndex);
        playersPanel.update(gameState);

        showModal({
            headerHtml: `
                <div class="property-header" style="background: #f44336">
                    <div class="property-name">A la Presó!</div>
                </div>
            `,
            bodyHtml: `
                <div class="property-large-image"><img src="images/special/ir-carcel.png" alt="Anar a la Presó"></div>
                <p>${player.name} va a la presó. Perdràs el proper torn.</p>
            `,
            buttons: [
                {
                    text: 'Entès',
                    class: 'btn-close',
                    action: () => {
                        closeModal();
                        this.endTurn();
                    }
                }
            ]
        });
    }

    showSquareModal(square, player, title, message) {
        showModal({
            headerHtml: `
                <div class="property-header" style="background: #4CAF50">
                    <div class="property-name">${title}</div>
                </div>
            `,
            bodyHtml: `
                ${square.image ? `<div class="property-large-image"><img src="${square.image}" alt="${square.name}"></div>` : ''}
                <p>${message}</p>
            `,
            buttons: [
                {
                    text: 'Continuar',
                    class: 'btn-close',
                    action: () => {
                        closeModal();
                        this.endTurn();
                    }
                }
            ]
        });
    }

    showBuildModal() {
        const player = gameState.getCurrentPlayer();
        const buildable = propertyManager.getBuildableProperties(player, gameState.properties);

        if (buildable.length === 0) {
            this.showMessage('No tens propietats on puguis construir.');
            return;
        }

        let listHtml = buildable.map(item => {
            const color = PROPERTY_GROUPS[item.square.group]?.color || '#888';
            const housesDisplay = item.currentHouses === 5
                ? '<div class="mini-hotel"></div>'
                : '<div class="houses-display">' + '<div class="mini-house"></div>'.repeat(item.currentHouses) + '</div>';

            return `
                <div class="build-property-item" style="border-left-color: ${color}" data-prop-id="${item.squareId}">
                    <div class="info">
                        <span>${item.square.name}</span>
                        ${housesDisplay}
                    </div>
                    <button class="btn-add-house" ${item.currentHouses >= 5 ? 'disabled' : ''}>
                        +🏠 ${item.cost}€
                    </button>
                </div>
            `;
        }).join('');

        showModal({
            headerHtml: `
                <div class="property-header" style="background: #4CAF50">
                    <div class="property-name">🏠 Construir</div>
                </div>
            `,
            bodyHtml: `
                <p>Cases disponibles: ${propertyManager.getAvailableHouses()} | Hotels disponibles: ${propertyManager.getAvailableHotels()}</p>
                <div class="build-properties-list">${listHtml}</div>
            `,
            buttons: [
                {
                    text: 'Tancar',
                    class: 'btn-close',
                    action: () => closeModal()
                }
            ]
        });

        // Add click handlers
        setTimeout(() => {
            document.querySelectorAll('.btn-add-house').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = e.target.closest('.build-property-item');
                    const propId = parseInt(item.dataset.propId);
                    this.buildHouse(propId);
                });
            });
        }, 100);
    }

    buildHouse(propId) {
        const player = gameState.getCurrentPlayer();
        const result = propertyManager.buildHouse(player, propId, gameState.properties);

        if (result.success) {
            audioManager.playBuildHouse();
            const square = SQUARES[propId];
            historyPanel.addEntry('build', '🏠', `${player.name} construeix a ${square.name}`);

            gameState.availableHouses = propertyManager.getAvailableHouses();
            gameState.availableHotels = propertyManager.getAvailableHotels();

            playersPanel.update(gameState);
            boardRenderer.render(gameState);

            closeModal();
            this.showBuildModal(); // Refresh modal
        } else {
            this.showMessage(result.error);
        }
    }

    checkBankruptcy(player) {
        if (player.money < 0) {
            const totalAssets = propertyManager.getPlayerAssetValue(player, gameState.properties);

            if (totalAssets < 0) {
                // Player is bankrupt
                player.bankrupt = true;
                audioManager.playBankruptcy();
                historyPanel.addEntry('jail', '💀', `${player.name} ha quebrat!`);

                // Return properties to bank
                player.properties.forEach(propId => {
                    delete gameState.properties[propId];
                });
                player.properties = [];

                this.showMessage(`${player.name} ha quebrat i surt del joc!`);

                // Check for winner
                const activePlayers = gameState.getActivePlayers();
                if (activePlayers.length === 1) {
                    this.declareWinner(activePlayers[0]);
                }
            }
        }
    }

    declareWinner(winner) {
        audioManager.playVictory();

        showModal({
            headerHtml: `
                <div class="property-header" style="background: linear-gradient(135deg, #FFD700, #FFA500)">
                    <div class="property-name">🎉 Guanyador! 🎉</div>
                </div>
            `,
            bodyHtml: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; margin: 20px 0;">${renderToken(winner.token, '5rem')}</div>
                    <h2 style="color: #333; margin: 10px 0;">${winner.name}</h2>
                    <p style="font-size: 1.5rem; color: #4CAF50; font-weight: bold;">${winner.money}€</p>
                    <p>Ha guanyat la partida!</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Nova Partida',
                    class: 'btn-buy',
                    action: () => {
                        location.reload();
                    }
                }
            ]
        });
    }

    endTurn() {
        const currentPlayer = gameState.getCurrentPlayer();

        // Check if player rolled doubles and can roll again
        if (gameState.lastRollWasDoubles && !currentPlayer.inJail) {
            gameState.diceRolled = false;
            gameState.lastRollWasDoubles = false;
            this.enableRollButton();

            setTimeout(() => {
                this.showMessage(`🎲 ${currentPlayer.name} ha tret DOBLES! Torna a tirar!`);
            }, 500);
            return;
        }

        // Normal turn end
        gameState.diceRolled = false;
        gameState.consecutiveDoubles = 0;
        gameState.lastRollWasDoubles = false;
        gameState.incrementTurns();

        // Check turn limit
        if (gameState.gameConfig.maxTurns > 0 && gameState.stats.turnsPlayed >= gameState.gameConfig.maxTurns) {
            this.endGameByTurnLimit();
            return;
        }

        // Move to next player
        const nextPlayer = gameState.nextPlayer();

        playersPanel.update(gameState);
        boardRenderer.updateCenterZoom(gameState);

        // Handle jail
        if (nextPlayer.inJail) {
            document.getElementById('roll-dice').disabled = true;
            setTimeout(() => {
                this.handleJailTurn(nextPlayer);
            }, 500);
            return;
        }

        this.enableRollButton();

        setTimeout(() => {
            this.showMessage(`Torn de ${nextPlayer.name}. Tira els daus!`);
        }, 500);
    }

    handleJailTurn(player) {
        player.jailTurns++;

        const options = [];

        // Option 1: Pay fine
        if (player.money >= JAIL.FINE) {
            options.push({
                text: `Pagar ${JAIL.FINE}€`,
                class: 'btn-pay',
                action: () => {
                    player.money -= JAIL.FINE;
                    player.inJail = false;
                    player.jailTurns = 0;
                    audioManager.playPayMoney();
                    playersPanel.update(gameState);
                    closeModal();
                    this.enableRollButton();
                    this.showMessage(`${player.name} paga la fiança i surt de la presó!`);
                }
            });
        }

        // Option 2: Use get out of jail card
        if (player.getOutOfJailCards > 0) {
            options.push({
                text: 'Usar Targeta',
                class: 'btn-buy',
                action: () => {
                    player.getOutOfJailCards--;
                    player.inJail = false;
                    player.jailTurns = 0;
                    closeModal();
                    this.enableRollButton();
                    this.showMessage(`${player.name} usa una targeta i surt de la presó!`);
                }
            });
        }

        // Option 3: Try to roll doubles
        options.push({
            text: 'Tirar Daus',
            class: 'btn-close',
            action: () => {
                closeModal();
                this.rollDiceForJail(player);
            }
        });

        showModal({
            headerHtml: `
                <div class="property-header" style="background: #607D8B">
                    <div class="property-name">🔒 A la Presó</div>
                </div>
            `,
            bodyHtml: `
                <p>${player.name} està a la presó (Torn ${player.jailTurns}/${JAIL.MAX_TURNS})</p>
                <p>Com vols sortir?</p>
            `,
            buttons: options
        });
    }

    rollDiceForJail(player) {
        const die1 = randomInt(1, 6);
        const die2 = randomInt(1, 6);

        const die1El = document.getElementById('die1');
        const die2El = document.getElementById('die2');
        die1El.textContent = this.getDieFace(die1);
        die2El.textContent = this.getDieFace(die2);

        audioManager.playDiceLand();

        if (die1 === die2) {
            // Got doubles - freed!
            player.inJail = false;
            player.jailTurns = 0;
            this.showMessage(`${player.name} treu dobles i surt de la presó!`);
            this.movePlayer(player, die1 + die2);
        } else if (player.jailTurns >= JAIL.MAX_TURNS) {
            // Must pay after 3 turns and move
            player.money -= JAIL.FINE;
            player.inJail = false;
            player.jailTurns = 0;
            audioManager.playPayMoney();
            playersPanel.update(gameState);
            this.showMessage(`${player.name} ha de pagar la fiança de ${JAIL.FINE}€`);
            this.checkBankruptcy(player);
            if (!player.bankrupt) {
                this.movePlayer(player, die1 + die2);
            }
        } else {
            this.showMessage(`${player.name} no treu dobles. Segueix a la presó.`);
            this.endTurn();
        }
    }

    endGameByTurnLimit() {
        // Find winner by net worth
        const activePlayers = gameState.getActivePlayers();
        let winner = activePlayers[0];
        let maxWorth = propertyManager.getPlayerAssetValue(winner, gameState.properties);

        activePlayers.forEach(p => {
            const worth = propertyManager.getPlayerAssetValue(p, gameState.properties);
            if (worth > maxWorth) {
                maxWorth = worth;
                winner = p;
            }
        });

        this.declareWinner(winner);
    }

    startGameTimer() {
        const timerEl = document.getElementById('header-timer');
        const timerValue = document.getElementById('timer-value');
        if (timerEl) timerEl.classList.add('visible');

        const endTime = Date.now() + gameState.gameConfig.timeLimit * 60 * 1000;

        this.gameTimerInterval = setInterval(() => {
            const remaining = Math.max(0, endTime - Date.now());
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);

            if (timerValue) {
                timerValue.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }

            if (remaining <= 60000) {
                timerEl?.classList.add('warning');
            }

            if (remaining <= 0) {
                clearInterval(this.gameTimerInterval);
                this.endGameByTurnLimit();
            }
        }, 1000);
    }

    showMessage(text) {
        const msgArea = document.getElementById('message-area');
        if (msgArea) {
            msgArea.textContent = text;
            msgArea.classList.add('visible');

            setTimeout(() => {
                msgArea.classList.remove('visible');
            }, DELAYS.MESSAGE_DISPLAY);
        }
    }
}

// Export singleton instance
export const gameEngine = new GameEngine();
export default gameEngine;

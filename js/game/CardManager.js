// Card Manager for Disney Monopoly
import { CHANCE_CARDS, CHEST_CARDS } from '../data/cards.js';
import { SQUARES } from '../data/squares.js';
import { shuffleArray } from '../utils/helpers.js';
import { STATION_POSITIONS } from '../constants.js';

class CardManager {
    constructor() {
        this.chanceDeck = [];
        this.chestDeck = [];
    }

    initializeDecks() {
        this.chanceDeck = shuffleArray(CHANCE_CARDS);
        this.chestDeck = shuffleArray(CHEST_CARDS);
    }

    drawCard(type) {
        const deck = type === 'chance' ? this.chanceDeck : this.chestDeck;
        const card = deck.shift();
        deck.push(card); // Put card at bottom of deck
        return card;
    }

    getDecks() {
        return {
            chanceDeck: this.chanceDeck,
            chestDeck: this.chestDeck
        };
    }

    setDecks(chanceDeck, chestDeck) {
        this.chanceDeck = chanceDeck || shuffleArray(CHANCE_CARDS);
        this.chestDeck = chestDeck || shuffleArray(CHEST_CARDS);
    }

    /**
     * Execute a card action and return the result
     * @param {Object} player - The player executing the card
     * @param {Object} card - The card to execute
     * @param {Object} gameState - Current game state
     * @param {Object} gameConfig - Game configuration
     * @returns {Object} Result of the action with instructions for the game engine
     */
    executeCardAction(player, card, gameState, gameConfig) {
        const result = {
            type: card.action,
            message: '',
            moneyChange: 0,
            newPosition: null,
            passedGo: false,
            goToJail: false,
            endTurn: true,
            collectFromAll: false,
            collectFromAllAmount: 0,
            repairs: null,
            getOutOfJailCard: false
        };

        switch (card.action) {
            case 'collect':
                result.moneyChange = card.amount;
                result.message = `${player.name} cobra ${card.amount}€`;
                break;

            case 'pay':
                result.moneyChange = -card.amount;
                result.message = `${player.name} paga ${card.amount}€`;
                break;

            case 'goto':
                const oldPos = player.position;
                result.newPosition = card.destination;

                // Check if passed GO
                if (card.collectGo && card.destination <= oldPos) {
                    result.passedGo = true;
                    result.moneyChange = gameConfig.goReward;
                    result.message = `${player.name} passa per SORTIDA i cobra ${gameConfig.goReward}€`;
                }

                // Execute action on new square if not GO
                if (card.destination !== 0) {
                    result.executeSquareAction = true;
                    result.endTurn = false;
                }
                break;

            case 'move':
                const newPos = (player.position + card.spaces) % 40;
                if (newPos < player.position && card.spaces > 0) {
                    result.passedGo = true;
                    result.moneyChange = gameConfig.goReward;
                }
                result.newPosition = newPos;
                result.executeSquareAction = true;
                result.endTurn = false;
                break;

            case 'jail':
                result.goToJail = true;
                result.message = `${player.name} va a la presó!`;
                break;

            case 'getOutOfJailFree':
                result.getOutOfJailCard = true;
                result.message = `🎫 ${player.name} guarda una Targeta per Sortir de la Presó Gratis!`;
                break;

            case 'collectFromAll':
                result.collectFromAll = true;
                result.collectFromAllAmount = card.amount;
                let totalCollected = 0;
                gameState.players.forEach((p, i) => {
                    if (i !== gameState.currentPlayerIndex && !p.bankrupt) {
                        totalCollected += card.amount;
                    }
                });
                result.moneyChange = totalCollected;
                result.message = `${player.name} cobra ${totalCollected}€ dels altres jugadors`;
                break;

            case 'repairs':
                result.repairs = {
                    houseCost: card.houseCost,
                    hotelCost: card.hotelCost
                };
                let totalCost = 0;
                player.properties.forEach(propId => {
                    const propState = gameState.properties[propId];
                    const square = SQUARES[propId];
                    if (square.type === 'property' && propState) {
                        const houses = propState.houses || 0;
                        if (houses === 5) {
                            totalCost += card.hotelCost;
                        } else {
                            totalCost += houses * card.houseCost;
                        }
                    }
                });
                result.moneyChange = -totalCost;
                result.message = `${player.name} paga ${totalCost}€ en reparacions`;
                break;

            case 'nextStation':
                // Find next station from current position
                let nextStation = STATION_POSITIONS.find(s => s > player.position);
                if (!nextStation) nextStation = STATION_POSITIONS[0]; // Wrap around

                // Check if passing GO
                if (nextStation < player.position) {
                    result.passedGo = true;
                    result.moneyChange = gameConfig.goReward;
                }

                result.newPosition = nextStation;
                result.executeSquareAction = true;
                result.endTurn = false;
                break;
        }

        return result;
    }
}

// Export singleton instance
export const cardManager = new CardManager();
export default cardManager;

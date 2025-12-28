// Game State for Disney Monopoly
import { GAME_MODES } from '../data/gameModes.js';

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.properties = {}; // squareId -> { owner: playerIndex, houses: 0, mortgaged: false }
        this.chanceDeck = [];
        this.chestDeck = [];
        this.started = false;
        this.diceRolled = false;
        this.consecutiveDoubles = 0;
        this.lastRollWasDoubles = false;
        this.availableHouses = 32;
        this.availableHotels = 12;
        this.history = [];
        this.gameMode = 'classic';
        this.gameConfig = null;
        this.gameStartTime = null;
        this.stats = {
            turnsPlayed: 0,
            totalMoneyEarned: {},
            totalMoneySpent: {},
            propertiesBought: {},
            rentPaid: {},
            rentReceived: {},
            timesInJail: {},
            doublesRolled: {}
        };
    }

    initialize(players, config, mode) {
        this.reset();
        this.players = players;
        this.gameConfig = config || { ...GAME_MODES.classic };
        this.gameMode = mode || 'classic';
        this.started = true;
        this.gameStartTime = Date.now();

        // Initialize stats for each player
        players.forEach((_, index) => {
            this.stats.totalMoneyEarned[index] = 0;
            this.stats.totalMoneySpent[index] = 0;
            this.stats.propertiesBought[index] = 0;
            this.stats.rentPaid[index] = 0;
            this.stats.rentReceived[index] = 0;
            this.stats.timesInJail[index] = 0;
            this.stats.doublesRolled[index] = 0;
        });
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getPlayer(index) {
        return this.players[index];
    }

    getActivePlayers() {
        return this.players.filter(p => !p.bankrupt);
    }

    getActivePlayerCount() {
        return this.getActivePlayers().length;
    }

    getProperty(squareId) {
        return this.properties[squareId];
    }

    setProperty(squareId, data) {
        this.properties[squareId] = data;
    }

    nextPlayer() {
        let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        let attempts = 0;

        while (this.players[nextIndex].bankrupt && attempts < this.players.length) {
            nextIndex = (nextIndex + 1) % this.players.length;
            attempts++;
        }

        this.currentPlayerIndex = nextIndex;
        return this.getCurrentPlayer();
    }

    updateStat(statName, playerIndex, amount) {
        if (this.stats[statName] && this.stats[statName][playerIndex] !== undefined) {
            this.stats[statName][playerIndex] += amount;
        }
    }

    incrementTurns() {
        this.stats.turnsPlayed++;
    }

    // Save/Load functionality
    toJSON() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            properties: this.properties,
            chanceDeck: this.chanceDeck,
            chestDeck: this.chestDeck,
            started: this.started,
            diceRolled: this.diceRolled,
            consecutiveDoubles: this.consecutiveDoubles,
            lastRollWasDoubles: this.lastRollWasDoubles,
            availableHouses: this.availableHouses,
            availableHotels: this.availableHotels,
            history: this.history,
            gameMode: this.gameMode,
            gameConfig: this.gameConfig,
            gameStartTime: this.gameStartTime,
            stats: this.stats
        };
    }

    fromJSON(data) {
        Object.assign(this, data);
    }
}

// Export singleton instance
export const gameState = new GameState();
export default gameState;

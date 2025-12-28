// Players Panel for Disney Monopoly
import { SQUARES, PROPERTY_GROUPS } from '../data/squares.js';
import { renderToken } from '../data/tokens.js';

class PlayersPanel {
    constructor() {
        this.leftPanel = null;
        this.rightPanel = null;
        this.onPlayerClick = null;
    }

    init() {
        this.leftPanel = document.getElementById('players-left');
        this.rightPanel = document.getElementById('players-right');
    }

    update(gameState) {
        if (!this.leftPanel || !this.rightPanel) {
            this.init();
        }
        if (!this.leftPanel || !this.rightPanel || !gameState.started) return;

        const { players, currentPlayerIndex, properties } = gameState;

        // Split players: first 2 go left, rest go right
        const leftPlayers = players.slice(0, 2);
        const rightPlayers = players.slice(2);

        // Render left panel (players 1 & 2)
        this.leftPanel.innerHTML = leftPlayers.map((player, i) =>
            this.renderPlayerCard(player, i, currentPlayerIndex, properties)
        ).join('');

        // Render right panel (players 3+)
        this.rightPanel.innerHTML = rightPlayers.map((player, i) =>
            this.renderPlayerCard(player, i + 2, currentPlayerIndex, properties)
        ).join('');

        // Add click handlers
        this.attachClickHandlers();
    }

    renderPlayerCard(player, index, currentPlayerIndex, properties) {
        const isCurrent = index === currentPlayerIndex;
        const classes = ['player-card'];
        if (isCurrent) classes.push('current');
        if (player.bankrupt) classes.push('bankrupt');

        // Get monopolies for this player
        const monopolies = this.getPlayerMonopolies(player.properties);
        const monopolyIndicators = monopolies.map(m =>
            `<span class="monopoly-dot" style="background: ${m.color}" title="${m.name}"></span>`
        ).join('');

        return `
            <div class="${classes.join(' ')}" data-player-index="${index}">
                <div class="player-card-header">
                    <span class="token">${renderToken(player.token, '2.2rem')}</span>
                    <div class="info">
                        <span class="name">${player.name}</span>
                        <span class="amount ${player.money < 0 ? 'negative' : ''}">${player.money}€</span>
                    </div>
                </div>
                ${monopolies.length > 0 ? `<div class="monopolies">${monopolyIndicators}</div>` : ''}
            </div>
        `;
    }

    getPlayerMonopolies(playerProperties) {
        const monopolies = [];

        // Count total properties in each group
        const groupTotals = {};
        SQUARES.forEach(sq => {
            if (sq.type === 'property' && sq.group) {
                groupTotals[sq.group] = (groupTotals[sq.group] || 0) + 1;
            }
        });

        // Count what this player owns
        const groupCounts = {};
        playerProperties.forEach(propId => {
            const sq = SQUARES[propId];
            if (sq && sq.group) {
                groupCounts[sq.group] = (groupCounts[sq.group] || 0) + 1;
            }
        });

        // Check for complete sets
        for (const group in groupCounts) {
            if (groupCounts[group] === groupTotals[group]) {
                monopolies.push({
                    group,
                    color: PROPERTY_GROUPS[group].color,
                    name: PROPERTY_GROUPS[group].name
                });
            }
        }

        return monopolies;
    }

    attachClickHandlers() {
        document.querySelectorAll('.player-card').forEach(el => {
            el.addEventListener('click', () => {
                const playerIndex = parseInt(el.dataset.playerIndex);
                if (this.onPlayerClick) {
                    this.onPlayerClick(playerIndex);
                }
            });
        });
    }

    setPlayerClickHandler(handler) {
        this.onPlayerClick = handler;
    }
}

// Export singleton instance
export const playersPanel = new PlayersPanel();
export default playersPanel;

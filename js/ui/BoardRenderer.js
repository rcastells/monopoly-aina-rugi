// Board Renderer for Disney Monopoly
import { SQUARES, PROPERTY_GROUPS } from '../data/squares.js';
import { renderToken } from '../data/tokens.js';
import { BOARD } from '../constants.js';

class BoardRenderer {
    constructor() {
        this.boardElement = null;
        this.onSquareClick = null;
    }

    init() {
        this.boardElement = document.getElementById('board');
    }

    render(gameState) {
        if (!this.boardElement) {
            this.init();
        }
        if (!this.boardElement) return;

        this.boardElement.innerHTML = '';

        // Create board squares
        SQUARES.forEach(square => {
            const squareEl = this.createSquareElement(square, gameState);
            this.boardElement.appendChild(squareEl);
        });

        // Add center area
        const center = this.createCenterElement(gameState);
        this.boardElement.appendChild(center);

        // Position tokens
        this.positionTokens(gameState);
    }

    createSquareElement(square, gameState) {
        const el = document.createElement('div');
        el.className = `square ${square.type}`;
        el.dataset.id = square.id;

        // Add corner class for corner squares
        if ([0, 10, 20, 30].includes(square.id)) {
            el.classList.add('corner');
        }

        // Set grid position
        const pos = this.getGridPosition(square.id);
        el.style.gridColumn = pos.col;
        el.style.gridRow = pos.row;

        // Add property color border
        if (square.group && PROPERTY_GROUPS[square.group]) {
            const color = PROPERTY_GROUPS[square.group].color;
            el.style.boxShadow = `inset 0 6px 0 ${color}`;
        }

        // Check ownership and monopoly status
        const propState = gameState?.properties?.[square.id];
        if (propState) {
            // Check if owner has monopoly
            if (gameState.players && this.ownsFullColorGroup(propState.owner, square.group, gameState)) {
                el.classList.add('monopoly');
            }
        }

        // Add image or icon
        if (square.image) {
            el.innerHTML = `<img class="property-image" src="${square.image}" alt="${square.name}">`;
        } else if (square.icon) {
            el.innerHTML = `<span class="icon">${square.icon}</span>`;
        }

        // Add owner indicator
        if (propState && gameState.players) {
            const owner = gameState.players[propState.owner];
            if (owner) {
                el.innerHTML += `<span class="owner-indicator">${renderToken(owner.token, '1rem')}</span>`;
            }
        }

        // Add houses display
        if (propState && propState.houses > 0 && square.type === 'property') {
            el.innerHTML += this.renderHouses(propState.houses);
        }

        // Add click handler
        el.addEventListener('click', () => {
            if (this.onSquareClick) {
                this.onSquareClick(square);
            }
        });

        return el;
    }

    renderHouses(houses) {
        if (houses === 5) {
            return '<div class="houses"><div class="hotel"></div></div>';
        }
        return `<div class="houses">${'<div class="house"></div>'.repeat(houses)}</div>`;
    }

    ownsFullColorGroup(playerIndex, group, gameState) {
        if (!group) return false;
        const groupProperties = SQUARES.filter(sq => sq.type === 'property' && sq.group === group);
        return groupProperties.every(sq => {
            const prop = gameState.properties[sq.id];
            return prop && prop.owner === playerIndex;
        });
    }

    createCenterElement(gameState) {
        const center = document.createElement('div');
        center.className = 'square center';

        // Build center content
        let centerHtml = `
            <div class="center-zoom" id="center-zoom">
                <div class="center-zoom-squares" id="center-zoom-squares">
                    <!-- Zoom squares will be populated dynamically -->
                </div>
            </div>
            <div class="dice-container">
                <div class="die" id="die1">?</div>
                <div class="die" id="die2">?</div>
            </div>
            <button id="roll-dice" disabled>🎲 Tirar Daus</button>
            <div class="center-buttons">
                <button id="build-btn" disabled>🏠 Construir</button>
            </div>
            <div class="auto-roll-container">
                <label class="auto-roll-toggle">
                    <input type="checkbox" id="auto-roll-checkbox">
                    <span class="auto-roll-slider"></span>
                </label>
                <span>Auto-roll</span>
                <span class="auto-roll-countdown" id="auto-roll-countdown">2</span>
            </div>
        `;

        center.innerHTML = centerHtml;
        return center;
    }

    getGridPosition(id) {
        // Map square IDs to CSS grid positions
        // Bottom row: 0-10 (right to left in grid columns 11 to 1)
        if (id <= 10) {
            return { row: 11, col: 11 - id };
        }
        // Left column: 11-19 (bottom to top in grid rows 10 to 2)
        if (id <= 19) {
            return { row: 10 - (id - 11), col: 1 };
        }
        // Top row: 20-30 (left to right in grid columns 1 to 11)
        if (id <= 30) {
            return { row: 1, col: id - 19 };
        }
        // Right column: 31-39 (top to bottom in grid rows 2 to 10)
        return { row: id - 29, col: 11 };
    }

    positionTokens(gameState, movingPlayerIndex = null) {
        if (!gameState?.players || !gameState.started) return;

        // Remove existing tokens
        document.querySelectorAll('.token-on-board').forEach(t => t.remove());

        // Group players by position
        const playersByPosition = {};
        gameState.players.forEach((player, index) => {
            if (!player.bankrupt) {
                if (!playersByPosition[player.position]) {
                    playersByPosition[player.position] = [];
                }
                playersByPosition[player.position].push({ player, index });
            }
        });

        // Place tokens on squares
        for (const [position, players] of Object.entries(playersByPosition)) {
            const squareEl = document.querySelector(`.square[data-id="${position}"]`);
            if (!squareEl) continue;

            const container = document.createElement('div');
            container.className = 'tokens-container';

            players.forEach(({ player, index }) => {
                const tokenEl = document.createElement('span');
                tokenEl.className = 'token-on-board';

                // Add moving animation if this is the moving player
                if (movingPlayerIndex !== null && index === movingPlayerIndex) {
                    tokenEl.classList.add('moving');
                    // Remove class after animation ends
                    tokenEl.addEventListener('animationend', () => {
                        tokenEl.classList.remove('moving');
                    }, { once: true });
                }

                tokenEl.innerHTML = renderToken(player.token, '2rem');
                container.appendChild(tokenEl);
            });

            squareEl.appendChild(container);
        }
    }

    updateCenterZoom(gameState) {
        const container = document.getElementById('center-zoom-squares');
        if (!container || !gameState?.players || !gameState.started) return;

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer) return;

        const currentPos = currentPlayer.position;

        // Get adjacent squares (previous, current, next)
        const prevPos = (currentPos - 1 + BOARD.TOTAL_SQUARES) % BOARD.TOTAL_SQUARES;
        const nextPos = (currentPos + 1) % BOARD.TOTAL_SQUARES;

        const positions = [prevPos, currentPos, nextPos];

        container.innerHTML = positions.map((pos, idx) => {
            const square = SQUARES[pos];
            const isCurrent = idx === 1;
            const propState = gameState.properties[square.id];
            const groupInfo = square.group ? PROPERTY_GROUPS[square.group] : null;

            let classes = ['center-zoom-square', square.type];
            if (isCurrent) classes.push('current');
            else classes.push('adjacent');
            if ([0, 10, 20, 30].includes(pos)) classes.push('corner');

            let imageHtml = '';
            if (square.image) {
                imageHtml = `<img class="square-image" src="${square.image}" alt="${square.name}">`;
            } else if (square.icon) {
                imageHtml = `<span class="icon">${square.icon}</span>`;
            }

            let colorBar = '';
            if (groupInfo) {
                colorBar = `<div class="color-bar" style="background: ${groupInfo.color}"></div>`;
            }

            // Show tokens on this square
            const playersHere = gameState.players
                .filter((p, i) => !p.bankrupt && p.position === pos)
                .map(p => renderToken(p.token, '3.5rem'))
                .join('');

            const tokensHtml = playersHere ? `<div class="center-player-tokens">${playersHere}</div>` : '';

            return `
                <div class="${classes.join(' ')}">
                    ${colorBar}
                    ${imageHtml}
                    <div class="name">${square.name}</div>
                    ${tokensHtml}
                </div>
            `;
        }).join('');
    }

    setSquareClickHandler(handler) {
        this.onSquareClick = handler;
    }
}

// Export singleton instance
export const boardRenderer = new BoardRenderer();
export default boardRenderer;

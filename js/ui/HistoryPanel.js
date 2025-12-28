// History and Statistics Panel for Disney Monopoly
import { renderToken } from '../data/tokens.js';
import { PLAYER_COLORS } from '../constants.js';

class HistoryPanel {
    constructor() {
        this.history = [];
        this.maxEntries = 100;
    }

    addEntry(type, icon, text) {
        const now = new Date();
        const time = now.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });

        this.history.unshift({
            type,
            icon,
            text,
            time,
            timestamp: now.getTime()
        });

        // Keep only last entries
        if (this.history.length > this.maxEntries) {
            this.history = this.history.slice(0, this.maxEntries);
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const container = document.getElementById('history-list');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<div class="history-empty">La partida encara no ha començat...</div>';
            return;
        }

        container.innerHTML = this.history.map(entry => `
            <div class="history-entry ${entry.type}">
                <span class="time">${entry.time}</span>
                <span class="icon">${entry.icon}</span>
                <span class="text">${entry.text}</span>
            </div>
        `).join('');
    }

    clear() {
        this.history = [];
        this.updateDisplay();
    }

    getHistory() {
        return [...this.history];
    }

    setHistory(history) {
        this.history = history || [];
        this.updateDisplay();
    }
}

class StatsPanel {
    constructor() {
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

    init(playerCount) {
        for (let i = 0; i < playerCount; i++) {
            this.stats.totalMoneyEarned[i] = 0;
            this.stats.totalMoneySpent[i] = 0;
            this.stats.propertiesBought[i] = 0;
            this.stats.rentPaid[i] = 0;
            this.stats.rentReceived[i] = 0;
            this.stats.timesInJail[i] = 0;
            this.stats.doublesRolled[i] = 0;
        }
    }

    updateStat(statName, playerIndex, amount) {
        if (this.stats[statName] && this.stats[statName][playerIndex] !== undefined) {
            this.stats[statName][playerIndex] += amount;
        }
    }

    incrementTurns() {
        this.stats.turnsPlayed++;
    }

    getStats() {
        return this.stats;
    }

    setStats(stats) {
        this.stats = stats || this.stats;
    }

    updateDisplay(players) {
        const container = document.getElementById('stats-content');
        if (!container || !players || players.length === 0) return;

        const activePlayers = players.filter(p => !p.bankrupt);
        const maxMoney = Math.max(...activePlayers.map(p => p.money), 1);

        let html = `
            <div class="stats-section">
                <h4>💰 Diners Actuals</h4>
                ${activePlayers.map((p, idx) => {
                    const playerIndex = players.indexOf(p);
                    const pct = (p.money / maxMoney) * 100;
                    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
                    return `
                        <div class="stat-row">
                            <span class="player-name">${renderToken(p.token, '1.5rem')} ${p.name}</span>
                            <span class="value">${p.money}€</span>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${pct}%; background: ${color}"></div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="stats-section">
                <h4>🏠 Propietats Comprades</h4>
                ${players.map((p, i) => {
                    if (p.bankrupt) return '';
                    const count = this.stats.propertiesBought[i] || 0;
                    return `
                        <div class="stat-row">
                            <span class="player-name">${renderToken(p.token, '1.5rem')} ${p.name}</span>
                            <span class="value">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="stats-section">
                <h4>💸 Lloguer Pagat / Rebut</h4>
                ${players.map((p, i) => {
                    if (p.bankrupt) return '';
                    const paid = this.stats.rentPaid[i] || 0;
                    const received = this.stats.rentReceived[i] || 0;
                    const net = received - paid;
                    return `
                        <div class="stat-row">
                            <span class="player-name">${renderToken(p.token, '1.5rem')} ${p.name}</span>
                            <span class="value ${net >= 0 ? 'positive' : 'negative'}">${net >= 0 ? '+' : ''}${net}€</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="stats-section">
                <h4>🎲 Dobles Tirats / 🔒 Vegades a la Presó</h4>
                ${players.map((p, i) => {
                    if (p.bankrupt) return '';
                    const doubles = this.stats.doublesRolled[i] || 0;
                    const jails = this.stats.timesInJail[i] || 0;
                    return `
                        <div class="stat-row">
                            <span class="player-name">${renderToken(p.token, '1.5rem')} ${p.name}</span>
                            <span class="value">🎲 ${doubles} / 🔒 ${jails}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="stats-section">
                <h4>📈 Torns Jugats</h4>
                <div class="stat-row">
                    <span>Total de torns:</span>
                    <span class="value">${this.stats.turnsPlayed}</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// Tab switching
export function showPanelTab(tab) {
    const historyPanel = document.getElementById('history-panel');
    const statsPanel = document.getElementById('stats-panel');
    const tabs = document.querySelectorAll('.panel-tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'history') {
        historyPanel?.classList.remove('hidden');
        statsPanel?.classList.add('hidden');
        tabs[0]?.classList.add('active');
    } else {
        historyPanel?.classList.add('hidden');
        statsPanel?.classList.remove('hidden');
        tabs[1]?.classList.add('active');
    }
}

// Export singleton instances
export const historyPanel = new HistoryPanel();
export const statsPanel = new StatsPanel();

export default { historyPanel, statsPanel, showPanelTab };

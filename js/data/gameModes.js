// Game mode configurations for Disney Monopoly

export const GAME_MODES = {
    classic: {
        name: 'Classic',
        startingMoney: 1500,
        goReward: 200,
        jailFine: 50,
        maxTurns: 0,  // 0 = unlimited
        timeLimit: 0, // 0 = unlimited (in minutes)
        initialProperties: 0,
        auctionsEnabled: true
    },
    quick: {
        name: 'Rapid',
        startingMoney: 1000,
        goReward: 200,
        jailFine: 50,
        maxTurns: 60,
        timeLimit: 30,
        initialProperties: 2,
        auctionsEnabled: false
    },
    custom: {
        name: 'Personalitzat',
        startingMoney: 1500,
        goReward: 200,
        jailFine: 50,
        maxTurns: 0,
        timeLimit: 0,
        initialProperties: 0,
        auctionsEnabled: true
    }
};

export function createCustomConfig(options = {}) {
    return {
        name: 'Personalitzat',
        startingMoney: options.startingMoney ?? 1500,
        goReward: options.goReward ?? 200,
        jailFine: options.jailFine ?? 50,
        maxTurns: options.maxTurns ?? 0,
        timeLimit: options.timeLimit ?? 0,
        initialProperties: options.initialProperties ?? 0,
        auctionsEnabled: options.auctionsEnabled ?? true
    };
}

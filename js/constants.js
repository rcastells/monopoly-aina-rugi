// Game constants for Disney Monopoly

// Animation delays (in milliseconds)
export const DELAYS = {
    DICE_ROLL: 800,
    DICE_LAND: 200,
    TOKEN_MOVE_STEP: 350,
    CARD_SHOW: 500,
    MESSAGE_DISPLAY: 2000,
    MODAL_TRANSITION: 300,
    TURN_END: 500,
    AUTO_ROLL: 3000
};

// Board positions
export const BOARD = {
    TOTAL_SQUARES: 40,
    JAIL_POSITION: 10,
    GO_POSITION: 0,
    GO_TO_JAIL_POSITION: 30,
    FREE_PARKING_POSITION: 20
};

// Station positions on the board
export const STATION_POSITIONS = [5, 15, 25, 35];

// Building limits
export const BUILDING_LIMITS = {
    MAX_HOUSES_PER_PROPERTY: 4,
    HOTEL_LEVEL: 5,
    TOTAL_HOUSES: 32,
    TOTAL_HOTELS: 12
};

// Rent multipliers
export const RENT_MULTIPLIERS = {
    DOUBLE_RENT_NO_HOUSES: 2,
    STATION_RENTS: [25, 50, 100, 200],
    UTILITY_MULTIPLIERS: {
        ONE_OWNED: 4,
        TWO_OWNED: 10
    }
};

// Jail settings
export const JAIL = {
    MAX_TURNS: 3,
    FINE: 50
};

// Local storage key for save games
export const STORAGE_KEY = 'disneyMonopolySave';

// Player colors for stats
export const PLAYER_COLORS = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4'  // Cyan
];

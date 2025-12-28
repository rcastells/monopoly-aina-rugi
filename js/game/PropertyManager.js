// Property Manager for Disney Monopoly
import { SQUARES, PROPERTY_GROUPS, getPropertiesByGroup } from '../data/squares.js';
import { BUILDING_LIMITS, RENT_MULTIPLIERS } from '../constants.js';

class PropertyManager {
    constructor() {
        this.availableHouses = BUILDING_LIMITS.TOTAL_HOUSES;
        this.availableHotels = BUILDING_LIMITS.TOTAL_HOTELS;
    }

    reset() {
        this.availableHouses = BUILDING_LIMITS.TOTAL_HOUSES;
        this.availableHotels = BUILDING_LIMITS.TOTAL_HOTELS;
    }

    /**
     * Check if a player owns all properties in a color group
     */
    ownsFullColorGroup(playerIndex, group, properties) {
        if (!group) return false;
        const groupProperties = getPropertiesByGroup(group);
        return groupProperties.every(sq => {
            const prop = properties[sq.id];
            return prop && prop.owner === playerIndex;
        });
    }

    /**
     * Calculate rent for a property
     */
    calculateRent(square, propertyState, properties, diceRoll = 7) {
        // No rent on mortgaged properties
        if (propertyState.mortgaged) {
            return 0;
        }

        if (square.type === 'station') {
            // Count stations owned by this player
            const stationsOwned = Object.entries(properties)
                .filter(([id, prop]) => prop.owner === propertyState.owner && SQUARES[id].type === 'station')
                .length;
            return RENT_MULTIPLIERS.STATION_RENTS[stationsOwned - 1] || 25;
        }

        if (square.type === 'utility') {
            // Utility rent based on dice roll
            const utilitiesOwned = Object.entries(properties)
                .filter(([id, prop]) => prop.owner === propertyState.owner && SQUARES[id].type === 'utility')
                .length;
            const multiplier = utilitiesOwned === 2
                ? RENT_MULTIPLIERS.UTILITY_MULTIPLIERS.TWO_OWNED
                : RENT_MULTIPLIERS.UTILITY_MULTIPLIERS.ONE_OWNED;
            return multiplier * diceRoll;
        }

        // Regular property
        const houses = propertyState.houses || 0;
        let rent = square.rent[houses];

        // Double rent if owner has full color set and no houses built yet
        if (houses === 0 && this.ownsFullColorGroup(propertyState.owner, square.group, properties)) {
            rent *= RENT_MULTIPLIERS.DOUBLE_RENT_NO_HOUSES;
        }

        return rent;
    }

    /**
     * Buy a property for a player
     */
    buyProperty(player, square, properties) {
        if (properties[square.id]) {
            return { success: false, error: 'Property already owned' };
        }

        if (player.money < square.price) {
            return { success: false, error: 'Not enough money' };
        }

        // Deduct money
        player.money -= square.price;

        // Add property to player
        player.properties.push(square.id);

        // Update properties state
        properties[square.id] = {
            owner: player.index !== undefined ? player.index : 0,
            houses: 0,
            mortgaged: false
        };

        return { success: true };
    }

    /**
     * Get buildable properties for a player
     */
    getBuildableProperties(player, properties) {
        const buildable = [];

        player.properties.forEach(propId => {
            const square = SQUARES[propId];
            if (square.type !== 'property') return;

            const propState = properties[propId];
            if (!propState || propState.mortgaged) return;

            // Must own full color group
            if (!this.ownsFullColorGroup(propState.owner, square.group, properties)) return;

            // Check house count (max 4 houses or 1 hotel = 5)
            const currentHouses = propState.houses || 0;
            if (currentHouses >= 5) return;

            // Check even building rule - can't build if another property in group has fewer houses
            const groupProperties = getPropertiesByGroup(square.group);
            const canBuild = groupProperties.every(gp => {
                const gpState = properties[gp.id];
                return gpState && gpState.houses >= currentHouses;
            });

            if (!canBuild) return;

            // Check available houses/hotels
            if (currentHouses < 4 && this.availableHouses <= 0) return;
            if (currentHouses === 4 && this.availableHotels <= 0) return;

            buildable.push({
                squareId: propId,
                square,
                currentHouses,
                cost: square.houseCost
            });
        });

        return buildable;
    }

    /**
     * Build a house or hotel on a property
     */
    buildHouse(player, squareId, properties) {
        const square = SQUARES[squareId];
        const propState = properties[squareId];

        if (!propState || propState.owner !== player.properties.indexOf(squareId) < 0) {
            return { success: false, error: 'Property not owned by player' };
        }

        const currentHouses = propState.houses || 0;
        const cost = square.houseCost;

        if (player.money < cost) {
            return { success: false, error: 'Not enough money' };
        }

        if (currentHouses >= 5) {
            return { success: false, error: 'Maximum development reached' };
        }

        // Update resources
        if (currentHouses < 4) {
            if (this.availableHouses <= 0) {
                return { success: false, error: 'No houses available' };
            }
            this.availableHouses--;
        } else {
            if (this.availableHotels <= 0) {
                return { success: false, error: 'No hotels available' };
            }
            this.availableHotels--;
            // Return 4 houses when upgrading to hotel
            this.availableHouses += 4;
        }

        player.money -= cost;
        propState.houses = currentHouses + 1;

        return {
            success: true,
            newHouses: propState.houses,
            isHotel: propState.houses === 5
        };
    }

    /**
     * Mortgage a property
     */
    mortgageProperty(player, squareId, properties) {
        const square = SQUARES[squareId];
        const propState = properties[squareId];

        if (!propState) {
            return { success: false, error: 'Property not owned' };
        }

        if (propState.mortgaged) {
            return { success: false, error: 'Property already mortgaged' };
        }

        // Can't mortgage if there are houses on any property in the group
        if (square.group) {
            const groupProperties = getPropertiesByGroup(square.group);
            const hasHouses = groupProperties.some(gp => {
                const gpState = properties[gp.id];
                return gpState && gpState.houses > 0;
            });
            if (hasHouses) {
                return { success: false, error: 'Must sell houses first' };
            }
        }

        const mortgageValue = Math.floor(square.price / 2);
        player.money += mortgageValue;
        propState.mortgaged = true;

        return { success: true, mortgageValue };
    }

    /**
     * Unmortgage a property
     */
    unmortgageProperty(player, squareId, properties) {
        const square = SQUARES[squareId];
        const propState = properties[squareId];

        if (!propState || !propState.mortgaged) {
            return { success: false, error: 'Property not mortgaged' };
        }

        const unmortgageCost = Math.floor(square.price / 2 * 1.1); // 10% interest

        if (player.money < unmortgageCost) {
            return { success: false, error: 'Not enough money' };
        }

        player.money -= unmortgageCost;
        propState.mortgaged = false;

        return { success: true, cost: unmortgageCost };
    }

    /**
     * Get mortgage value of a property
     */
    getMortgageValue(square) {
        return Math.floor(square.price / 2);
    }

    /**
     * Get total assets value for a player
     */
    getPlayerAssetValue(player, properties) {
        let total = player.money;

        player.properties.forEach(propId => {
            const square = SQUARES[propId];
            const propState = properties[propId];

            if (propState) {
                if (propState.mortgaged) {
                    total += Math.floor(square.price / 2);
                } else {
                    total += square.price;
                    if (propState.houses > 0 && square.houseCost) {
                        total += propState.houses * square.houseCost;
                    }
                }
            }
        });

        return total;
    }

    getAvailableHouses() {
        return this.availableHouses;
    }

    getAvailableHotels() {
        return this.availableHotels;
    }

    setAvailableBuildings(houses, hotels) {
        this.availableHouses = houses;
        this.availableHotels = hotels;
    }
}

// Export singleton instance
export const propertyManager = new PropertyManager();
export default propertyManager;

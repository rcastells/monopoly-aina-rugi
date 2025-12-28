// Board squares and property groups for Disney Monopoly

export const PROPERTY_GROUPS = {
    brown: { color: '#8B4513', name: 'Clàssics Antics' },
    lightblue: { color: '#87CEEB', name: 'Princeses Clàssiques' },
    pink: { color: '#FF69B4', name: 'Princeses Modernes' },
    orange: { color: '#FFA500', name: 'Pixar Clàssics' },
    red: { color: '#FF0000', name: 'Aventures' },
    yellow: { color: '#FFD700', name: 'Pixar Moderns' },
    green: { color: '#228B22', name: 'Màgia i Fantasia' },
    darkblue: { color: '#00008B', name: 'Moderns Premium' }
};

// Board squares definition (clockwise from GO)
export const SQUARES = [
    // Bottom row (right to left when looking at board)
    { id: 0, name: 'SORTIDA', type: 'go', image: 'images/special/salida.png' },
    { id: 1, name: 'Blancaneu', type: 'property', group: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, image: 'images/properties/blancanieves.png' },
    { id: 2, name: 'Cofre del Tresor', type: 'chest', image: 'images/special/cofre.png' },
    { id: 3, name: 'Pinotxo', type: 'property', group: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, image: 'images/properties/pinocho.png' },
    { id: 4, name: 'Impost Màgic', type: 'tax', amount: 75, image: 'images/special/impuesto.png' },
    { id: 5, name: 'Disneyland', type: 'station', price: 200, image: 'images/stations/disneyland.png' },
    { id: 6, name: 'La Ventafocs', type: 'property', group: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, image: 'images/properties/cenicienta.png' },
    { id: 7, name: 'Sort', type: 'chance', image: 'images/special/suerte.png' },
    { id: 8, name: 'La Bella Dorment', type: 'property', group: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, image: 'images/properties/belladurmiente.png' },
    { id: 9, name: 'La Bella i la Bèstia', type: 'property', group: 'lightblue', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, image: 'images/properties/bella_bestia.png' },

    // Left column (bottom to top)
    { id: 10, name: 'PRESÓ', type: 'jail', image: 'images/special/carcel.png' },
    { id: 11, name: 'La Sireneta', type: 'property', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, image: 'images/properties/sirenita.png' },
    { id: 12, name: 'Disney+', type: 'utility', price: 150, image: 'images/special/disneyplus.png' },
    { id: 13, name: 'Aladdin', type: 'property', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, image: 'images/properties/aladdin.png' },
    { id: 14, name: 'Pocahontas', type: 'property', group: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, image: 'images/properties/pocahontas.png' },
    { id: 15, name: 'Disney World', type: 'station', price: 200, image: 'images/stations/disneyworld.png' },
    { id: 16, name: 'Toy Story', type: 'property', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, image: 'images/properties/toystory.png' },
    { id: 17, name: 'Cofre del Tresor', type: 'chest', image: 'images/special/cofre.png' },
    { id: 18, name: 'Monsters Inc', type: 'property', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, image: 'images/properties/monstruos.png' },
    { id: 19, name: 'Buscant en Nemo', type: 'property', group: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, image: 'images/properties/nemo.png' },

    // Top row (left to right)
    { id: 20, name: 'PÀRQUING', type: 'parking', image: 'images/special/parking.png' },
    { id: 21, name: 'El Rei Lleó', type: 'property', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, image: 'images/properties/reyleon.png' },
    { id: 22, name: 'Sort', type: 'chance', image: 'images/special/suerte.png' },
    { id: 23, name: 'Mulan', type: 'property', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, image: 'images/properties/mulan.png' },
    { id: 24, name: 'Hercules', type: 'property', group: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, image: 'images/properties/hercules.png' },
    { id: 25, name: 'Disneyland Paris', type: 'station', price: 200, image: 'images/stations/disneyland-paris.png' },
    { id: 26, name: 'Els Increïbles', type: 'property', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, image: 'images/properties/increibles.png' },
    { id: 27, name: 'Up', type: 'property', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, image: 'images/properties/up.png' },
    { id: 28, name: 'Disney Channel', type: 'utility', price: 150, image: 'images/special/disneychannel.png' },
    { id: 29, name: 'Coco', type: 'property', group: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, image: 'images/properties/coco.png' },

    // Right column (top to bottom)
    { id: 30, name: 'ANAR A PRESÓ', type: 'go-jail', image: 'images/special/ir-carcel.png' },
    { id: 31, name: 'Frozen', type: 'property', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, image: 'images/properties/frozen.png' },
    { id: 32, name: 'Enredats', type: 'property', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, image: 'images/properties/rapunzel.png' },
    { id: 33, name: 'Cofre del Tresor', type: 'chest', image: 'images/special/cofre.png' },
    { id: 34, name: 'Moana', type: 'property', group: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, image: 'images/properties/moana.png' },
    { id: 35, name: 'Tokyo Disney', type: 'station', price: 200, image: 'images/stations/tokyo-disney.png' },
    { id: 36, name: 'Sort', type: 'chance', image: 'images/special/suerte.png' },
    { id: 37, name: 'Encanto', type: 'property', group: 'darkblue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, image: 'images/properties/encanto.png' },
    { id: 38, name: 'Impost de Luxe', type: 'tax', amount: 100, image: 'images/special/impuesto-lujo.png' },
    { id: 39, name: 'Raya', type: 'property', group: 'darkblue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, image: 'images/properties/raya.png' }
];

// Get all properties of a specific color group
export function getPropertiesByGroup(group) {
    return SQUARES.filter(sq => sq.type === 'property' && sq.group === group);
}

// Get all stations
export function getStations() {
    return SQUARES.filter(sq => sq.type === 'station');
}

// Get all utilities
export function getUtilities() {
    return SQUARES.filter(sq => sq.type === 'utility');
}

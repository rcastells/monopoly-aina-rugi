// Token definitions for Disney Monopoly

export const TOKENS = [
    { emoji: '❄️', name: 'Elsa', image: 'images/tokens/elsa.png' },
    { emoji: '🦁', name: 'Simba', image: 'images/tokens/simba.png' },
    { emoji: '🧜‍♀️', name: 'Ariel', image: 'images/tokens/sirenita.png' },
    { emoji: '🤠', name: 'Woody', image: 'images/tokens/woody.png' },
    { emoji: '⚔️', name: 'Mulan', image: 'images/tokens/mulan.png' },
    { emoji: '🌊', name: 'Vaiana', image: 'images/tokens/vaiana.png' },
    { emoji: '🧞', name: 'Genie', image: 'images/tokens/ganie.png' },
    { emoji: '🦹', name: 'Scar', image: 'images/tokens/scar.png' },
    { emoji: '🤖', name: 'WALL-E', image: 'images/tokens/walle.png' },
    { emoji: '🎬', name: 'Wachowsky', image: 'images/tokens/wachowsky.png' }
];

export function renderToken(token, size = '2rem') {
    if (token.image) {
        return `<img src="${token.image}" alt="${token.name}" style="width: ${size}; height: ${size}; object-fit: contain; vertical-align: middle;">`;
    }
    return `<span style="font-size: ${size};">${token.emoji}</span>`;
}

export function renderTokenSmall(token) {
    return renderToken(token, '2.2rem');
}

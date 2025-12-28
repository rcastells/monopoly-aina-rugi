// Chance and Community Chest cards for Disney Monopoly

export const CHANCE_CARDS = [
    { id: 1, text: 'La màgia de la Fada Madrina et porta a la SORTIDA!', action: 'goto', destination: 0, collectGo: true },
    { id: 2, text: 'El Geni et concedeix un desig! Cobra 150€', action: 'collect', amount: 150 },
    { id: 3, text: 'Simba et convida a les Terres del Regne! Ves a El Rei Lleó', action: 'goto', destination: 21 },
    { id: 4, text: 'Oh no! La Reina Malvada et envia a la presó', action: 'jail' },
    { id: 5, text: 'Woody organitza una festa! Cobra 100€ de cada jugador', action: 'collectFromAll', amount: 100 },
    { id: 6, text: 'La catifa màgica et porta a Disneyland!', action: 'goto', destination: 5 },
    { id: 7, text: 'Elsa congela els teus deutes! El banc et paga 200€', action: 'collect', amount: 200 },
    { id: 8, text: 'Reparacions al teu castell! Paga 25€ per cada casa i 100€ per hotel', action: 'repairs', houseCost: 25, hotelCost: 100 },
    { id: 9, text: 'Mushu et porta bona sort! Avança 3 caselles', action: 'move', spaces: 3 },
    { id: 10, text: 'Rapunzel et deixa el seu cabell! Ves a Enredats', action: 'goto', destination: 32 },
    { id: 11, text: 'Sebastian ha trobat un tresor! Cobra 50€', action: 'collect', amount: 50 },
    { id: 12, text: 'Campanilla et fa volar! Ves al Pàrquing Gratuït', action: 'goto', destination: 20 },
    { id: 13, text: 'Olaf necessita ajuda! Paga 50€ al banc', action: 'pay', amount: 50 },
    { id: 14, text: 'Maui et beneeix! Cobra 100€', action: 'collect', amount: 100 },
    { id: 15, text: 'Retrocedeix fins a Blancaneu!', action: 'goto', destination: 1 },
    { id: 16, text: 'El mirall màgic et mostra el camí! Avança fins a la propera estació', action: 'nextStation' },
    { id: 17, text: '🎫 La Fada Madrina et protegeix! Targeta per Sortir de la Presó Gratis. Guarda-la fins que la necessitis.', action: 'getOutOfJailFree', cardType: 'chance' }
];

export const CHEST_CARDS = [
    { id: 1, text: 'Error del banc a favor teu! Cobra 200€', action: 'collect', amount: 200 },
    { id: 2, text: 'És el teu aniversari! Cada jugador et dona 25€', action: 'collectFromAll', amount: 25 },
    { id: 3, text: 'Herència de l\'oncle Scrooge! Cobra 100€', action: 'collect', amount: 100 },
    { id: 4, text: 'Paga la factura del metge! 50€', action: 'pay', amount: 50 },
    { id: 5, text: 'Venda de galetes amb les princeses! Cobra 50€', action: 'collect', amount: 50 },
    { id: 6, text: 'Ves directament a la SORTIDA! Cobra 200€', action: 'goto', destination: 0, collectGo: true },
    { id: 7, text: 'Multa per excés de màgia! Paga 20€', action: 'pay', amount: 20 },
    { id: 8, text: 'Guanyes el concurs de bellesa d\'Agrabah! Cobra 150€', action: 'collect', amount: 150 },
    { id: 9, text: 'Dividends de Disney+! Cobra 75€', action: 'collect', amount: 75 },
    { id: 10, text: 'Paga l\'assegurança del teu castell! 100€', action: 'pay', amount: 100 },
    { id: 11, text: 'L\'àvia Tala et guia! Avança a Moana', action: 'goto', destination: 34 },
    { id: 12, text: 'Despeses escolars a l\'Acadèmia de Princeses! Paga 75€', action: 'pay', amount: 75 },
    { id: 13, text: 'Has trobat la llàntia! Cobra 100€', action: 'collect', amount: 100 },
    { id: 14, text: 'Reparacions del castell! Paga 40€ per casa i 115€ per hotel', action: 'repairs', houseCost: 40, hotelCost: 115 },
    { id: 15, text: 'Premi del Festival de les Llums! Cobra 125€', action: 'collect', amount: 125 },
    { id: 16, text: 'Et toca anar a la presó! No passes per la sortida', action: 'jail' },
    { id: 17, text: '🎫 El Geni et concedeix un desig! Targeta per Sortir de la Presó Gratis. Guarda-la fins que la necessitis.', action: 'getOutOfJailFree', cardType: 'chest' }
];

/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/

let betTotal; // number
let availableCash; // number (will change depending on bet and win or lose)
let playerHand; // array
let playerCardValue; // number
let dealerHand; // array
let dealerCardValue; // number
let shuffledDeck; // array
let showFirstCard; // boolean


/*----- cached element references -----*/
const dealerHandEl = document.querySelectorAll('#dealers-hand div');
const dealerTotalEl = document.getElementById('dealer-card-value');
// const dealerTotal01 = document.getElementById('dealer-card-value-01');


const playerHandEl = document.querySelectorAll('#players-hand div');
const playerTotalEl = document.getElementById('player-card-value');
// const playerTotal01 = document.getElementById('player-card-value-01');


/*----- event listeners -----*/



/*----- functions -----*/

init();

function init() {
    betTotal = 0;
    availableCash = 200;
    playerHand = [];
    playerCardValue = 0;
    dealerHand = [];
    dealerCardValue = 0;
    shuffledDeck = getNewShuffledDeck();

    //creating the dealerHand array - will need to move to a confirm bet event handler function
    while (dealerHand.length < 2) {
        dealerHand.push(shuffledDeck.pop()); 
    }
    while (playerHand.length < 2) {
        playerHand.push(shuffledDeck.pop()); 
    }



    render();
};

function render() {
    renderDealerHand(); //done & working

    renderDealerHandValue(); // done & working - won't be visible until player hits stand - if stand has no been pressed, either show ? or unknown
    
    renderPlayerHand(); //done & working
    renderPlayerHandValue(); // not created
    // renderBank(); // not created
    // renderBet(); // not created
    // Render bet
    
};

function buildMasterDeck() {
    const deck = [];
    // Use nested forEach to generate card objects
    suits.forEach(function(suit) {
        ranks.forEach(function(rank) {
        deck.push({
            // The 'face' property maps to the library's CSS classes for cards
            face: `${suit}${rank}`,
            // Setting the 'value' property for game of blackjack, not war
            value: Number(rank) || (rank === 'A' ? 11 : 10)
        });
        });
    });
    return deck;
}

function getNewShuffledDeck() {
    // Create a copy of the masterDeck (leave masterDeck untouched!)
    const tempDeck = [...masterDeck];
    const newShuffledDeck = [];
    while (tempDeck.length) {
        // Get a random index for a card still in the tempDeck
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    }
    return newShuffledDeck;
}

function renderDealerHand() {
    const firstCardClass = showFirstCard ? `${dealerHand[0].face}` : 'back';
    dealerHandEl[0].classList.add(firstCardClass);

    for (let i = 1; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        dealerHandEl[i].classList.add(`${card.face}`);
    }
}

function renderDealerHandValue() {
    let sum = 0;
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        sum += card.value;
    }
    dealerTotalEl.textContent = sum;
};

function renderPlayerHand() {
    for (let i = 0; i < playerHand.length; i++) {
        const card = playerHand[i];
        playerHandEl[i].classList.add(`${card.face}`);
    }
};

function renderPlayerHandValue() {
    let sum = 0;
    for (let i = 0; i < playerHand.length; i++) {
        const card = playerHand[i];
        sum += card.value;
    }
    playerTotalEl.textContent = sum;
};

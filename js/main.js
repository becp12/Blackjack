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
let showSecondCard; // boolean (defaults to false because undefined is falsy)


/*----- cached element references -----*/
const dealerHandEl = document.querySelectorAll('#dealers-hand div');
const dealerTotalEl = document.getElementById('dealer-card-value');
// const dealerTotal01 = document.getElementById('dealer-card-value-01');
const playerHandEl = document.querySelectorAll('#players-hand div');
const playerTotalEl = document.getElementById('player-card-value');
// const playerTotal01 = document.getElementById('player-card-value-01');
const bankTotalEl = document.getElementById("bank-total");
const plusFiveBtnEl = document.getElementById('plusFive');
const minusFiveBtnEl = document.getElementById('minusFive');
const betTotalEl = document.getElementById('bet-total');
const confirmBtnEl = document.getElementById('confirm');
const hitBtnEl = document.getElementById('hit-btn');
const standBtnEl = document.getElementById('stand-btn');


/*----- event listeners -----*/
plusFiveBtnEl.addEventListener('click', handlePlusBet);
minusFiveBtnEl.addEventListener('click', handleMinusBet);
confirmBtnEl.addEventListener('click', handleConfirmBet)

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
    betTotalEl.textContent = `$${betTotal.toFixed(2)}`;

    //creating the dealerHand & plyaerHand array - will need to move to a confirm bet event handler function
    while (dealerHand.length < 2) {
        dealerHand.push(shuffledDeck.pop()); 
    }
    while (playerHand.length < 2) {
        playerHand.push(shuffledDeck.pop()); 
    }

    render();
};

function render() {
    renderDealerHand();
    renderPlayerHand();
    renderPlayerHandValue();
    renderMoney();
    renderButtons();    
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

function handlePlusBet() {
    if (betTotal === availableCash)
        return;
    betTotal += 5;
    render();
}

function handleMinusBet() {
    if (betTotal === 0) 
        return;
    betTotal -= 5;
    render();
}

function renderButtons() {
    confirmBtnEl.style.visibility = 'visible';
    plusFiveBtnEl.style.visibility = 'visible';
    minusFiveBtnEl.style.visibility = 'visible';
    hitBtnEl.style.visibility = 'hidden';
    standBtnEl.style.visibility = 'hidden';
}

function handleConfirmBet() {
   confirmBtnEl.style.visibility = 'hidden';
   plusFiveBtnEl.style.visibility = 'hidden';
   minusFiveBtnEl.style.visibility = 'hidden';
   hitBtnEl.style.visibility = 'visible';
   standBtnEl.style.visibility = 'visible';
}

function renderMoney() {
    betTotalEl.textContent = `$${betTotal.toFixed(2)}`;
    bankTotalEl.textContent = `$${(availableCash - betTotal).toFixed(2)}`;
}

function renderDealerHand() {
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        // Assign card face unless it's the not second card or showSecondCard is false
        const cardClass = (i !== 1 || showSecondCard) ? `${card.face}` : 'back';
        dealerHandEl[i].classList.add(cardClass);
    }
}



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

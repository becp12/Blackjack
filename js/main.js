/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const masterDeck = buildMasterDeck();

/*----- app's state (variables) -----*/

let betTotal; // number
let availableCash; // number (will change depending on bet and win or lose)
let playerHand; // array
let playerHandValue; // number
let dealerHand; // array
let dealerHandValue; // number
let shuffledDeck; // array
let showSecondCard; // boolean (defaults to false because undefined is falsy)
let gameStatus; // 'null if game in progress, W if player wins, L is player loses


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
const parentHitStand = document.getElementById('hit-stand')


/*----- event listeners -----*/
plusFiveBtnEl.addEventListener('click', handlePlusBet);
minusFiveBtnEl.addEventListener('click', handleMinusBet);
confirmBtnEl.addEventListener('click', handleConfirmBet);
hitBtnEl.addEventListener('click', handleHitBtn);
standBtnEl.addEventListener('click', handleStandBtn);

/*----- functions -----*/

init();

function init() {
    betTotal = 0;
    availableCash = 200;
    playerHand = [];
    playerHandValue = 0;
    dealerHand = [];
    dealerHandValue = 0;
    shuffledDeck = getNewShuffledDeck();
    betTotalEl.textContent = `$${betTotal.toFixed(2)}`;

    render();
};

function render() {
    renderDealerHand();
    renderDealerHandValue();
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
    // Guard
    if (confirmBtnEl.style.visibility === 'hidden' ||
    plusFiveBtnEl.style.visibility === 'hidden' ||
    minusFiveBtnEl.style.visibility === 'hidden' ||
    parentHitStand.style.visibility === 'visible') {
        return;
    }
    confirmBtnEl.style.visibility = 'visible';
    plusFiveBtnEl.style.visibility = 'visible';
    minusFiveBtnEl.style.visibility = 'visible';
    parentHitStand.style.visibility = 'hidden';
}

function handleConfirmBet() {
    confirmBtnEl.style.visibility = 'hidden';
    plusFiveBtnEl.style.visibility = 'hidden';
    minusFiveBtnEl.style.visibility = 'hidden';
    parentHitStand.style.visibility = 'visible';

    while (dealerHand.length < 2) {
        dealDealerHand();
    }
    while (playerHand.length < 2) {
        dealPlayerHand() 
    }
    render();
}

function handleHitBtn() {
    dealPlayerHand()
    render()
}

function handleStandBtn() {
    parentHitStand.style.visibility = 'hidden';
    showSecondCard = true;   
    while (dealerHand.length < 5 && dealerHandValue < 17) {
        
        dealDealerHand();
    };
    render();
}

function dealPlayerHand() {
    playerHand.push(shuffledDeck.pop()); 
    let sum = 0;
    for (let i = 0; i < playerHand.length; i++) {
        const card = playerHand[i];
        sum += card.value;
    };
    playerHandValue = sum;
}

function dealDealerHand() {
    dealerHand.push(shuffledDeck.pop());
    let sum = 0;
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        sum += card.value;
    }
    dealerHandValue = sum;
}

function renderMoney() {
    betTotalEl.textContent = `$${betTotal.toFixed(2)}`;
    bankTotalEl.textContent = `$${(availableCash - betTotal).toFixed(2)}`;
}

function renderDealerHand() {
    dealerHandEl[1].classList.remove('back');
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        // Assign card face unless it's the not second card or showSecondCard is false
        const cardClass = (i !== 1 || showSecondCard) ? `${card.face}` : 'back';
        dealerHandEl[i].classList.add(cardClass);
    };
}

function renderPlayerHand() {
    for (let i = 0; i < playerHand.length; i++) {
        const card = playerHand[i];
        playerHandEl[i].classList.add(`${card.face}`);
    };
};

function renderPlayerHandValue() {
    playerTotalEl.textContent = playerHandValue;
    if (playerHandValue >= 21 ||
        playerHand.length === 5) {
            hitBtnEl.style.visibility = 'hidden';
        };
};

function renderDealerHandValue() {
    if (showSecondCard) {
        dealerTotalEl.textContent = dealerHandValue;
    }   
}
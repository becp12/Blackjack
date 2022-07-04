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
const playerHandEl = document.querySelectorAll('#players-hand div');
const playerTotalEl = document.getElementById('player-card-value');
const bankTotalEl = document.getElementById("bank-total");
const plusFiveBtnEl = document.getElementById('plusFive');
const minusFiveBtnEl = document.getElementById('minusFive');
const betTotalEl = document.getElementById('bet-total');
const confirmBtnEl = document.getElementById('confirm');
const hitBtnEl = document.getElementById('hit-btn');
const standBtnEl = document.getElementById('stand-btn');
const parentHitStandEl = document.getElementById('hit-stand')
const newGameBtnEl = document.getElementById('new-game');
const newHandBtnEl = document.getElementById('next-hand');
const winnerMessageEl = document.getElementById('winner-message');
const buttonRowEl = document.getElementById('button-row')


/*----- event listeners -----*/
plusFiveBtnEl.addEventListener('click', handlePlusBet);
minusFiveBtnEl.addEventListener('click', handleMinusBet);
confirmBtnEl.addEventListener('click', handleConfirmBet);
hitBtnEl.addEventListener('click', handleHitBtn);
standBtnEl.addEventListener('click', handleStandBtn);

/*----- init functions -----*/

init();

function init() {
    betTotal = 0;
    availableCash = 200;
    playerHand = [];
    playerHandValue = 0;
    dealerHand = [];
    dealerHandValue = 0;
    shuffledDeck = getNewShuffledDeck();
    gameStatus = null;
    render();
};

/*----- render functions -----*/

function render() {
    renderDealerHand();
    renderDealerHandValue();
    renderPlayerHand();
    renderPlayerHandValue();
    renderMoney();
    renderButtons();   
    renderWinner();
};

function renderDealerHand() {
    dealerHandEl[1].classList.remove('back');
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        // Assign card face unless it's the not second card or showSecondCard is false
        const cardClass = (i !== 1 || showSecondCard) ? `${card.face}` : 'back';
        dealerHandEl[i].classList.add(cardClass);
    };
}

function renderDealerHandValue() {
    if (showSecondCard) {
        dealerTotalEl.textContent = dealerHandValue;
    }   
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
            parentHitStandEl.style.visibility = 'hidden';
        };
};

function renderMoney() {
    if (gameStatus === null) {
        betTotalEl.textContent = `$${betTotal.toFixed(2)}`;
        bankTotalEl.textContent = `$${(availableCash - betTotal).toFixed(2)}`;
    } else {
        bankTotalEl.textContent = `$${(availableCash).toFixed(2)}`;
        betTotalEl.textContent = `$${betTotal.toFixed(2)}`;
    }
}

function renderButtons() {
    if (gameStatus === null) {
        buttonRowEl.style.visibility = 'hidden';
    } else {
        buttonRowEl.style.visibility = 'visible';
    }
    // Guard
    if (confirmBtnEl.style.visibility === 'hidden' ||
    plusFiveBtnEl.style.visibility === 'hidden' ||
    minusFiveBtnEl.style.visibility === 'hidden' ||
    parentHitStandEl.style.visibility === 'visible') {
        return;
    }
    confirmBtnEl.style.visibility = 'visible';
    plusFiveBtnEl.style.visibility = 'visible';
    minusFiveBtnEl.style.visibility = 'visible';
    parentHitStandEl.style.visibility = 'hidden';
}

function renderWinner() {
    if (gameStatus === null) {
        return;
    } else if (gameStatus === 'PlayerHigher' || gameStatus === 'DealerBust' || gameStatus === 'Player21') {
        winnerMessageEl.textContent = 'Player Wins!';
    } else if (gameStatus === 'PlayerBust') {
        winnerMessageEl.textContent = 'Player Loses!';
    } else if (gameStatus === 'Tie') {
        winnerMessageEl.textContent = 'You Tied!'
    } else if (gameStatus === 'DealerHigher' || gameStatus === 'Dealer21') {
        winnerMessageEl.textContent = 'Dealer Wins!';
    }
}

/*----- base functions -----*/

// WILL ONLY EVER CALL ONCE - AT THE BEGINNING OF LOADING THE PAGE - NOT EVEN A NEW ROUND/NEW HAND/RESTART GAME WILL CALL THIS
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

/*----- handler functions -----*/

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

function handleConfirmBet(event) {
    event.target.style.visibility = 'hidden';
    plusFiveBtnEl.style.visibility = 'hidden';
    minusFiveBtnEl.style.visibility = 'hidden';
    parentHitStandEl.style.visibility = 'visible';

    while (dealerHand.length < 2) {
        dealDealerHand();
    }
    while (playerHand.length < 2) {
        dealPlayerHand() 
    }
    if (playerHandValue === 21) {
        gameStatus = 'Player21';
        availableCash += (betTotal + (betTotal * 1.5));
        betTotal = 0;
    } else if (playerHandValue > 21) {
        gameStatus = 'PlayerBust';
        availableCash -= betTotal;
        betTotal = 0;
    } else {
        gameStatus = null;
    };
    render();
}

function handleHitBtn() {
    dealPlayerHand()
    if (playerHandValue === 21) {
        gameStatus = 'Player21';
        availableCash += (betTotal + (betTotal * 1.5));
        betTotal = 0;
    } else if (playerHandValue > 21) {
        gameStatus = 'PlayerBust';
        availableCash -= betTotal;
        betTotal = 0;
    } else {
        gameStatus = null;
    };
    render();
}

function handleStandBtn() {
    parentHitStandEl.style.visibility = 'hidden';
    showSecondCard = true;   
    while (dealerHand.length < 5 && dealerHandValue < 17) {
            dealDealerHand();
    };
    determineWinner();
    render();
}

/*----- additional functions -----*/

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

function determineWinner() {
    if (showSecondCard === false) return;
    if (playerHandValue > dealerHandValue && playerHandValue <= 21) {
        gameStatus = 'PlayerHigher';
    } else if (dealerHandValue > 21 && playerHandValue < 21) {
        gameStatus = 'DealerBust';
    } else if (dealerHandValue > playerHandValue && dealerHandValue < 21) {
        gameStatus = 'DealerHigher';
    } else if (dealerHandValue === 21 && playerHandValue !== 21) {
        gameStatus = 'Dealer21'
    } else if (playerHandValue === dealerHandValue) {
        gameStatus = 'Tie';
    } else {
        availableCash -= betTotal;
    }
    calculateWinnings();
};

function calculateWinnings() {
    if (showSecondCard === false ||
        gameStatus === null) return;
    if (gameStatus === 'PlayerHigher') {
        availableCash += (betTotal * 2);
        betTotal = 0;
    } else if (gameStatus === 'DealerBust') {
        availableCash += (betTotal * 2);
        betTotal = 0;
    } else if (gameStatus === 'DealerHigher') {
        availableCash -= betTotal;
        betTotal = 0;
    } else if (gameStatus === 'Dealer21') {
        availableCash -= betTotal;
        betTotal = 0;
    } else if (gameStatus === 'Tie') {
        availableCash += (betTotal);
        betTotal = 0;
    }
};
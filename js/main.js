/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const masterDeck = buildMasterDeck();
const isVisible = (element) => element.style.visibility !== 'hidden';
const setVisible = (element, visible) => element.style.visibility = (visible ? 'visible' : 'hidden');

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
const buttonRowEl = document.getElementById('button-row');
const betButtonsEl = document.getElementById('bet-buttons');


/*----- event listeners -----*/
plusFiveBtnEl.addEventListener('click', handlePlusBet);
minusFiveBtnEl.addEventListener('click', handleMinusBet);
confirmBtnEl.addEventListener('click', handleConfirmBet);
hitBtnEl.addEventListener('click', handleHitBtn);
standBtnEl.addEventListener('click', handleStandBtn);
newGameBtnEl.addEventListener('click', handleNewGameBtn);
newHandBtnEl.addEventListener('click', handleNewHandBtn);

/*----- init functions -----*/

init();

function init() {
    availableCash = 200;
    reset();
};

function reset() {
    betTotal = 0;
    playerHand = [];
    playerHandValue = 0;
    dealerHand = [];
    dealerHandValue = 0;
    shuffledDeck = getNewShuffledDeck();
    gameStatus = null;
    showSecondCard = false;
    dealerTotalEl.textContent = '???';

    const resetCards = function (el) {
        el.classList.remove(...el.classList);
        el.classList.add('card');
    }

    dealerHandEl.forEach(resetCards);
    playerHandEl.forEach(resetCards);

    render();
}

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
        setVisible(dealerHandEl[i], true);
    };

    for (let i = dealerHand.length; i < dealerHandEl.length; i++) {
        setVisible(dealerHandEl[i], false);
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
        setVisible(playerHandEl[i], true);
    };

    for (let i = playerHand.length; i < playerHandEl.length; i++) {
        setVisible(playerHandEl[i], false);
    };
};

function renderPlayerHandValue() {
    playerTotalEl.textContent = playerHandValue;
    if (playerHandValue >= 21 ||
        playerHand.length === 5) {
        setVisible(parentHitStandEl, false);
    };
};

function renderMoney() {
    betTotalEl.textContent = `$${betTotal.toFixed(2)}`;
    bankTotalEl.textContent = `$${(availableCash).toFixed(2)}`;
}

function renderButtons() {
    if (gameStatus === null) {
        setVisible(buttonRowEl, false);
        if (!playerHand.length) {
            setVisible(betButtonsEl, true);
            setVisible(confirmBtnEl, betTotal > 0);
        }
    } else {
        setVisible(buttonRowEl, true);
        setVisible(betButtonsEl, false);
        setVisible(confirmBtnEl, false);
        setVisible(parentHitStandEl, false);
        if (availableCash >= 5) {
            newHandBtnEl.style.display = 'inline';
        } else {
            newHandBtnEl.style.display = 'none';
        }
        return;
    }

    if (playerHand.length === 5) {
        setVisible(hitBtnEl, false);
    }

    if (isVisible(betButtonsEl)) {
        setVisible(parentHitStandEl, false);
    } else {
        setVisible(parentHitStandEl, true);
    }
}

function renderWinner() {
    if (gameStatus === null) {
        return;
    } else if (gameStatus === 'PlayerHigher' || gameStatus === 'DealerBust') {
        winnerMessageEl.textContent = 'Player Wins!';
    } else if (gameStatus === 'playerBlackjack') {
        winnerMessageEl.textContent = 'Blackjack!';
    } else if (gameStatus === 'PlayerBust') {
        winnerMessageEl.textContent = 'Player Bust!';
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
    suits.forEach(function (suit) {
        ranks.forEach(function (rank) {
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
    if (availableCash === 0)
        return;
    betTotal += 5;
    availableCash -= 5;
    render();
}

function handleMinusBet() {
    if (betTotal === 0)
        return;
    betTotal -= 5;
    availableCash += 5;
    render();
}

function handleConfirmBet(event) {
    while (dealerHand.length < 2) {
        dealDealerHand();
    }
    while (playerHand.length < 2) {
        dealPlayerHand()
    }
    if (playerHandValue === 21) {
        gameStatus = 'playerBlackjack';
        availableCash += (betTotal + (betTotal * 1.5));
        betTotal = 0;
    } else if (playerHandValue > 21) {
        gameStatus = 'PlayerBust';
        betTotal = 0;
    } else {
        gameStatus = null;
    };
    render();

    if (playerHandValue === 21) {
        return;
    }
    setVisible(event.target, false);
    setVisible(betButtonsEl, false);
    setVisible(parentHitStandEl, true);
}

function handleHitBtn() {
    dealPlayerHand()
    if (playerHandValue === 21) {
        gameStatus = 'playerBlackjack';
        availableCash += (betTotal + (betTotal * 1.5));
        betTotal = 0;
    } else if (playerHandValue > 21) {
        gameStatus = 'PlayerBust';
        betTotal = 0;
    } else {
        gameStatus = null;
    };
    render();
}

function handleStandBtn() {
    setVisible(parentHitStandEl, false);

    showSecondCard = true;
    while (dealerHand.length < 5 && dealerHandValue < 17) {
        dealDealerHand();
    };
    determineWinner();
    render();
};

function handleNewGameBtn() {
    init();
};

function handleNewHandBtn() {
    reset();
};

/*----- additional functions -----*/

function dealPlayerHand() {
    playerHand.push(shuffledDeck.pop());

    let sum = 0;
    let aceCount = 0;
    for (let i = 0; i < playerHand.length; i++) {
        const card = playerHand[i];
        if (card.value === 11) {
            aceCount++;
        }
        sum += card.value;
    };

    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount--;
    }

    playerHandValue = sum;
}

function dealDealerHand() {
    dealerHand.push(shuffledDeck.pop());

    let sum = 0;
    let aceCount = 0;
    for (let i = 0; i < dealerHand.length; i++) {
        const card = dealerHand[i];
        if (card.value === 11) {
            aceCount++;
        }
        sum += card.value;
    };

    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount--;
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
        betTotal = 0;
    } else if (gameStatus === 'Dealer21') {
        betTotal = 0;
    } else if (gameStatus === 'Tie') {
        availableCash += (betTotal);
        betTotal = 0;
    }
};
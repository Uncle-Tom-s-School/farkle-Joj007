import React, { useState } from 'react';

// Típus a kockadobáshoz
type DiceRoll = number[];

const rollDice = (keepDice: number[]): DiceRoll => {
  // Create an array of rolled dice
  const newDice = Array.from({ length: 6 - keepDice.length }, () => Math.floor(Math.random() * 6) + 1);
  return [...keepDice, ...newDice]; // Combine kept dice with new rolls
};

// Pontszámítási logika
const calculateScore = (dice: DiceRoll): number => {
  const counts: { [key: number]: number } = {};
  let score = 0;

  // Minden kocka értékét megszámoljuk
  dice.forEach((die) => {
    counts[die] = counts[die] ? counts[die] + 1 : 1;
  });

  // Számítás a kockákra: 1-ek, 5-ök és hármasok
  Object.keys(counts).forEach((die) => {
    const count = counts[parseInt(die)]; //mennyiség
    const num = parseInt(die)==1 ? 10 : parseInt(die); //key

    // Három egyforma kocka esetén pontok
    if (count==3) {
      score+=num*100
    }
    else if (count==4) {
      score+=num*200
    }
    else if (count==5) {
      score+=num*400
    }
    else if (count==6) {
      score+=num*800
    }
    else if (count== 1 ) {
      if (num==10||num==5) {
        score += num*10
      }
    }
    else if (count == 2) {
      if (num==10||num==5) {
        score += num*20
      }
    }

  });

  return score;
};

const App: React.FC = () => {
  const [dice, setDice] = useState<DiceRoll>([0, 0, 0, 0, 0, 0]);
  const [lastRoundScore, setLastRoundScore] = useState<number>(0); // Store last round score
  const [playerScores, setPlayerScores] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0); // 0: Player 1, 1: Player 2
  const [rollCount, setRollCount] = useState<number>(0); // Dobásszámláló
  const [selectedDice, setSelectedDice] = useState<boolean[]>(Array(6).fill(false)); // Track selected dice
  const [message, setMessage] = useState<string>('');
  const [allowDiceSelection, setAllowDiceSelection] = useState<boolean>(true); // New state for selection control
  const [gameOver, setGameOver] = useState<boolean>(false); // New state to track game over condition

  const winningScore = 3000; 

  const handleRoll = () => {
    const keepDice = dice.filter((_, index) => selectedDice[index]); // Get the kept dice
    const newDice = rollDice(keepDice); // Roll new dice, keeping selected ones
    const score = calculateScore(newDice); // Calculate the score of the new dice

    setRollCount(rollCount + 1); // Növeljük a dobásszámlálót

    if (score === 0) {
      setMessage('Farkle! No points scored this round.');
      setLastRoundScore(0); // Reset last round score
      handleNextTurn(); // Pass the turn to the next player
    } else {
      setMessage(`You rolled a score of ${score} this round.`);
      setLastRoundScore(score); // Store only the last roll score
    }

    setDice(newDice);
    setSelectedDice(Array(6).fill(false)); // Reset selection after rolling
  };

  const handleDiceClick = (index: number) => {
    // Prevent selecting dice if roll count is zero
    if (rollCount === 0) {
      setMessage('You cannot select dice until you roll.');
      return;
    }

    if (allowDiceSelection) { // Only allow selection if permitted
      // Toggle the selection of the clicked die
      const newSelection = [...selectedDice];
      newSelection[index] = !newSelection[index];
      setSelectedDice(newSelection);
    }
  };

  const handleBank = () => {
    const newPlayerScores = [...playerScores];
    newPlayerScores[currentPlayer] += lastRoundScore; // Use only the last roll score

    if (newPlayerScores[currentPlayer] >= winningScore) {
      setMessage(`Player ${currentPlayer + 1} wins with ${newPlayerScores[currentPlayer]} points!`);
      setGameOver(true); // Set game over state
    } else {
      setMessage(`Player ${currentPlayer + 1} banked ${lastRoundScore} points.`);
    }

    setPlayerScores(newPlayerScores);
    setLastRoundScore(0); // Reset last round score for the next player
    setRollCount(0); // Reset the roll count for the next player
    setSelectedDice(Array(6).fill(false)); // Reset selection for the next player
    setAllowDiceSelection(false); // Disable dice selection after banking
    handleNextTurn(); // Switch to the next player
  };

  const handleNextTurn = () => {
    setCurrentPlayer((currentPlayer + 1) % 2); // Toggle between 0 and 1
    setAllowDiceSelection(true); // Re-enable selection for the new turn
    setDice([0, 0, 0, 0, 0, 0]);
  };

  const handleResetGame = () => {
    // Reset all states for a new game
    setDice([0, 0, 0, 0, 0, 0]);
    setLastRoundScore(0);
    setPlayerScores([0, 0]);
    setCurrentPlayer(0);
    setRollCount(0);
    setSelectedDice(Array(6).fill(false));
    setMessage('');
    setGameOver(false); // Reset game over state
    const lista:string[] = ["https://youtu.be/q3Mmh-w2RD0?si=D_a__NXHwgT3G59t","https://youtu.be/dQw4w9WgXcQ?si=KglH6NV3Rm0bnKEJ","https://youtu.be/iYvv7c61u7E?si=TbzVDmYG8plf8f3c"]
    window.open(lista[Math.floor(Math.random()*3)]);
  };

  return (
    <div className="App">
      <h1>Farkle Game - Two Players</h1>
      <div id="player1">
        <p>Player 1 Score:</p>
        <p>{playerScores[0]}/{winningScore}</p>
         
      </div>
      <div id="player2">
        <p>Player 2 Score:</p>
        <p>{playerScores[1]}/{winningScore}</p>
      </div>
      <p>{currentPlayer==1 ? "►" : "◄"}</p>
      <p>Last Roll Score: {lastRoundScore}</p>
      <p>Roll Count: {rollCount}/3</p> {/* Megjelenítjük a dobások számát */}
      <div className="dice-container">
        {dice.map((die, index) => (
          <span
            key={index}
            className={`die ${selectedDice[index] ? 'selected' : ''}`} // Add class based on selection
            onClick={() => handleDiceClick(index)} // Handle die click
          >
            {die}
          </span>
        ))}
      </div>
      <button onClick={handleRoll} disabled={rollCount >= 3 || gameOver}>Roll Dice</button> {/* Tiltás ha 3 dobás megtörtént vagy a játék véget ért */}
      <button onClick={handleBank}>
        Bank Score
      </button>
      <p>{message}</p>
      {gameOver && (
        <div id='gameOverDiv'>
          <h2>Game Over</h2>
          <button onClick={handleResetGame}>Start New Game</button>
        </div>
      )}
    </div>
  );
}

export default App;

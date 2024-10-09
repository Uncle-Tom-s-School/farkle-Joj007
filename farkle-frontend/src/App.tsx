import React, { useState } from 'react';

// Típus a kockadobáshoz
type DiceRoll = number[];

// Kockadobás függvény
const rollDice = (): DiceRoll => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 7)); // 0-6, a Devil's Head = 0
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
    const count = counts[parseInt(die)];
    const num = parseInt(die);

    // Három egyforma kocka esetén pontok
    if (count >= 3) {
      if (num === 0) {
        // Devil's Head (0) nem számít
        return;
      } else if (num === 1) {
        score += 1000;
      } else {
        score += num * 100;
      }

      // Kérjük a további kockák pontozását
      const additionalCount = count - 3;
      score += additionalCount * (num === 1 ? 100 : num === 5 ? 50 : 0);
    } else {
      // Egyesek és ötösök külön is pontot érnek
      if (num === 1) {
        score += count * 100;
      } else if (num === 5) {
        score += count * 50;
      }
    }
  });

  // Teljes és részleges sorok pontozása
  const sortedDice = [...dice].sort();
  if (sortedDice.join() === [1, 2, 3, 4, 5, 6].join()) {
    score += 1500; // Teljes sor
  } else if (sortedDice.join() === [2, 3, 4, 5, 6].join()) {
    score += 750; // Részleges sor 2-6
  } else if (sortedDice.join() === [1, 2, 3, 4, 5].join()) {
    score += 500; // Részleges sor 1-5
  }

  return score;
};

const App: React.FC = () => {
  const [dice, setDice] = useState<DiceRoll>([0, 0, 0, 0, 0, 0]); // 0: Devil's Head
  const [roundScore, setRoundScore] = useState<number>(0);
  const [playerScores, setPlayerScores] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0); // 0: Player 1, 1: Player 2
  const [rollCount, setRollCount] = useState<number>(0); // Dobásszámláló
  const [message, setMessage] = useState<string>('');
  const winningScore = 4000;

  const handleRoll = () => {
    const newDice = rollDice();
    const score = calculateScore(newDice);

    setRollCount(rollCount + 1); // Növeljük a dobásszámlálót

    if (score === 0) {
      setMessage('Farkle! No points scored this round. Your turn is over.');
      setRoundScore(0);
      handleNextTurn(); // Pass the turn to the next player
    } else {
      setMessage(`You rolled a score of ${score} this round.`);
      setRoundScore(roundScore + score);
    }

    setDice(newDice);
  };

  const handleBank = () => {
    const newPlayerScores = [...playerScores];
    newPlayerScores[currentPlayer] += roundScore;

    if (newPlayerScores[currentPlayer] >= winningScore) {
      setMessage(`Player ${currentPlayer + 1} wins with ${newPlayerScores[currentPlayer]} points!`);
    } else {
      setMessage(`Player ${currentPlayer + 1} banked ${roundScore} points.`);
    }

    setPlayerScores(newPlayerScores);
    setRoundScore(0);
    setRollCount(0); // Reset the roll count for the next player
    handleNextTurn(); // Switch to the next player
  };

  const handleNextTurn = () => {
    setCurrentPlayer((currentPlayer + 1) % 2); // Toggle between 0 and 1
  };

  return (
    <div className="App">
      <h1>Farkle Game - Two Players</h1>
      <p>Player 1 Score: {playerScores[0]}</p>
      <p>Player 2 Score: {playerScores[1]}</p>
      <p>Current Player: Player {currentPlayer + 1}</p>
      <p>Round Score: {roundScore}</p>
      <p>Roll Count: {rollCount}/3</p> {/* Megjelenítjük a dobások számát */}
      <div className="dice-container">
        {dice.map((die, index) => (
          <span key={index} className="die">
            {die === 0 ? "🤡" : die} {/* A Devil's Head emoji */}
          </span>
        ))}
      </div>
      <button onClick={handleRoll} disabled={rollCount >= 3}>Roll Dice</button> {/* Tiltás ha 3 dobás megtörtént */}
      <button onClick={handleBank} disabled={roundScore === 0}>
        Bank Score
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App;

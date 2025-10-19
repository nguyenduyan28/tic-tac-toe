import { useState } from 'react'
import './App.css'

function checkWin(array, index) {
  const n = array.length;
  const size = Math.sqrt(n);
  const row = Math.floor(index / size);
  const col = index % size;
  const value = array[index];

  // Kiểm tra hàng ngang
  let winRow = true;
  const rowSquares = [];
  for (let j = 0; j < size; j++) {
    const idx = row * size + j;
    rowSquares.push(idx);
    if (array[idx] !== value) {
      winRow = false;
      break;
    }
  }

  // Kiểm tra hàng dọc
  let winCol = true;
  const colSquares = [];
  for (let i = 0; i < size; i++) {
    const idx = i * size + col;
    colSquares.push(idx);
    if (array[idx] !== value) {
      winCol = false;
      break;
    }
  }

  // Kiểm tra đường chéo chính
  let winDiag1 = true;
  const diag1Squares = [];
  if (row === col) {
    for (let i = 0; i < size; i++) {
      const idx = i * size + i;
      diag1Squares.push(idx);
      if (array[idx] !== value) {
        winDiag1 = false;
        break;
      }
    }
  } else {
    winDiag1 = false;
  }

  // Kiểm tra đường chéo phụ
  let winDiag2 = true;
  const diag2Squares = [];
  if (row + col === size - 1) {
    for (let i = 0; i < size; i++) {
      const idx = i * size + (size - 1 - i);
      diag2Squares.push(idx);
      if (array[idx] !== value) {
        winDiag2 = false;
        break;
      }
    }
  } else {
    winDiag2 = false;
  }

  if (winRow) return { won: true, squares: rowSquares };
  if (winCol) return { won: true, squares: colSquares };
  if (winDiag1) return { won: true, squares: diag1Squares };
  if (winDiag2) return { won: true, squares: diag2Squares };
  return { won: false, squares: [] };
}

function WinnerModal({ winner, onRestart }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="modal-overlay">
      <div
        className={`modal ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <h2>🎉 Congratulations! 🎉</h2>
        <p>Player {winner} wins!</p>
        <button onClick={onRestart}>Play Again</button>
      </div>
    </div>
  );
}

function Square() {
  const n = 9;
  const size = Math.sqrt(n);
  const [turn, setTurn] = useState("X");
  const [value, setValue] = useState(Array(n).fill(null));
  const [move, setMove] = useState(0);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAscending, setIsAscending] = useState(true);
  const [winningSquares, setWinningSquares] = useState([]);

  const resetGame = () => {
    setValue(Array(n).fill(null));
    setTurn("X");
    setMove(0);
    setWinner(null);
    setHistory([]);
    setWinningSquares([]);
  };

  const handle_click = (index) => {
    if (value[index] || winner) return;
    const next = [...value];
    next[index] = turn;
    
    // Add move to history
    const row = Math.floor(index / size);
    const col = index % size;
    const historyEntry = {
      square: index,
      position: `(${row}, ${col})`,
      player: turn,
      moveNumber: move + 1
    };
    
    setValue(next);
    setHistory([...history, historyEntry]);
    
    // Check for win
    const winResult = checkWin(next, index);
    if (winResult.won) {
      setWinner(turn);
      setWinningSquares(winResult.squares);
    } else if (move === 8) {
      // Check for draw
      setWinner('draw');
    } else {
      setTurn((prev) => (prev === "X" ? "O" : "X"));
      setMove(move + 1);
    }
  };

  const getSquareClassName = (index) => {
    return `square ${winningSquares.includes(index) ? 'winning' : ''}`;
  };

  // Render moves list
  const moves = isAscending ? [...history] : [...history].reverse();

  return (
    <>
      <div className="game">
        <div className="game-board">
          <div className="state">
            <h1>Move: {move}</h1>
          </div>
          <div className="parent">
            <h1>{winner === 'draw' ? "Draw!" : `${turn} turn`}</h1>
            <div className="board">
              {Array(size).fill(null).map((_, i) => (
                <div className="row" key={i}>
                  {Array(size).fill(null).map((_, j) => {
                    const index = i * size + j;
                    return (
                      <button 
                        type="button" 
                        className={getSquareClassName(index)}
                        key={`${i}:${j}`} 
                        onClick={() => handle_click(index)}
                      >
                        {value[index]}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="game-info">
          <button onClick={() => setIsAscending(!isAscending)}>
            {isAscending ? "Sort Descending" : "Sort Ascending"}
          </button>
          <ol>
            {moves.map((historyMove, idx) => (
              <li key={idx}>
                {historyMove.moveNumber === move + 1 ? (
                  <span>You are at move #{historyMove.moveNumber}</span>
                ) : (
                  <span>
                    Move {historyMove.moveNumber} - Player {historyMove.player} at {historyMove.position}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      {winner && winner !== 'draw' && <WinnerModal winner={winner} onRestart={resetGame} />}
      {winner === 'draw' && (
        <WinnerModal winner="Nobody" onRestart={resetGame} />
      )}
    </>
  );
}

export default Square;
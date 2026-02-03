import React, { useState, useEffect } from 'react';
import Board from './Board';
import { GoGame, BLACK, WHITE } from '../goLogic';
import { tsumegos } from '../tsumegoData';
import './TsumegoMode.css';

const TsumegoMode = ({ onBack }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [game, setGame] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0); // 强制重新渲染
  const [message, setMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const currentProblem = tsumegos[currentProblemIndex];

  useEffect(() => {
    initializeProblem();
  }, [currentProblemIndex]);

  const initializeProblem = () => {
    const newGame = new GoGame(currentProblem.size);
    newGame.board = currentProblem.initialBoard.map(row => [...row]);
    newGame.currentPlayer = currentProblem.currentPlayer;
    setGame(newGame);
    setMessage(currentProblem.description);
    setIsCompleted(false);
    setAttempts(0);
    setShowSolution(false);
  };

  const checkSolution = (row, col) => {
    const firstMove = currentProblem.solution[0];
    if (row === firstMove.row && col === firstMove.col) {
      setMessage('正确！' + currentProblem.explanation);
      setIsCompleted(true);
      return true;
    } else {
      setAttempts(prev => prev + 1);
      setMessage('这不是最佳解法，再试试看！');
      return false;
    }
  };

  const handleCellClick = (row, col) => {
    if (!game || isCompleted) return;

    const result = game.placeStone(row, col);
    if (result.valid) {
      // 死活题中保持玩家不变（重置为题目设定的玩家）
      game.currentPlayer = currentProblem.currentPlayer;

      checkSolution(row, col);
      // 触发React重新渲染
      setUpdateCounter(prev => prev + 1);
    } else {
      setMessage(result.reason || '无法落子');
    }
  };

  const handleReset = () => {
    initializeProblem();
  };

  const handleNext = () => {
    if (currentProblemIndex < tsumegos.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    const solution = currentProblem.solution[0];
    setMessage(`答案在 (${solution.row + 1}, ${solution.col + 1}) 位置。\n${currentProblem.explanation}`);
  };

  if (!game) return <div>加载中...</div>;

  return (
    <div className="tsumego-mode">
      <div className="tsumego-header">
        <button onClick={onBack} className="back-button">← 返回</button>
        <h2>{currentProblem.name}</h2>
        <span className={`difficulty ${currentProblem.difficulty}`}>
          {currentProblem.difficulty}
        </span>
      </div>

      <div className="tsumego-content">
        <div className="tsumego-board">
          <Board
            size={currentProblem.size}
            board={game.board}
            onCellClick={handleCellClick}
            currentPlayer={game.currentPlayer}
            showHints={false}
          />
        </div>

        <div className="tsumego-info">
          <div className="problem-counter">
            题目 {currentProblemIndex + 1} / {tsumegos.length}
          </div>

          <div className={`message-box ${isCompleted ? 'success' : ''}`}>
            {message}
          </div>

          {!isCompleted && attempts > 2 && (
            <div className="hint-section">
              <p>尝试了 {attempts} 次，需要提示吗？</p>
              <button onClick={handleShowSolution} className="hint-button">
                显示答案
              </button>
            </div>
          )}

          {showSolution && !isCompleted && (
            <div className="solution-markers">
              <p>答案位置已标注</p>
            </div>
          )}

          <div className="tsumego-controls">
            <button
              onClick={handleReset}
              className="control-button reset"
            >
              重置
            </button>

            <button
              onClick={handlePrevious}
              disabled={currentProblemIndex === 0}
              className="control-button"
            >
              上一题
            </button>

            <button
              onClick={handleNext}
              disabled={currentProblemIndex === tsumegos.length - 1}
              className="control-button"
            >
              下一题
            </button>
          </div>

          {isCompleted && (
            <div className="completion-message">
              <h3>恭喜完成！</h3>
              <p>用了 {attempts + 1} 次尝试</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TsumegoMode;

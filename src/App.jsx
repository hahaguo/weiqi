import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import TsumegoMode from './components/TsumegoMode';
import Tutorial from './components/Tutorial';
import { GoGame, BLACK, WHITE } from './goLogic';
import './App.css';

function App() {
  const [mode, setMode] = useState('menu'); // menu, game, tsumego
  const [boardSize, setBoardSize] = useState(19);
  const [game, setGame] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0); // 强制重新渲染
  const [message, setMessage] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (mode === 'game') {
      initializeGame();
    }
  }, [mode, boardSize]);

  const initializeGame = () => {
    const newGame = new GoGame(boardSize);
    setGame(newGame);
    setMessage('黑棋先行');
    setLastMove(null);
    setSuggestions([]);
  };

  const handleCellClick = (row, col) => {
    if (!game) return;

    const result = game.placeStone(row, col);

    if (result.valid) {
      setLastMove({ row, col });

      console.log('落子成功:', { row, col, player: game.currentPlayer === BLACK ? '白' : '黑', boardState: game.board });

      setMessage(
        `${game.currentPlayer === BLACK ? '黑' : '白'}棋回合${
          result.captured.length > 0 ? ` - 提掉 ${result.captured.length} 子` : ''
        }`
      );

      // 更新建议
      if (showHints) {
        updateSuggestions();
      }

      // 触发React重新渲染
      setUpdateCounter(prev => prev + 1);
    } else {
      setMessage(`无法落子：${result.reason}`);
    }
  };

  const updateSuggestions = () => {
    if (game) {
      const newSuggestions = game.getSuggestions();
      setSuggestions(newSuggestions);
    }
  };

  const handleUndo = () => {
    if (game && game.undo()) {
      setMessage('已悔棋');
      setLastMove(null);
      if (showHints) {
        updateSuggestions();
      }
      // 触发React重新渲染
      setUpdateCounter(prev => prev + 1);
    } else {
      setMessage('无法悔棋');
    }
  };

  const handleReset = () => {
    initializeGame();
    setMessage('游戏已重置');
  };

  const handlePass = () => {
    if (game) {
      game.currentPlayer = game.currentPlayer === BLACK ? WHITE : BLACK;
      setMessage(`${game.currentPlayer === BLACK ? '黑' : '白'}棋回合（对方弃手）`);
      setLastMove(null);
      // 触发React重新渲染
      setUpdateCounter(prev => prev + 1);
    }
  };

  const toggleHints = () => {
    const newShowHints = !showHints;
    setShowHints(newShowHints);

    if (newShowHints) {
      updateSuggestions();
      setMessage('提示已开启');
    } else {
      setSuggestions([]);
      setMessage('提示已关闭');
    }
  };

  const handleSizeChange = (size) => {
    setBoardSize(size);
    if (mode === 'game') {
      initializeGame();
    }
  };

  if (mode === 'menu') {
    return (
      <div className="app">
        <div className="menu">
          <h1 className="game-title">围棋教学游戏</h1>
          <p className="game-subtitle">学习围棋，感受黑白世界的魅力</p>

          <div className="menu-buttons">
            <button
              className="menu-button primary"
              onClick={() => setMode('game')}
            >
              开始对弈
            </button>

            <button
              className="menu-button"
              onClick={() => setMode('tsumego')}
            >
              死活题练习
            </button>

            <button
              className="menu-button"
              onClick={() => setShowTutorial(true)}
            >
              规则教程
            </button>
          </div>

          <div className="size-selector">
            <h3>选择棋盘大小：</h3>
            <div className="size-buttons">
              <button
                className={`size-button ${boardSize === 9 ? 'active' : ''}`}
                onClick={() => handleSizeChange(9)}
              >
                9×9
              </button>
              <button
                className={`size-button ${boardSize === 13 ? 'active' : ''}`}
                onClick={() => handleSizeChange(13)}
              >
                13×13
              </button>
              <button
                className={`size-button ${boardSize === 19 ? 'active' : ''}`}
                onClick={() => handleSizeChange(19)}
              >
                19×19
              </button>
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">📚</div>
              <h4>规则教程</h4>
              <p>详细的围棋规则讲解</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💡</div>
              <h4>智能提示</h4>
              <p>实时落子建议系统</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🧩</div>
              <h4>死活练习</h4>
              <p>经典死活题库</p>
            </div>
            <div className="feature">
              <div className="feature-icon">↩️</div>
              <h4>悔棋复盘</h4>
              <p>支持悔棋和复盘</p>
            </div>
          </div>
        </div>

        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </div>
    );
  }

  if (mode === 'tsumego') {
    return (
      <div className="app">
        <TsumegoMode onBack={() => setMode('menu')} />
      </div>
    );
  }

  if (mode === 'game' && game) {
    return (
      <div className="app">
        <div className="game-container">
          <div className="game-header">
            <button onClick={() => setMode('menu')} className="back-button">
              ← 返回菜单
            </button>
            <h2>围棋对弈 - {boardSize}×{boardSize}</h2>
            <button onClick={() => setShowTutorial(true)} className="help-button">
              ❓ 规则
            </button>
          </div>

          <div className="game-content">
            <div className="game-board">
              <Board
                size={boardSize}
                board={game.board}
                onCellClick={handleCellClick}
                currentPlayer={game.currentPlayer}
                suggestions={suggestions}
                showHints={showHints}
                lastMove={lastMove}
              />
            </div>

            <div className="game-info">
              <div className="status-panel">
                <div className={`player-indicator ${game.currentPlayer === BLACK ? 'active' : ''}`}>
                  <div className="stone black"></div>
                  <span>黑棋</span>
                  <span className="captured">提子: {game.capturedStones[BLACK]}</span>
                </div>

                <div className={`player-indicator ${game.currentPlayer === WHITE ? 'active' : ''}`}>
                  <div className="stone white"></div>
                  <span>白棋</span>
                  <span className="captured">提子: {game.capturedStones[WHITE]}</span>
                </div>
              </div>

              <div className="message-panel">
                {message}
              </div>

              {showHints && suggestions.length > 0 && (
                <div className="hints-panel">
                  <h4>落子建议：</h4>
                  {suggestions.map((s, i) => (
                    <div key={i} className="hint-item">
                      位置 ({s.row + 1}, {s.col + 1}): {s.reason}
                    </div>
                  ))}
                </div>
              )}

              <div className="controls">
                <button onClick={handleUndo} className="control-btn">
                  ↩️ 悔棋
                </button>
                <button onClick={handlePass} className="control-btn">
                  ⏭️ 弃手
                </button>
                <button onClick={toggleHints} className={`control-btn ${showHints ? 'active' : ''}`}>
                  💡 提示
                </button>
                <button onClick={handleReset} className="control-btn reset">
                  🔄 重置
                </button>
              </div>

              <div className="size-selector compact">
                <h4>切换棋盘：</h4>
                <div className="size-buttons">
                  <button
                    className={`size-button ${boardSize === 9 ? 'active' : ''}`}
                    onClick={() => handleSizeChange(9)}
                  >
                    9×9
                  </button>
                  <button
                    className={`size-button ${boardSize === 13 ? 'active' : ''}`}
                    onClick={() => handleSizeChange(13)}
                  >
                    13×13
                  </button>
                  <button
                    className={`size-button ${boardSize === 19 ? 'active' : ''}`}
                    onClick={() => handleSizeChange(19)}
                  >
                    19×19
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </div>
    );
  }

  return <div className="app">加载中...</div>;
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Tutorial from './Tutorial';
import { GoGame, BLACK, WHITE } from '../goLogic';
import { GoAI } from '../ai/goAI';
import './AIGame.css';

const AIGame = ({ boardSize, aiSettings, onBack }) => {
  const [game, setGame] = useState(null);
  const [ai, setAi] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [message, setMessage] = useState('');
  const [lastMove, setLastMove] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const isAITurn = useRef(false);

  // 初始化游戏
  useEffect(() => {
    initializeGame();
  }, [boardSize, aiSettings]);

  // AI自动落子
  useEffect(() => {
    if (game && !isAIThinking && isAITurn.current) {
      makeAIMove();
    }
  }, [game, updateCounter]);

  const initializeGame = () => {
    const newGame = new GoGame(boardSize);
    const newAI = new GoAI(aiSettings.level);

    setGame(newGame);
    setAi(newAI);
    setMessage('游戏开始');
    setLastMove(null);
    setAiReasoning('');

    // 如果AI执黑（先手），立即让AI落子
    if (aiSettings.playerColor === WHITE) {
      isAITurn.current = true;
    } else {
      isAITurn.current = false;
      setMessage('黑棋先行 - 你的回合');
    }
  };

  const makeAIMove = async () => {
    if (!game || !ai || isAIThinking) return;

    setIsAIThinking(true);
    setMessage('AI思考中...');
    setAiReasoning('');

    try {
      const move = await ai.getBestMove(game);

      if (!move) {
        setMessage('AI无法落子，你赢了！');
        setIsAIThinking(false);
        isAITurn.current = false;
        return;
      }

      const result = game.placeStone(move.row, move.col);

      if (result.valid) {
        setLastMove({ row: move.row, col: move.col });
        setAiReasoning(move.reasoning || '');

        const aiColor = game.currentPlayer === BLACK ? '白' : '黑';
        const captureInfo = result.captured.length > 0
          ? ` - 提掉 ${result.captured.length} 子`
          : '';

        setMessage(`AI落子完成 (${move.reasoning})${captureInfo}`);

        // 切换到玩家回合
        isAITurn.current = false;
        setUpdateCounter(prev => prev + 1);

        // 延迟显示玩家回合消息
        setTimeout(() => {
          const playerColor = game.currentPlayer === BLACK ? '黑' : '白';
          setMessage(`${playerColor}棋回合 - 你的回合`);
        }, 1000);
      }
    } catch (error) {
      console.error('AI落子错误:', error);
      setMessage('AI出错，请重试');
      isAITurn.current = false;
    }

    setIsAIThinking(false);
  };

  const handleCellClick = (row, col) => {
    if (!game || isAIThinking || isAITurn.current) return;

    const result = game.placeStone(row, col);

    if (result.valid) {
      setLastMove({ row, col });

      const captureInfo = result.captured.length > 0
        ? ` - 提掉 ${result.captured.length} 子`
        : '';

      setMessage(`落子成功${captureInfo}`);

      // 切换到AI回合
      isAITurn.current = true;
      setUpdateCounter(prev => prev + 1);
    } else {
      setMessage(`无法落子：${result.reason}`);
    }
  };

  const handleUndo = () => {
    if (!game || isAIThinking || isAITurn.current) return;

    // 悔棋两步（玩家+AI）
    if (game.history.length >= 2) {
      game.undo(); // 撤销AI的棋
      game.undo(); // 撤销玩家的棋
      setMessage('已悔棋');
      setLastMove(null);
      setAiReasoning('');
      isAITurn.current = false;
      setUpdateCounter(prev => prev + 1);
    } else if (game.history.length === 1) {
      game.undo();
      setMessage('已悔棋');
      setLastMove(null);
      setAiReasoning('');
      isAITurn.current = aiSettings.playerColor === WHITE;
      setUpdateCounter(prev => prev + 1);
    } else {
      setMessage('无法悔棋');
    }
  };

  const handleReset = () => {
    if (isAIThinking) return;
    initializeGame();
    setMessage('游戏已重置');
  };

  const handlePass = () => {
    if (!game || isAIThinking || isAITurn.current) return;

    game.currentPlayer = game.currentPlayer === BLACK ? WHITE : BLACK;
    setMessage('你选择弃手');
    setLastMove(null);

    // 切换到AI回合
    isAITurn.current = true;
    setUpdateCounter(prev => prev + 1);
  };

  if (!game) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="ai-game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button" disabled={isAIThinking}>
          ← 返回设置
        </button>
        <h2>人机对弈 - {boardSize}×{boardSize}</h2>
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
            showHints={false}
            lastMove={lastMove}
          />
        </div>

        <div className="game-info">
          {/* AI思考指示器 */}
          {isAIThinking && (
            <div className="ai-thinking-indicator">
              <div className="thinking-animation">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <span>AI思考中...</span>
            </div>
          )}

          {/* 对局信息 */}
          <div className="status-panel">
            <div className={`player-indicator ${
              game.currentPlayer === aiSettings.playerColor && !isAITurn.current ? 'active' : ''
            }`}>
              <div className={`stone ${aiSettings.playerColor === BLACK ? 'black' : 'white'}`}></div>
              <span>你</span>
              <span className="captured">
                提子: {game.capturedStones[aiSettings.playerColor]}
              </span>
            </div>

            <div className={`player-indicator ${isAITurn.current ? 'active' : ''}`}>
              <div className={`stone ${aiSettings.playerColor === BLACK ? 'white' : 'black'}`}></div>
              <span>AI</span>
              <span className="captured">
                提子: {game.capturedStones[aiSettings.playerColor === BLACK ? WHITE : BLACK]}
              </span>
            </div>
          </div>

          {/* 消息面板 */}
          <div className="message-panel">
            {message}
          </div>

          {/* AI思考理由 */}
          {aiReasoning && (
            <div className="ai-reasoning-panel">
              <h4>AI策略：</h4>
              <p>{aiReasoning}</p>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="controls">
            <button
              onClick={handleUndo}
              className="control-btn"
              disabled={isAIThinking || isAITurn.current || game.history.length === 0}
            >
              ↩️ 悔棋
            </button>
            <button
              onClick={handlePass}
              className="control-btn"
              disabled={isAIThinking || isAITurn.current}
            >
              ⏭️ 弃手
            </button>
            <button
              onClick={handleReset}
              className="control-btn reset"
              disabled={isAIThinking}
            >
              🔄 重置
            </button>
          </div>

          {/* AI信息 */}
          <div className="ai-info-panel">
            <h4>AI信息</h4>
            <p>难度：{aiSettings.level === 'EASY' ? '简单' : aiSettings.level === 'MEDIUM' ? '中等' : '困难'}</p>
            <p>你执：{aiSettings.playerColor === BLACK ? '黑棋（先手）' : '白棋（后手）'}</p>
          </div>
        </div>
      </div>

      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default AIGame;

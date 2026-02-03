import React, { useState, useEffect } from 'react';
import './Board.css';

const Board = ({
  size,
  board,
  onCellClick,
  currentPlayer,
  suggestions = [],
  showHints = false,
  lastMove = null
}) => {
  const [touchPreview, setTouchPreview] = useState(null);

  // 根据屏幕大小动态计算棋盘尺寸
  const getResponsiveCellSize = () => {
    const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isLandscape = screenWidth > screenHeight;

    let maxBoardSize;
    if (isIPad) {
      // iPad适配：使用更大的棋盘
      maxBoardSize = isLandscape
        ? Math.min(screenHeight * 0.7, 700)  // 横屏
        : Math.min(screenWidth * 0.85, 600);  // 竖屏
    } else if (screenWidth < 768) {
      // 手机
      maxBoardSize = Math.min(screenWidth * 0.9, 400);
    } else {
      // 桌面
      maxBoardSize = 600;
    }

    return Math.max(maxBoardSize / size, 25); // 最小格子尺寸25px
  };

  const [cellSize, setCellSize] = useState(getResponsiveCellSize());
  const boardSize = cellSize * (size - 1);
  const padding = cellSize / 2;

  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setCellSize(getResponsiveCellSize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [size]);

  const getStoneColor = (value) => {
    if (value === 1) return 'black';
    if (value === 2) return 'white';
    return null;
  };

  const isSuggestion = (row, col) => {
    return suggestions.some(s => s.row === row && s.col === col);
  };

  const getSuggestion = (row, col) => {
    return suggestions.find(s => s.row === row && s.col === col);
  };

  const isLastMove = (row, col) => {
    return lastMove && lastMove.row === row && lastMove.col === col;
  };

  // 星位（天元和星位）
  const getStarPoints = () => {
    const points = [];
    if (size === 19) {
      const positions = [3, 9, 15];
      for (const row of positions) {
        for (const col of positions) {
          points.push({ row, col });
        }
      }
    } else if (size === 13) {
      const positions = [3, 6, 9];
      for (const row of positions) {
        for (const col of positions) {
          points.push({ row, col });
        }
      }
    } else if (size === 9) {
      points.push({ row: 4, col: 4 });
      points.push({ row: 2, col: 2 });
      points.push({ row: 2, col: 6 });
      points.push({ row: 6, col: 2 });
      points.push({ row: 6, col: 6 });
    }
    return points;
  };

  // 触摸事件处理
  const handleTouchStart = (e, row, col) => {
    e.preventDefault();
    const stoneColor = getStoneColor(board[row][col]);
    if (!stoneColor) {
      setTouchPreview({ row, col });
    }
  };

  const handleTouchEnd = (e, row, col) => {
    e.preventDefault();
    setTouchPreview(null);
    onCellClick(row, col);
  };

  const handleTouchCancel = () => {
    setTouchPreview(null);
  };

  return (
    <div className="board-container">
      <svg
        width={boardSize + padding * 2}
        height={boardSize + padding * 2}
        className="board-svg"
        style={{ touchAction: 'none' }}
      >
        {/* 背景 */}
        <rect
          width={boardSize + padding * 2}
          height={boardSize + padding * 2}
          fill="#dcb35c"
        />

        {/* 网格线 */}
        {Array.from({ length: size }).map((_, i) => (
          <React.Fragment key={`line-${i}`}>
            {/* 横线 */}
            <line
              x1={padding}
              y1={padding + i * cellSize}
              x2={padding + boardSize}
              y2={padding + i * cellSize}
              stroke="#000"
              strokeWidth="1"
            />
            {/* 竖线 */}
            <line
              x1={padding + i * cellSize}
              y1={padding}
              x2={padding + i * cellSize}
              y2={padding + boardSize}
              stroke="#000"
              strokeWidth="1"
            />
          </React.Fragment>
        ))}

        {/* 星位 */}
        {getStarPoints().map((point, idx) => (
          <circle
            key={`star-${idx}`}
            cx={padding + point.col * cellSize}
            cy={padding + point.row * cellSize}
            r={cellSize * 0.1}
            fill="#000"
          />
        ))}

        {/* 交互区域 */}
        {Array.from({ length: size }).map((_, row) =>
          Array.from({ length: size }).map((_, col) => {
            const stoneColor = getStoneColor(board[row][col]);
            const suggestion = getSuggestion(row, col);

            return (
              <g key={`cell-${row}-${col}`}>
                {/* 可点击区域 */}
                <rect
                  x={padding + col * cellSize - cellSize / 2}
                  y={padding + row * cellSize - cellSize / 2}
                  width={cellSize}
                  height={cellSize}
                  fill="transparent"
                  onClick={() => onCellClick(row, col)}
                  onTouchStart={(e) => handleTouchStart(e, row, col)}
                  onTouchEnd={(e) => handleTouchEnd(e, row, col)}
                  onTouchCancel={handleTouchCancel}
                  className="cell-clickable"
                  style={{ cursor: stoneColor ? 'default' : 'pointer' }}
                />

                {/* 悬停/触摸预览 */}
                {!stoneColor && (touchPreview?.row === row && touchPreview?.col === col) && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize * 0.35}
                    fill={currentPlayer === 1 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}
                    className="touch-preview"
                    pointerEvents="none"
                  />
                )}

                {/* 悬停提示（桌面端）*/}
                {!stoneColor && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize * 0.35}
                    fill={currentPlayer === 1 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'}
                    className="hover-stone"
                    pointerEvents="none"
                  />
                )}

                {/* 棋子 */}
                {stoneColor && (
                  <>
                    <circle
                      cx={padding + col * cellSize}
                      cy={padding + row * cellSize}
                      r={cellSize * 0.4}
                      fill={stoneColor}
                      stroke={stoneColor === 'black' ? '#333' : '#333'}
                      strokeWidth="2"
                    />
                    {/* 最后一手标记 */}
                    {isLastMove(row, col) && (
                      <circle
                        cx={padding + col * cellSize}
                        cy={padding + row * cellSize}
                        r={cellSize * 0.15}
                        fill={stoneColor === 'black' ? 'white' : 'black'}
                      />
                    )}
                  </>
                )}

                {/* 建议落子提示 */}
                {showHints && !stoneColor && suggestion && (
                  <g>
                    <circle
                      cx={padding + col * cellSize}
                      cy={padding + row * cellSize}
                      r={cellSize * 0.25}
                      fill="rgba(255, 215, 0, 0.6)"
                      stroke="orange"
                      strokeWidth="2"
                    />
                    <text
                      x={padding + col * cellSize}
                      y={padding + row * cellSize + cellSize * 0.08}
                      textAnchor="middle"
                      fontSize={cellSize * 0.3}
                      fontWeight="bold"
                      fill="#333"
                    >
                      !
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default Board;

// 围棋游戏核心逻辑
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export class GoGame {
  constructor(size = 19) {
    this.size = size;
    this.board = this.createEmptyBoard();
    this.currentPlayer = BLACK;
    this.capturedStones = { [BLACK]: 0, [WHITE]: 0 };
    this.history = [];
    this.koPoint = null; // 劫争点位
  }

  createEmptyBoard() {
    return Array(this.size).fill(null).map(() => Array(this.size).fill(EMPTY));
  }

  // 获取某个位置的相邻点
  getAdjacentPoints(row, col) {
    const adjacent = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
        adjacent.push([newRow, newCol]);
      }
    }
    return adjacent;
  }

  // 获取一组连接的棋子（使用深度优先搜索）
  getGroup(row, col, visited = new Set()) {
    const key = `${row},${col}`;
    if (visited.has(key)) return [];

    const color = this.board[row][col];
    if (color === EMPTY) return [];

    visited.add(key);
    const group = [[row, col]];

    for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
      if (this.board[adjRow][adjCol] === color) {
        group.push(...this.getGroup(adjRow, adjCol, visited));
      }
    }

    return group;
  }

  // 计算一组棋子的气（自由度）
  countLiberties(group) {
    const liberties = new Set();

    for (const [row, col] of group) {
      for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
        if (this.board[adjRow][adjCol] === EMPTY) {
          liberties.add(`${adjRow},${adjCol}`);
        }
      }
    }

    return liberties.size;
  }

  // 移除被提掉的棋子
  removeDeadStones(row, col) {
    const opponentColor = this.currentPlayer === BLACK ? WHITE : BLACK;
    let capturedCount = 0;
    const capturedPositions = [];

    for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
      if (this.board[adjRow][adjCol] === opponentColor) {
        const group = this.getGroup(adjRow, adjCol);
        if (this.countLiberties(group) === 0) {
          for (const [gRow, gCol] of group) {
            this.board[gRow][gCol] = EMPTY;
            capturedCount++;
            capturedPositions.push([gRow, gCol]);
          }
        }
      }
    }

    this.capturedStones[this.currentPlayer] += capturedCount;
    return capturedPositions;
  }

  // 检查是否是自杀手（落子后自己的棋子没有气）
  isSuicideMove(row, col) {
    const group = this.getGroup(row, col);
    return this.countLiberties(group) === 0;
  }

  // 检查是否违反劫争规则
  isKoViolation(row, col) {
    if (!this.koPoint) return false;
    return this.koPoint[0] === row && this.koPoint[1] === col;
  }

  // 判断是否可以落子
  canPlaceStone(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return { valid: false, reason: '超出棋盘范围' };
    }

    if (this.board[row][col] !== EMPTY) {
      return { valid: false, reason: '该位置已有棋子' };
    }

    if (this.isKoViolation(row, col)) {
      return { valid: false, reason: '违反劫争规则' };
    }

    // 临时放置棋子来检查
    this.board[row][col] = this.currentPlayer;

    // 检查是否能提掉对方的子
    let canCapture = false;
    for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
      const adjColor = this.board[adjRow][adjCol];
      if (adjColor !== EMPTY && adjColor !== this.currentPlayer) {
        const group = this.getGroup(adjRow, adjCol);
        if (this.countLiberties(group) === 0) {
          canCapture = true;
          break;
        }
      }
    }

    // 如果不能提子，检查是否是自杀手
    if (!canCapture && this.isSuicideMove(row, col)) {
      this.board[row][col] = EMPTY;
      return { valid: false, reason: '禁止自杀手' };
    }

    this.board[row][col] = EMPTY;
    return { valid: true };
  }

  // 落子
  placeStone(row, col) {
    const canPlace = this.canPlaceStone(row, col);
    if (!canPlace.valid) {
      return canPlace;
    }

    // 保存当前棋盘状态到历史记录
    this.history.push({
      board: this.board.map(row => [...row]),
      currentPlayer: this.currentPlayer,
      capturedStones: { ...this.capturedStones },
      koPoint: this.koPoint
    });

    // 放置棋子
    this.board[row][col] = this.currentPlayer;

    // 提子
    const capturedPositions = this.removeDeadStones(row, col);

    // 更新劫争点
    if (capturedPositions.length === 1) {
      const myGroup = this.getGroup(row, col);
      if (myGroup.length === 1 && this.countLiberties(myGroup) === 1) {
        this.koPoint = capturedPositions[0];
      } else {
        this.koPoint = null;
      }
    } else {
      this.koPoint = null;
    }

    // 切换玩家
    this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;

    return { valid: true, captured: capturedPositions };
  }

  // 悔棋
  undo() {
    if (this.history.length === 0) {
      return false;
    }

    const lastState = this.history.pop();
    this.board = lastState.board;
    this.currentPlayer = lastState.currentPlayer;
    this.capturedStones = lastState.capturedStones;
    this.koPoint = lastState.koPoint;

    return true;
  }

  // 重置游戏
  reset() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = BLACK;
    this.capturedStones = { [BLACK]: 0, [WHITE]: 0 };
    this.history = [];
    this.koPoint = null;
  }

  // 获取建议落子位置（简单的AI提示）
  getSuggestions() {
    const suggestions = [];

    // 寻找可以提子的位置
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] === EMPTY) {
          // 临时放置棋子
          this.board[row][col] = this.currentPlayer;

          // 检查能否提子
          let canCapture = false;
          for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
            const adjColor = this.board[adjRow][adjCol];
            if (adjColor !== EMPTY && adjColor !== this.currentPlayer) {
              const group = this.getGroup(adjRow, adjCol);
              if (this.countLiberties(group) === 0) {
                canCapture = true;
                suggestions.push({
                  row, col,
                  reason: '可以提子',
                  priority: 3
                });
                break;
              }
            }
          }

          // 检查是否在救自己的子
          if (!canCapture) {
            for (const [adjRow, adjCol] of this.getAdjacentPoints(row, col)) {
              if (this.board[adjRow][adjCol] === this.currentPlayer) {
                const group = this.getGroup(adjRow, adjCol);
                const liberties = this.countLiberties(group);
                if (liberties === 1) {
                  suggestions.push({
                    row, col,
                    reason: '救子',
                    priority: 2
                  });
                  break;
                }
              }
            }
          }

          this.board[row][col] = EMPTY;
        }
      }
    }

    // 按优先级排序
    suggestions.sort((a, b) => b.priority - a.priority);
    return suggestions.slice(0, 3);
  }

  // 获取棋盘状态的副本
  getBoardCopy() {
    return this.board.map(row => [...row]);
  }

  // 克隆整个游戏状态（用于AI模拟）
  cloneGame() {
    const cloned = new GoGame(this.size);
    cloned.board = this.board.map(row => [...row]);
    cloned.currentPlayer = this.currentPlayer;
    cloned.capturedStones = { ...this.capturedStones };
    cloned.koPoint = this.koPoint ? [...this.koPoint] : null;
    cloned.history = this.history.map(h => ({
      board: h.board.map(row => [...row]),
      currentPlayer: h.currentPlayer,
      capturedStones: { ...h.capturedStones },
      koPoint: h.koPoint ? [...h.koPoint] : null
    }));
    return cloned;
  }

  // 获取所有空位
  getAllEmptyPoints() {
    const points = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] === EMPTY) {
          points.push([row, col]);
        }
      }
    }
    return points;
  }

  // 获取棋块详细信息
  getGroupInfo(row, col) {
    if (this.board[row][col] === EMPTY) {
      return null;
    }

    const group = this.getGroup(row, col);
    const liberties = this.countLiberties(group);
    const color = this.board[row][col];

    return {
      stones: group,
      count: group.length,
      liberties: liberties,
      color: color
    };
  }
}

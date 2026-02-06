// AI评估函数库 - 独立的评估规则
import { EMPTY } from '../goLogic';

/**
 * 评估救子价值
 * 如果落子能增加己方濒死棋块的气数，得分很高
 */
export function evaluateSurvival(game, row, col) {
  let score = 0;
  const originalPlayer = game.currentPlayer;

  // 临时落子
  game.board[row][col] = game.currentPlayer;

  // 检查相邻己方棋块
  const adjacent = game.getAdjacentPoints(row, col);
  for (const [adjRow, adjCol] of adjacent) {
    if (game.board[adjRow][adjCol] === originalPlayer) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      if (groupInfo) {
        // 救气数少的棋块价值高
        if (groupInfo.liberties <= 3) {
          score += (4 - groupInfo.liberties) * groupInfo.count * 20;
        }
      }
    }
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估提子价值
 * 如果落子能直接提掉对方棋子，得分很高
 */
export function evaluateCapture(game, row, col) {
  let score = 0;
  const opponent = game.currentPlayer === 1 ? 2 : 1;

  game.board[row][col] = game.currentPlayer;

  const adjacent = game.getAdjacentPoints(row, col);
  for (const [adjRow, adjCol] of adjacent) {
    if (game.board[adjRow][adjCol] === opponent) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      if (groupInfo && groupInfo.liberties === 0) {
        // 提子价值 = 被提子数 × 15
        score += groupInfo.count * 15;
      }
    }
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估防守价值
 * 如果对手下一手能提子，需要防守
 */
export function evaluateDefense(game, row, col) {
  let score = 0;

  // 临时落子
  game.board[row][col] = game.currentPlayer;

  // 检查是否阻止了对手的提子机会
  const opponent = game.currentPlayer === 1 ? 2 : 1;
  const adjacent = game.getAdjacentPoints(row, col);

  for (const [adjRow, adjCol] of adjacent) {
    if (game.board[adjRow][adjCol] === game.currentPlayer) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      // 如果增加了危险棋块的气数
      if (groupInfo && groupInfo.liberties <= 2) {
        score += (3 - groupInfo.liberties) * groupInfo.count * 10;
      }
    }
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估连接价值
 * 连接己方棋块能提高整体强度
 */
export function evaluateConnect(game, row, col) {
  let score = 0;

  game.board[row][col] = game.currentPlayer;

  // 统计相邻己方棋块数量
  let friendlyGroups = 0;
  const visited = new Set();
  const adjacent = game.getAdjacentPoints(row, col);

  for (const [adjRow, adjCol] of adjacent) {
    const key = `${adjRow},${adjCol}`;
    if (game.board[adjRow][adjCol] === game.currentPlayer && !visited.has(key)) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      if (groupInfo) {
        // 标记这个棋块的所有棋子
        groupInfo.stones.forEach(([r, c]) => visited.add(`${r},${c}`));
        friendlyGroups++;
      }
    }
  }

  // 连接2个或更多棋块得分
  if (friendlyGroups >= 2) {
    score += friendlyGroups * 8;
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估切断价值
 * 切断对手棋块的联系
 */
export function evaluateCut(game, row, col) {
  let score = 0;
  const opponent = game.currentPlayer === 1 ? 2 : 1;

  game.board[row][col] = game.currentPlayer;

  // 统计相邻对手棋块数量
  let enemyGroups = 0;
  const visited = new Set();
  const adjacent = game.getAdjacentPoints(row, col);

  for (const [adjRow, adjCol] of adjacent) {
    const key = `${adjRow},${adjCol}`;
    if (game.board[adjRow][adjCol] === opponent && !visited.has(key)) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      if (groupInfo) {
        groupInfo.stones.forEach(([r, c]) => visited.add(`${r},${c}`));
        enemyGroups++;
      }
    }
  }

  // 切断多个对手棋块得分
  if (enemyGroups >= 2) {
    score += enemyGroups * 6;
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估攻击弱子价值
 * 对气数少的对手棋块施加压力
 */
export function evaluateAttackWeakGroups(game, row, col) {
  let score = 0;
  const opponent = game.currentPlayer === 1 ? 2 : 1;

  game.board[row][col] = game.currentPlayer;

  const adjacent = game.getAdjacentPoints(row, col);
  for (const [adjRow, adjCol] of adjacent) {
    if (game.board[adjRow][adjCol] === opponent) {
      const groupInfo = game.getGroupInfo(adjRow, adjCol);
      if (groupInfo && groupInfo.liberties <= 2) {
        // 攻击弱子得分
        score += (3 - groupInfo.liberties) * groupInfo.count * 5;
      }
    }
  }

  game.board[row][col] = EMPTY;
  return score;
}

/**
 * 评估围地价值
 * 计算该点周围的影响力
 */
export function evaluateTerritory(game, row, col) {
  let score = 0;

  // 计算周围8格的影响力
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  let friendlyCount = 0;
  let enemyCount = 0;

  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < game.size && c >= 0 && c < game.size) {
      if (game.board[r][c] === game.currentPlayer) {
        friendlyCount++;
      } else if (game.board[r][c] !== EMPTY) {
        enemyCount++;
      }
    }
  }

  // 己方势力范围内得分高，对手势力范围内得分低
  score = friendlyCount * 2 - enemyCount * 3;

  return score;
}

/**
 * 评估关键点价值
 * 星位、边角等重要位置
 */
export function evaluateKeyPoints(game, row, col) {
  let score = 0;
  const size = game.size;

  // 星位
  const starPoints = [];
  if (size === 19) {
    const positions = [3, 9, 15];
    for (const r of positions) {
      for (const c of positions) {
        starPoints.push([r, c]);
      }
    }
  } else if (size === 13) {
    const positions = [3, 6, 9];
    for (const r of positions) {
      for (const c of positions) {
        starPoints.push([r, c]);
      }
    }
  } else if (size === 9) {
    starPoints.push([4, 4], [2, 2], [2, 6], [6, 2], [6, 6]);
  }

  // 星位加分
  if (starPoints.some(([r, c]) => r === row && c === col)) {
    score += 5;
  }

  // 角部加分（3-3点、4-4点等）
  const distFromCorner = Math.min(
    row, col,
    size - 1 - row,
    size - 1 - col
  );
  if (distFromCorner >= 2 && distFromCorner <= 3) {
    score += 3;
  }

  // 避开边缘（一线）
  if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
    score -= 5;
  }

  return score;
}

/**
 * 评估落子后的自由度
 * 落子后该棋块有更多气数得分高
 */
export function evaluateLiberties(game, row, col) {
  let score = 0;

  game.board[row][col] = game.currentPlayer;
  const groupInfo = game.getGroupInfo(row, col);

  if (groupInfo) {
    // 气数越多越好
    score = groupInfo.liberties * 2;
  }

  game.board[row][col] = EMPTY;
  return score;
}

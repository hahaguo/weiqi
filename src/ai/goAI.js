// AI核心引擎 - 围棋AI决策系统
import * as evaluators from './aiEvaluators';

// AI难度配置
export const AI_LEVELS = {
  EASY: {
    name: '简单',
    thinkingTime: 500,      // 思考时间（毫秒）
    randomness: 0.3,        // 随机性系数（30%概率选非最优解）
    evaluationRules: [      // 启用的评估规则
      'capture',            // 提子
      'survival',           // 救子
      'liberties'           // 自由度
    ],
    weights: {              // 权重调整
      capture: 1.0,
      survival: 0.8,
      liberties: 0.3
    }
  },
  MEDIUM: {
    name: '中等',
    thinkingTime: 1000,
    randomness: 0.15,
    evaluationRules: [
      'capture',
      'survival',
      'defense',
      'connect',
      'territory',
      'liberties'
    ],
    weights: {
      capture: 1.0,
      survival: 0.9,
      defense: 0.7,
      connect: 0.5,
      territory: 0.3,
      liberties: 0.3
    }
  },
  HARD: {
    name: '困难',
    thinkingTime: 2000,
    randomness: 0.05,
    evaluationRules: [
      'capture',
      'survival',
      'defense',
      'connect',
      'cut',
      'attackWeakGroups',
      'territory',
      'keyPoints',
      'liberties'
    ],
    weights: {
      capture: 1.0,
      survival: 0.95,
      defense: 0.8,
      connect: 0.6,
      cut: 0.5,
      attackWeakGroups: 0.4,
      territory: 0.35,
      keyPoints: 0.2,
      liberties: 0.3
    }
  }
};

export class GoAI {
  constructor(level = 'EASY') {
    this.level = level;
    this.config = AI_LEVELS[level];
  }

  /**
   * 获取AI的最佳落子位置
   * @param {GoGame} game - 游戏实例
   * @returns {Promise<{row, col, score, reasoning}>}
   */
  async getBestMove(game) {
    // 模拟思考时间
    await this.simulateThinking();

    const emptyPoints = game.getAllEmptyPoints();
    const candidateScores = [];

    // 性能优化：如果是开局，只评估有意义的位置
    let pointsToEvaluate = emptyPoints;
    if (game.history.length < 10) {
      pointsToEvaluate = this.filterOpeningMoves(game, emptyPoints);
    } else if (emptyPoints.length > 100) {
      // 中盘：只评估周围有棋子的位置
      pointsToEvaluate = this.filterRelevantMoves(game, emptyPoints);
    }

    // 评估每个候选位置
    for (const [row, col] of pointsToEvaluate) {
      const canPlace = game.canPlaceStone(row, col);
      if (!canPlace.valid) continue;

      const { score, reasoning } = this.evaluateMove(game, row, col);
      candidateScores.push({ row, col, score, reasoning });
    }

    // 如果没有合法落子位置，返回null
    if (candidateScores.length === 0) {
      return null;
    }

    // 排序并应用随机性
    candidateScores.sort((a, b) => b.score - a.score);

    // 根据难度选择落子
    const selectedMove = this.selectMoveWithRandomness(candidateScores);

    return selectedMove;
  }

  /**
   * 评估单个落子位置的得分
   * @param {GoGame} game - 游戏实例
   * @param {number} row - 行
   * @param {number} col - 列
   * @returns {{score: number, reasoning: string}}
   */
  evaluateMove(game, row, col) {
    let totalScore = 0;
    const reasons = [];
    const rules = this.config.evaluationRules;
    const weights = this.config.weights;

    // 克隆游戏以进行模拟（不影响原游戏）
    const clonedGame = game.cloneGame();

    // 应用各种评估规则
    if (rules.includes('survival')) {
      const score = evaluators.evaluateSurvival(clonedGame, row, col) * (weights.survival || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('救子');
      }
    }

    if (rules.includes('capture')) {
      const score = evaluators.evaluateCapture(clonedGame, row, col) * (weights.capture || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('提子');
      }
    }

    if (rules.includes('defense')) {
      const score = evaluators.evaluateDefense(clonedGame, row, col) * (weights.defense || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('防守');
      }
    }

    if (rules.includes('connect')) {
      const score = evaluators.evaluateConnect(clonedGame, row, col) * (weights.connect || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('连接');
      }
    }

    if (rules.includes('cut')) {
      const score = evaluators.evaluateCut(clonedGame, row, col) * (weights.cut || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('切断');
      }
    }

    if (rules.includes('attackWeakGroups')) {
      const score = evaluators.evaluateAttackWeakGroups(clonedGame, row, col) * (weights.attackWeakGroups || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('攻击');
      }
    }

    if (rules.includes('territory')) {
      const score = evaluators.evaluateTerritory(clonedGame, row, col) * (weights.territory || 1);
      if (score > 0) {
        totalScore += score;
        reasons.push('围地');
      }
    }

    if (rules.includes('keyPoints')) {
      const score = evaluators.evaluateKeyPoints(clonedGame, row, col) * (weights.keyPoints || 1);
      totalScore += score;
    }

    if (rules.includes('liberties')) {
      const score = evaluators.evaluateLiberties(clonedGame, row, col) * (weights.liberties || 1);
      totalScore += score;
    }

    // 添加一点随机性，避免完全可预测
    totalScore += Math.random() * 2;

    const reasoning = reasons.length > 0 ? reasons.join('、') : '占位';

    return { score: totalScore, reasoning };
  }

  /**
   * 根据难度添加随机性来选择落子
   * @param {Array} candidateScores - 候选位置数组（已排序）
   * @returns {{row, col, score, reasoning}}
   */
  selectMoveWithRandomness(candidateScores) {
    const randomThreshold = this.config.randomness;

    if (Math.random() < randomThreshold) {
      // 随机选择前N个候选点之一
      const topN = Math.min(5, candidateScores.length);
      const randomIndex = Math.floor(Math.random() * topN);
      return candidateScores[randomIndex];
    }

    // 返回最优解
    return candidateScores[0];
  }

  /**
   * 过滤开局时有意义的落子位置
   * @param {GoGame} game - 游戏实例
   * @param {Array} emptyPoints - 所有空位
   * @returns {Array} 过滤后的位置
   */
  filterOpeningMoves(game, emptyPoints) {
    const size = game.size;
    const filtered = [];

    // 开局优先考虑：星位、角部、边
    for (const [row, col] of emptyPoints) {
      const distFromEdge = Math.min(row, col, size - 1 - row, size - 1 - col);

      // 保留离边缘2-4线的位置
      if (distFromEdge >= 2 && distFromEdge <= 5) {
        filtered.push([row, col]);
      }
    }

    return filtered.length > 0 ? filtered : emptyPoints;
  }

  /**
   * 过滤中盘有意义的落子位置（周围有棋子的位置）
   * @param {GoGame} game - 游戏实例
   * @param {Array} emptyPoints - 所有空位
   * @returns {Array} 过滤后的位置
   */
  filterRelevantMoves(game, emptyPoints) {
    const filtered = [];

    for (const [row, col] of emptyPoints) {
      // 检查周围2格内是否有棋子
      let hasNearbyStone = false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < game.size && c >= 0 && c < game.size) {
            if (game.board[r][c] !== 0) {
              hasNearbyStone = true;
              break;
            }
          }
        }
        if (hasNearbyStone) break;
      }

      if (hasNearbyStone) {
        filtered.push([row, col]);
      }
    }

    // 如果过滤后太少，返回所有位置
    return filtered.length > 20 ? filtered : emptyPoints;
  }

  /**
   * 模拟思考延迟
   * @returns {Promise}
   */
  async simulateThinking() {
    const delay = this.config.thinkingTime;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 改变AI难度
   * @param {string} level - 难度级别（EASY/MEDIUM/HARD）
   */
  setLevel(level) {
    if (AI_LEVELS[level]) {
      this.level = level;
      this.config = AI_LEVELS[level];
    }
  }
}

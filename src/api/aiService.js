// AI服务抽象层 - 统一本地和远程AI调用接口
import { GoAI } from '../ai/goAI';

/**
 * 获取AI落子位置
 * @param {GoGame} game - 游戏实例
 * @param {Object} settings - AI设置
 * @returns {Promise<{row, col, score, reasoning, source}>}
 */
export async function getAIMove(game, settings) {
  const { useRemoteAI, level } = settings;

  // 云端AI功能暂未实现，始终使用本地AI
  if (useRemoteAI) {
    console.log('云端AI功能开发中，使用本地AI代替');
    // 可以尝试调用远程API，失败则降级到本地AI
    try {
      return await fetchRemoteAIMove(game, level);
    } catch (error) {
      console.warn('远程AI调用失败，降级到本地AI:', error);
      return await getLocalAIMove(game, level);
    }
  } else {
    return await getLocalAIMove(game, level);
  }
}

/**
 * 使用本地AI获取落子位置
 * @param {GoGame} game - 游戏实例
 * @param {string} level - 难度级别
 * @returns {Promise<{row, col, score, reasoning, source}>}
 */
async function getLocalAIMove(game, level) {
  const ai = new GoAI(level);
  const move = await ai.getBestMove(game);

  if (!move) {
    return null;
  }

  return {
    row: move.row,
    col: move.col,
    score: move.score,
    reasoning: move.reasoning,
    source: 'local'
  };
}

/**
 * 调用远程AI服务获取落子位置（预留接口）
 * @param {GoGame} game - 游戏实例
 * @param {string} level - 难度级别
 * @returns {Promise<{row, col, score, reasoning, source}>}
 */
async function fetchRemoteAIMove(game, level) {
  // 检查网络连接
  if (!navigator.onLine) {
    throw new Error('网络未连接');
  }

  // 准备请求数据
  const requestData = {
    board: game.board,
    currentPlayer: game.currentPlayer,
    size: game.size,
    level: level,
    history: game.history.slice(-10), // 最近10手
    capturedStones: game.capturedStones,
    koPoint: game.koPoint
  };

  try {
    // 调用远程API（需要后端支持）
    const response = await fetch('/api/ai/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData),
      timeout: 10000 // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data = await response.json();

    return {
      row: data.row,
      col: data.col,
      score: data.evaluation || 0,
      reasoning: data.reasoning || 'AI推荐',
      source: 'remote',
      computeTime: data.computeTime
    };
  } catch (error) {
    console.error('远程AI调用失败:', error);
    throw error;
  }
}

/**
 * 检查远程AI服务是否可用
 * @returns {Promise<boolean>}
 */
export async function checkRemoteAIAvailability() {
  try {
    const response = await fetch('/api/ai/health', {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * 获取远程AI服务信息
 * @returns {Promise<Object>}
 */
export async function getRemoteAIInfo() {
  try {
    const response = await fetch('/api/ai/info', {
      method: 'GET',
      timeout: 3000
    });

    if (!response.ok) {
      throw new Error('无法获取AI信息');
    }

    return await response.json();
  } catch (error) {
    console.error('获取AI信息失败:', error);
    return {
      available: false,
      engine: 'unknown',
      version: 'unknown'
    };
  }
}

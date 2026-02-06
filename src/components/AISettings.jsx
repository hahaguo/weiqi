import React from 'react';
import { BLACK, WHITE } from '../goLogic';
import { AI_LEVELS } from '../ai/goAI';
import './AISettings.css';

const AISettings = ({ settings, onSettingsChange, onStartGame, onBack }) => {
  const handleLevelChange = (level) => {
    onSettingsChange({ ...settings, level });
  };

  const handleColorChange = (playerColor) => {
    onSettingsChange({ ...settings, playerColor });
  };

  const handleAITypeChange = (e) => {
    onSettingsChange({ ...settings, useRemoteAI: e.target.checked });
  };

  return (
    <div className="ai-settings-container">
      <div className="ai-settings-card">
        <h2>人机对弈设置</h2>

        {/* 难度选择 */}
        <div className="settings-section">
          <h3>AI难度</h3>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-btn ${settings.level === 'EASY' ? 'active' : ''}`}
              onClick={() => handleLevelChange('EASY')}
            >
              <span className="btn-icon">😊</span>
              <span className="btn-text">简单</span>
              <span className="btn-desc">适合初学者</span>
            </button>
            <button
              className={`difficulty-btn ${settings.level === 'MEDIUM' ? 'active' : ''}`}
              onClick={() => handleLevelChange('MEDIUM')}
            >
              <span className="btn-icon">🤔</span>
              <span className="btn-text">中等</span>
              <span className="btn-desc">有一定挑战</span>
            </button>
            <button
              className={`difficulty-btn ${settings.level === 'HARD' ? 'active' : ''}`}
              onClick={() => handleLevelChange('HARD')}
            >
              <span className="btn-icon">😈</span>
              <span className="btn-text">困难</span>
              <span className="btn-desc">高手水平</span>
            </button>
          </div>
          <div className="difficulty-info">
            <p>当前难度：{AI_LEVELS[settings.level].name}</p>
            <p className="info-text">思考时间：{AI_LEVELS[settings.level].thinkingTime / 1000}秒</p>
          </div>
        </div>

        {/* 先后手选择 */}
        <div className="settings-section">
          <h3>执子颜色</h3>
          <div className="color-buttons">
            <button
              className={`color-btn ${settings.playerColor === BLACK ? 'active' : ''}`}
              onClick={() => handleColorChange(BLACK)}
            >
              <div className="stone-preview black"></div>
              <span>黑棋（先手）</span>
            </button>
            <button
              className={`color-btn ${settings.playerColor === WHITE ? 'active' : ''}`}
              onClick={() => handleColorChange(WHITE)}
            >
              <div className="stone-preview white"></div>
              <span>白棋（后手）</span>
            </button>
          </div>
        </div>

        {/* AI类型切换（预留） */}
        <div className="settings-section">
          <h3>AI类型</h3>
          <label className="ai-type-toggle">
            <input
              type="checkbox"
              checked={settings.useRemoteAI}
              onChange={handleAITypeChange}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {settings.useRemoteAI ? '云端AI（开发中）' : '本地AI'}
            </span>
          </label>
          <p className="info-text">
            {settings.useRemoteAI
              ? '云端AI功能正在开发中，暂时使用本地AI'
              : '本地AI运行在浏览器中，无需网络连接'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="settings-actions">
          <button className="action-btn secondary" onClick={onBack}>
            返回菜单
          </button>
          <button className="action-btn primary" onClick={onStartGame}>
            开始对弈
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings;

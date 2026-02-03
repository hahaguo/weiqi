import React, { useState } from 'react';
import './Tutorial.css';

const Tutorial = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: '围棋简介',
      content: (
        <>
          <p>围棋是一种策略性棋类游戏，起源于中国，已有数千年历史。</p>
          <p>游戏在棋盘上进行，黑白双方交替落子，目标是占据更多的地盘。</p>
          <h4>基本规则：</h4>
          <ul>
            <li>黑棋先行，黑白轮流在棋盘交叉点上落子</li>
            <li>棋子一旦放下就不能移动</li>
            <li>占据更多地盘的一方获胜</li>
          </ul>
        </>
      ),
      image: '📚'
    },
    {
      title: '气的概念',
      content: (
        <>
          <p><strong>气</strong>是围棋中最基本的概念之一。</p>
          <p>气是指与棋子紧邻的空交叉点。一个棋子或一组连接的棋子如果没有气，就会被提掉。</p>
          <h4>例子：</h4>
          <ul>
            <li>棋盘中央的单个棋子有4口气（上下左右）</li>
            <li>角上的单个棋子只有2口气</li>
            <li>边上的单个棋子有3口气</li>
            <li>相连的棋子共享气</li>
          </ul>
          <p className="tip">💡 保持足够的气是棋子生存的关键！</p>
        </>
      ),
      image: '🫁'
    },
    {
      title: '提子',
      content: (
        <>
          <p>当对方的棋子或棋群被完全包围，没有气时，就可以把它们提掉。</p>
          <h4>提子规则：</h4>
          <ul>
            <li>被提掉的棋子从棋盘上移除</li>
            <li>提掉的子数计入己方得分</li>
            <li>一次可以提掉对方的多个子</li>
          </ul>
          <p className="tip">⚠️ 不能下自杀手：不能落子后让自己的棋子没有气（除非同时能提掉对方的子）</p>
        </>
      ),
      image: '🎯'
    },
    {
      title: '劫争',
      content: (
        <>
          <p><strong>劫</strong>是围棋中的特殊规则，防止无限循环。</p>
          <h4>劫争规则：</h4>
          <ul>
            <li>当提掉对方一子后，对方不能立即提回</li>
            <li>必须在别处落一手后，才能提回劫</li>
            <li>劫争常常决定局部甚至全局的胜负</li>
          </ul>
          <p className="example">
            例如：黑提白一子后，白不能马上提回，必须先在别处落子，黑应对后，白才能提劫。
          </p>
        </>
      ),
      image: '⚔️'
    },
    {
      title: '眼位与活棋',
      content: (
        <>
          <p>眼是指被己方棋子围住的空交叉点。</p>
          <h4>做活的关键：</h4>
          <ul>
            <li>有<strong>两个真眼</strong>的棋是活棋，永远不会被提掉</li>
            <li>只有一个眼或假眼的棋可能被杀死</li>
            <li>做活是围棋中最重要的技术之一</li>
          </ul>
          <p className="tip">👁️ 时刻注意己方棋子是否有两个眼位！</p>
        </>
      ),
      image: '👀'
    },
    {
      title: '地盘与胜负',
      content: (
        <>
          <p>围棋的目标是占据更多的地盘（目）。</p>
          <h4>计算胜负：</h4>
          <ul>
            <li>数己方围住的交叉点数量</li>
            <li>加上提掉对方的棋子数</li>
            <li>黑棋因为先行优势，通常需要贴目（让对方几目）</li>
            <li>地盘多的一方获胜</li>
          </ul>
          <p className="tip">🏆 不要贪吃对方的子，围地更重要！</p>
        </>
      ),
      image: '🗺️'
    },
    {
      title: '基本策略',
      content: (
        <>
          <h4>围棋格言：</h4>
          <ul>
            <li><strong>金角银边草肚皮</strong>：角最容易围地，边次之，中腹效率最低</li>
            <li><strong>棋从断处生</strong>：切断对方的联络很重要</li>
            <li><strong>敌之要点即我之要点</strong>：对方想下的地方往往是好点</li>
            <li><strong>攻击是最好的防守</strong>：进攻可以获得主动权</li>
          </ul>
          <p className="tip">📖 多做死活题，提高计算能力！</p>
        </>
      ),
      image: '🎓'
    }
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const current = sections[currentSection];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="tutorial-content">
          <div className="tutorial-icon">{current.image}</div>
          <h2>{current.title}</h2>

          <div className="tutorial-text">
            {current.content}
          </div>

          <div className="tutorial-progress">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
                onClick={() => setCurrentSection(index)}
              />
            ))}
          </div>

          <div className="tutorial-navigation">
            <button
              onClick={handlePrev}
              disabled={currentSection === 0}
              className="nav-button"
            >
              ← 上一页
            </button>

            <span className="page-indicator">
              {currentSection + 1} / {sections.length}
            </span>

            {currentSection < sections.length - 1 ? (
              <button onClick={handleNext} className="nav-button primary">
                下一页 →
              </button>
            ) : (
              <button onClick={onClose} className="nav-button primary">
                开始游戏
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

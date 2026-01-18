import React from 'react';
import TopNav from "./component/shared/TopNav";
import './App.css';

function App() {
  return (
      <div className="dashboard-container">
        {/* 1. 상단 네비게이션 */}
        <TopNav></TopNav>

        {/* 2. 프로젝트 헤더 */}
        <section className="project-header">
          <div>
            <div className="title-row">
              <h1 style={{margin: 0}}>프로젝트 제목입니다</h1>
              <span className="d-day-badge">D - 10</span>
            </div>
            <p style={{color: '#9ca3af', margin: 0}}>기간: 2026.01.01 ~ 2026.02.02</p>
          </div>
          <button className="ai-button">AI 리포트</button>
        </section>

        {/* 3. 탭 메뉴 */}
        <nav className="tab-menu">
          <button className="tab-item active">대시보드</button>
          <button className="tab-item">업무</button>
          <button className="tab-item">이슈 트래커</button>
          <button className="tab-item">멤버/설정</button>
        </nav>

        {/* 4. 대시보드 메인 그리드 */}
        <main className="dashboard-grid">

          {/* 왼쪽 섹션 */}
          <div className="column">
            <div className="card work-progress-card">
              <span>진행중인 업무</span>
              <span style={{fontSize: '1.2rem'}}>10/50</span>
            </div>
            <div className="card status-chart-card">
              <h3 style={{margin: 0}}>프로젝트 현황</h3>
              <div className="chart-placeholder">
                일별 멤버 커밋 수<br/>원형 그래프
              </div>
            </div>
          </div>

          {/* 중앙 섹션 */}
          <div className="column">
            <div className="stat-grid">
              <div className="card stat-box">
                <div style={{fontSize: '0.9rem', marginBottom: '8px'}}>오픈 이슈</div>
                <div style={{fontWeight: 'bold'}}>3건</div>
              </div>
              <div className="card stat-box">
                <div style={{fontSize: '0.9rem', marginBottom: '8px'}}>오늘 커밋</div>
                <div style={{fontWeight: 'bold'}}>5건</div>
              </div>
            </div>
            <div className="card">
              <h3 style={{margin: 0}}>최근 활동 로그</h3>
              <div className="activity-list">
                <div className="log-item"><div className="user-avatar"></div> user1 commit: commit</div>
                <div className="log-item"><div className="user-avatar" style={{backgroundColor: '#e91e63'}}></div> user2 aaaaa</div>
                <div className="log-item"><div className="user-avatar" style={{backgroundColor: '#00bcd4'}}></div> user3 bbbbb</div>
                <div className="log-item"><div className="user-avatar"></div> user1 ccccc</div>
              </div>
            </div>
          </div>

          {/* 오른쪽 섹션 */}
          <div className="card">
            <h3 style={{margin: 0}}>나의 할 일</h3>
            <ul className="todo-list">
              <li className="todo-item">
                <input type="checkbox" defaultChecked />
                <span>문서 작성</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 1</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 2</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 3</span>
              </li>
            </ul>
          </div>

        </main>
      </div>
  );
}
export default App;

import React from 'react';
import { useNavigate } from "react-router-dom";
import './ProjectDashboardPage.css'; // CSS는 기존 것 활용

// onBack: 목록으로 돌아가기
// onEnterReport: AI 리포트 화면으로 이동
const ProjectDashboardPage = ({ onEnterReport }) => {

  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* 2. 프로젝트 헤더 */}
      <section className="project-header">
        <div>
          <div className="title-row">
            {/* 뒤로가기 버튼 추가 */}
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>
            <h1 style={{ margin: 0 }}>LinkLogMate</h1>
            <span className="d-day-badge">D - 10</span>
          </div>
          <p style={{ color: '#9ca3af', margin: '0 0 0 30px' }}>기간: 2026.01.01 ~ 2026.02.02</p>
        </div>

        {/* AI 리포트 진입 버튼 */}
        <button className="ai-button" onClick={onEnterReport}>
          AI 리포트
        </button>
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
            <span style={{ fontSize: '1.2rem' }}>10/50</span>
          </div>
          <div className="card status-chart-card">
            <h3 style={{ margin: 0 }}>프로젝트 현황</h3>
            <div className="chart-placeholder">
              일별 멤버 커밋 수<br />원형 그래프
            </div>
          </div>
        </div>

        {/* 중앙 섹션 */}
        <div className="column">
          <div className="stat-grid">
            <div className="card stat-box">
              <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>오픈 이슈</div>
              <div style={{ fontWeight: 'bold' }}>3건</div>
            </div>
            <div className="card stat-box">
              <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>오늘 커밋</div>
              <div style={{ fontWeight: 'bold' }}>5건</div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: 0 }}>최근 활동 로그</h3>
            <div className="activity-list">
              <div className="log-item"><div className="user-avatar"></div> user1 commit: fix login</div>
              <div className="log-item"><div className="user-avatar" style={{ backgroundColor: '#e91e63' }}></div> user2 merge: develop</div>
              <div className="log-item"><div className="user-avatar" style={{ backgroundColor: '#00bcd4' }}></div> user3 create: db schema</div>
            </div>
          </div>
        </div>

        {/* 오른쪽 섹션 */}
        <div className="card">
          <h3 style={{ margin: 0 }}>나의 할 일</h3>
          <ul className="todo-list">
            <li className="todo-item">
              <input type="checkbox" defaultChecked readOnly />
              <span>API 명세서 작성</span>
            </li>
            <li className="todo-item">
              <input type="checkbox" />
              <span>로그인 페이지 퍼블리싱</span>
            </li>
            <li className="todo-item">
              <input type="checkbox" />
              <span>DB 연동 테스트</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboardPage;
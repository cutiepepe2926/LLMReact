import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from "../modal/CreateProjectModal"; // 경로 주의
import './ProjectListPage.css';

const ProjectListPage = ({ onEnterDashboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  // 목업 데이터
  const projects = [
    { 
      id: 1, 
      title: 'LinkLogMate', 
      startDate: '2026.01.01',
      endDate: '2026.04.13',
      completedTasks: 35, 
      totalTasks: 50,
      members: '홍길동 님 외 3명', 
      issueCount: 5,
      lastCommit: 'fix: login logic', 
      lastCommitTime: '30분 전' 
    },
    { 
      id: 2, 
      title: '쇼핑몰 프로젝트', 
      startDate: '2026.01.01',
      endDate: '2026.04.13',
      completedTasks: 12,
      totalTasks: 40,
      members: '김철수 님 외 2명',
      issueCount: 2, 
      lastCommit: 'feat: cart layout', 
      lastCommitTime: '2시간 전' 
    },
    { 
      id: 3, 
      title: '사내 인트라넷', 
      startDate: '2026.01.01',
      endDate: '2026.04.13',
      completedTasks: 5,
      totalTasks: 5,
      members: '이영희 님 외 5명', 
      issueCount: 0,
      lastCommit: 'init: project setup', 
      lastCommitTime: '1일 전' 
    }
  ];

  const handleCardClick = (e) => {
    navigate(`/projectDetail`);
  }

  return (
    <div className="list-container">
      {/* 모달 */}
      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={() => { setIsModalOpen(false); alert("생성 완료!"); }} 
        />
      )}

      {/* 헤더 */}
      <header className="list-header">
        <h2>프로젝트 대시보드</h2>
        <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
          {/* 플러스 아이콘 SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>새 프로젝트</span>
        </button>
      </header>

      {/* 카드 그리드 */}
      <div className="project-grid">
        {projects.map((p) => (
          <div key={p.id} className="project-card" onClick={() => handleCardClick(p.id)}>
            
            {/* --- 상단 영역 (흰색) --- */}
            <div className="card-body">
              {/* 1. 타이틀 (뱃지 삭제됨) */}
              <div className="card-top-row">
                <div className="title-group">
                  <h3>{p.title}</h3>
                </div>
              </div>

              {/* 2. 기간 */}
              <div className="date-range">
                {p.startDate} ~ {p.endDate}
              </div>

              {/* 3. 진행 상태 (바 삭제됨, 텍스트만 유지) */}
              <div className="task-status-text">
                <span className="highlight">{p.completedTasks}</span>
                <span className="divider">/</span>
                <span className="total">{p.totalTasks} 업무 완료</span>
              </div>

              {/* 4. 참여자 & 이슈 */}
              <div className="info-row">
                <div className="member-info">
                  <span className="label">참여자</span>
                  <div className="avatar-stack">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="avatar-circle" style={{zIndex: 3-i}}>                       
                        U{i+1}
                      </div>
                    ))}
                    <div className="avatar-circle more">+3</div>
                  </div>
                </div>
                
                {p.issueCount > 0 ? (
                   <div className="issue-badge">
                     {p.issueCount} Issue
                   </div>
                ) : (
                  <div className="issue-badge clean">
                     No Issue
                  </div>
                )}
              </div>
            </div>

            {/* --- 하단 영역 (회색) --- */}
            <div className="card-footer">
              <span className="branch-name">main:</span>
              <span className="commit-msg">{p.lastCommit}</span>
              <span className="commit-time">({p.lastCommitTime})</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectListPage;
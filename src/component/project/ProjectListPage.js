import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from "../modal/CreateProjectModal";
import './ProjectListPage.css';

const ProjectListPage = ({ onEnterDashboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // 목업 데이터 (isFavorite 추가)
  const [projects, setProjects] = useState([
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
      lastCommitTime: '30분 전', 
      isFavorite: true // 즐겨찾기 됨
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
      lastCommitTime: '2시간 전', 
      isFavorite: false 
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
      lastCommitTime: '1일 전', 
      isFavorite: false 
    }
  ]);

  const handleCardClick = (id) => {
    navigate(`/projectDetail`);
  }

  // 즐겨찾기 토글 함수
  const toggleFavorite = (id, e) => {
    e.stopPropagation(); // 카드 클릭 방지
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  return (
    <div className="list-container">
      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={() => { setIsModalOpen(false); alert("생성 완료!"); }} 
        />
      )}

      <header className="list-header">
        <h2>프로젝트 대시보드</h2>
        <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>새 프로젝트</span>
        </button>
      </header>

      <div className="project-grid">
        {projects.map((p) => (
          <div key={p.id} className="project-card" onClick={() => handleCardClick(p.id)}>
            
            <div className="card-body">
              {/* [수정] flex 레이아웃으로 제목과 버튼을 양 끝에 배치 */}
              <div className="card-top-row">
                <div className="title-group">
                  <h3>{p.title}</h3>
                </div>
                
                {/* 즐겨찾기 버튼 */}
                <button 
                  className={`favorite-btn ${p.isFavorite ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(p.id, e)}
                >
                  <svg 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill={p.isFavorite ? "#F59E0B" : "none"} /* 채워진 색: 노랑 / 비워진 색: 투명 */
                    stroke={p.isFavorite ? "#F59E0B" : "#D1D5DB"} /* 테두리 색: 노랑 / 회색 */
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              </div>

              <div className="date-range">{p.startDate} ~ {p.endDate}</div>

              <div className="task-status-text">
                <span className="highlight">{p.completedTasks}</span>
                <span className="divider">/</span>
                <span className="total">{p.totalTasks} 업무 완료</span>
              </div>

              <div className="info-row">
                <div className="member-info">
                  <span className="label">참여자</span>
                  <div className="avatar-stack">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="avatar-circle" style={{zIndex: 3-i}}>U{i+1}</div>
                    ))}
                    <div className="avatar-circle more">+3</div>
                  </div>
                </div>
                
                {p.issueCount > 0 ? (
                    <div className="issue-badge">{p.issueCount} Issue</div>
                ) : (
                  <div className="issue-badge clean">No Issue</div>
                )}
              </div>
            </div>

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
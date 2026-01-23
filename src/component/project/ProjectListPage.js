import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from "../modal/CreateProjectModal";
import './ProjectListPage.css';

const ProjectListPage = ({ onEnterDashboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState('ACTIVE');

  // 목업 데이터 (isFavorite 추가)
  const [projects, setProjects] = useState([
    { 
      id: 1, 
      title: 'LinkLogMate', 
      status: 'ACTIVE',
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
      status: 'DONE',
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
      status: 'ACTIVE',
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

  const filteredProjects = projects.filter(p => p.status === filterStatus);

  return (
    <div className="list-container">
      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={() => { setIsModalOpen(false); alert("생성 완료!"); }} 
        />
      )}

      <header className="list-header">
        <div className="header-left">
          <h2>프로젝트 대시보드</h2>
          <div className="filter-tabs">
            <button 
              className={`tab-btn ${filterStatus === 'ACTIVE' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('ACTIVE')}
            >
              진행 중
            </button>
            <button 
              className={`tab-btn ${filterStatus === 'DONE' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('DONE')}
            >
              완료됨
            </button>
          </div>
        </div>
        <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>새 프로젝트</span>
        </button>
      </header>

      <div className="project-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => handleCardClick(p.id)}>
              
              <div className="card-body">
                <div className="card-top-row">
                  <div className="title-group">
                    <h3>{p.title}</h3>
                  </div>
                  
                  <button 
                    className={`favorite-btn ${p.isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(p.id, e)}
                  >
                    <svg 
                      width="24" height="24" viewBox="0 0 24 24" 
                      fill={p.isFavorite ? "#F59E0B" : "none"} 
                      stroke={p.isFavorite ? "#F59E0B" : "#D1D5DB"} 
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
          ))
        ) : (
          <div className="empty-state">
            <p>해당 상태의 프로젝트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
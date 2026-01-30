import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from "../modal/CreateProjectModal";
import './ProjectListPage.css';

const ProjectListPage = ({ onEnterDashboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  // 상태 값을 소문자로 백엔드와 맞게 통일 (active | done | trash)
  const [filterStatus, setFilterStatus] = useState('active');
  const navigate = useNavigate();

  // 날짜 가공 함수 (2026-01-29T12:38:17 -> 2026.01.29)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split('T')[0].replace(/-/g, '.');
  };

  // 참여자 수 표시 가공 함수
  const formatMembers = (count) => {
    return count <= 1 ? '홍길동' : `홍길동 님 외 ${count - 1}명`;
  };

  // 프로젝트 목록 가져오기 (filterStatus가 바뀔 때마다 실행됨)
  const fetchProjects = useCallback(async () => {
    try {
      // 탭 상태(ACTIVE/DONE)를 소문자로 변환해 서버에 type 파라미터로 전달
      const data = await api.get('/api/projects', { type: filterStatus });

      const mappedData = data.map(p => ({
        ...p,
        isFavorite: false,
        lastCommit: 'fix: login logic',
        lastCommitTime: '30분 전'
      }));

      setProjects(mappedData);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      if (error.message.includes("401") || error.message.includes("토큰")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate('/login');
      }
    }
  }, [filterStatus, navigate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 프로젝트 생성 처리 함수
  const handleCreateProject = async (formData) => {
    try {
      const requestData = {
        name: formData.name,
        description: formData.description,
        gitUrl: formData.repoUrl,
        reportTime: `${formData.reportTime}:00`,
        endDate: `${formData.endDate}T23:59:59`,
        members: formData.members,
      };

      await api.post('/api/projects', requestData);
      alert("프로젝트가 생성되었습니다.");
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      alert("생성 실패: " + error.message);
    }
  };

  // 프로젝트 객체를 담아서 보낸다
  const handleCardClick = (project) => {
    // 두 번째 인자로 state 객체에 프로젝트 데이터 전체를 담아서 보냅니다.
    navigate(`/projectDetail`, { state: { projectData: project } });
  }

  // 즐겨찾기 토글 함수 (서버 기준 필드인 projectId로 수정)
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p =>
        p.projectId === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // 빈 화면 메시지 결정 함수
  const getEmptyMessage = () => {
    switch(filterStatus) {
      case 'active': return '현재 진행 중인 프로젝트가 없습니다.';
      case 'done': return '완료된 프로젝트가 없습니다.';
      case 'trash': return '휴지통이 비어있습니다.';
      default: return '프로젝트가 없습니다.';
    }
  };

  // 서버에서 이미 필터링된 목록을 가져오므로 projects를 바로 사용
  const displayProjects = projects;

  return (
      <div className="list-container">
        {isModalOpen && (
            <CreateProjectModal
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        )}

        <header className="list-header">
          <div className="header-left">
            <h2>프로젝트 대시보드</h2>
            <div className="filter-tabs">
              {/* 탭 클릭 시 filterStatus가 바뀌고, 이에 따라 useEffect가 새로 목록을 받아옵니다 */}
              <button
                  className={`tab-btn ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('active')}
              >
                진행 중
              </button>
              <button
                  className={`tab-btn ${filterStatus === 'done' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('done')}
              >
                완료됨
              </button>
              <button
                  className={`tab-btn ${filterStatus === 'trash' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('trash')}
              >
                휴지통
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
          {displayProjects.length > 0 ? (
              displayProjects.map((p) => (
                  <div
                      key={p.projectId}
                      className={`project-card ${filterStatus === 'trash' ? 'trash-card' : ''}`}
                      onClick={() => handleCardClick(p)}
                  >
                  {/*<div key={p.projectId} className="project-card" onClick={() => handleCardClick(p)}>*/}

                    <div className="card-body">
                      <div className="card-top-row">
                        <div className="title-group">
                          <h3>{p.name}</h3>
                        </div>

                        {/* 휴지통에서는 즐겨찾기 숨김 처리 예시 */}
                        {filterStatus !== 'trash' && (
                            <button
                                className={`favorite-btn ${p.isFavorite ? 'active' : ''}`}
                                onClick={(e) => toggleFavorite(p.projectId, e)}
                            >
                              {/* ... svg 아이콘 ... */}
                              <svg width="24" height="24" viewBox="0 0 24 24" fill={p.isFavorite ? "#F59E0B" : "none"} stroke={p.isFavorite ? "#F59E0B" : "#D1D5DB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </button>
                        )}
                      </div>

                      <div className="date-range">{formatDate(p.startDate)} ~ {formatDate(p.endDate)}</div>

                      <div className="task-status-text">
                        <span className="highlight">{p.completedTaskCount}</span>
                        <span className="divider">/</span>
                        <span className="total">{p.totalTaskCount} 업무 완료</span>
                      </div>

                      <div className="info-row">
                        <div className="member-info">
                          <span className="label">참여자</span>
                          <span className="member-text" style={{fontSize: '0.9rem', color: '#6B7280', marginLeft: '8px'}}>
                            {formatMembers(p.memberCount)}
                          </span>
                        </div>

                        {p.openIssueCount > 0 ? (
                            <div className="issue-badge">{p.openIssueCount} Issue</div>
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
                {/* 데이터가 없는 경우 대체 */}
                <p style={{ textAlign: 'center', width: '100%', padding: '40px', color: '#9CA3AF' }}>
                  {getEmptyMessage()}
                </p>
              </div>
          )}
        </div>
      </div>
  );
};

export default ProjectListPage;
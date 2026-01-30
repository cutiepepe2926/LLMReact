import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import './Sidebar.css';

// --- 아이콘 컴포넌트 ---
const Icons = {
    LinkLogo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
    Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Folder: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
    Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Star: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Github: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    // 1. 프로젝트 ID 식별
    const stateProjectId = location.state?.projectData?.projectId;
    const projectId = stateProjectId || params.projectId || 1;

    // 2. 현재 컨텍스트 확인 (프로젝트 내부 vs 메인)
    const isProjectContext = 
        location.pathname.startsWith('/projectDetail') || 
        location.pathname.startsWith('/projects') || 
        location.pathname.startsWith('/aiReport') ||
        stateProjectId !== undefined;

    // --- [State] 서버에서 받아올 데이터들 ---
    const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록
    const [allProjects, setAllProjects] = useState([]); // 전체 프로젝트 목록
    const [isAllProjOpen, setIsAllProjOpen] = useState(false); // 토글 상태 (기본 닫힘)
    const [myTasks, setMyTasks] = useState([]); // (프로젝트 내부) 내 잔여 업무
    const [reportStatus, setReportStatus] = useState(null); // (프로젝트 내부) 리포트 상태

    // --- [API] 데이터 불러오기 ---
    const fetchSidebarData = useCallback(async () => {
        try {
            if (isProjectContext) {
                // [CASE 1] 프로젝트 내부: 해당 프로젝트의 사이드바 정보 (내 업무, 리포트 등)
                // 백엔드 API 명세에 따라 경로 수정 필요 (/api/projects/{id}/sidebar 라고 가정)
                const res = await api.get(`/api/projects/${projectId}/sidebar`);
                setMyTasks(res.myTasks || []);
                setReportStatus(res.reportStatus || { status: 'Not Written', remainTime: '00:00:00' });
            } else {
                // [CASE 2] 메인(글로벌): 즐겨찾기 프로젝트 목록 조회
                // 백엔드 API: /api/sidebar (명세서 기준)
                const res = await api.get(`/api/sidebar`);
                setFavorites(res.favorites || []);
                setAllProjects(res.projects || []);
            }
        } catch (error) {
            console.error("사이드바 데이터 로딩 실패:", error);
            // 에러 시 빈 배열 처리로 화면 깨짐 방지
            setFavorites([]);
            setMyTasks([]);
        }
    }, [isProjectContext, projectId]);

    // 페이지 이동 시마다 데이터 갱신
    useEffect(() => {
        fetchSidebarData();

        const handleSidebarUpdate = () => {
            fetchSidebarData();
        };

        window.addEventListener('sidebar-update', handleSidebarUpdate);

        return () => {
            window.removeEventListener('sidebar-update', handleSidebarUpdate);
        };
    }, [fetchSidebarData]);


    // --- 메뉴 클릭 핸들러 (공통) ---
    const handleNavigation = (path, isBack = false) => {
        if (isBack) {
            navigate('/projectList');
        } else {
            // 프로젝트 내부 이동일 경우 state 유지
            navigate(path, { 
                state: { projectData: { projectId } } 
            });
        }
    };

    return (
        <aside className="sidebar-container">
            {/* 로고 */}
            <div className="sidebar-brand" onClick={() => handleNavigation('/projectList', true)}>
                <Icons.LinkLogo />
                <span className="brand-name">LinkLogMate</span>
            </div>

            {/* 프로젝트 컨텍스트 표시 (프로젝트 내부일 때만) */}
            {isProjectContext && (
                <div className="project-context-card">
                    <div className="context-icon">P</div>
                    <div className="context-info">
                        <span className="context-label">PROJECT</span>
                        {/* 프로젝트 이름은 API에서 받아오거나 state에서 가져와야 함 */}
                        <span className="context-title">{location.state?.projectData?.name || `Project #${projectId}`}</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-menu">
                
                {/* === [CASE 1] 프로젝트 내부 메뉴 === */}
                {isProjectContext ? (
                    <>
                        {/* 1. 상태 위젯 */}
                        <div className="menu-status-card">
                            <div className="status-header">
                                <span className="status-label">Status</span>
                                <span className="status-badge on-track">Active</span>
                            </div>
                            <div className="ai-timer-badge">
                                <Icons.Clock />
                                <span>{reportStatus?.remainTime || "00:00:00"}</span>
                            </div>
                            <button 
                                className="today-report-btn" 
                                onClick={() => handleNavigation(`/projects/${projectId}/daily-reports`)}
                            >
                                <span className="report-icon"><Icons.Edit /></span>
                                <div className="report-text-col">
                                    <span className="report-label">Daily Report</span>
                                    <span className={`report-status ${reportStatus?.status === 'COMPLETED' ? 'completed' : 'not-written'}`}>
                                        {reportStatus?.status === 'COMPLETED' ? '작성 완료' : '작성하기'}
                                    </span>
                                </div>
                            </button>
                        </div>

                        <div className="menu-section-label">MENU</div>
                        
                        <div className="menu-item" onClick={() => handleNavigation(`/projectDetail`)}>
                            <span className="menu-icon-box"><Icons.Home /></span>
                            <span className="menu-text">대시보드</span>
                        </div>
                        <div className="menu-item" onClick={() => handleNavigation(`/tasks`)}> 
                            {/* 라우터 설정에 따라 /projectDetail 내부 탭일 수도 있고 별도 페이지일 수도 있음 */}
                            <span className="menu-icon-box"><Icons.Folder /></span>
                            <span className="menu-text">업무 보드</span>
                        </div>

                        <div className="menu-divider" />
                        
                        <div className="menu-section-label">MY TASKS</div>
                        <div className="my-tasks-container">
                            {myTasks.length > 0 ? myTasks.map((task, idx) => (
                                <div key={task.taskId || idx} className="sidebar-task-item">
                                    <span className={`task-dot ${task.status === 'IN_PROGRESS' ? 'yellow' : 'blue'}`}></span>
                                    <span className="task-title">{task.title}</span>
                                </div>
                            )) : (
                                <div className="sidebar-task-item" style={{color: '#999', fontSize:'0.8rem'}}>할 일이 없습니다.</div>
                            )}
                        </div>

                        <div style={{ flex: 1 }} />
                        <div className="menu-item back-btn" onClick={() => handleNavigation(null, true)}>
                            <span className="menu-icon-box"><Icons.Back /></span>
                            <span className="menu-text">프로젝트 나가기</span>
                        </div>
                    </>
                ) : (
                    /* === [CASE 2] 메인(글로벌) 메뉴 === */
                    <>
                        <div className={`menu-item ${location.pathname === '/projectList' ? 'active' : ''}`} onClick={() => navigate('/projectList')}>
                            <span className="menu-icon-box"><Icons.Home /></span>
                            <span className="menu-text">홈</span>
                        </div>
                        {/* 전체 프로젝트 토글 버튼 */}
                        <div 
                            className={`menu-item ${isAllProjOpen ? 'active-light' : ''}`} 
                            onClick={() => setIsAllProjOpen(!isAllProjOpen)}
                        >
                            <span className="menu-icon-box"><Icons.Folder /></span>
                            <span className="menu-text">전체 프로젝트</span>
                            <span className={`toggle-arrow ${isAllProjOpen ? 'open' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </div>

                        {/* 토글 리스트 컨테이너 */}
                        <div className={`sub-menu-container ${isAllProjOpen ? 'open' : ''}`}>
                            {allProjects.length > 0 ? allProjects.map(proj => (
                                <div 
                                    key={proj.projectId} 
                                    className="sub-menu-item"
                                    onClick={() => navigate(`/projectDetail`, { state: { projectData: proj } })}
                                >
                                    <span className="sub-menu-dot">•</span>
                                    <span className="sub-menu-text">{proj.name}</span>
                                </div>
                            )) : (
                                <div className="sub-menu-empty">참여 중인 프로젝트가 없습니다.</div>
                            )}
                        </div>

                        <div className="menu-divider" />
                        <div className="menu-section-label">FAVORITES</div>

                        {/* [API 연동] 즐겨찾기 목록 렌더링 */}
                        {favorites.length > 0 ? favorites.map(fav => (
                            <div 
                                key={fav.projectId} 
                                className="menu-item"
                                onClick={() => navigate(`/projectDetail`, { state: { projectData: fav } })}
                            >
                                <span className="menu-icon-box"><Icons.Star /></span>
                                <span className="menu-text">{fav.name}</span>
                            </div>
                        )) : (
                            <div style={{ padding: '10px 20px', color: '#9CA3AF', fontSize: '0.8rem' }}>
                                즐겨찾는 프로젝트가 없습니다.
                            </div>
                        )}
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import './Sidebar.css';

// --- 아이콘 컴포넌트 ---
const Icons = {
    LinkLogo: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
    Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Folder: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>,
    Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Star: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    Github: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
    ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
};

// 기존 함수를 지우고 이 코드로 덮어씌워주세요.
const calculateTimeRemaining = (targetTimeStr) => {
    if (!targetTimeStr) return "00:00:00";
    try {
        const now = new Date();
        const [h, m, s] = targetTimeStr.split(':').map(Number);

        const target = new Date();
        target.setHours(h, m, s || 0, 0); // 초, 밀리초까지 정확하게 설정

        // [핵심 수정] 목표 시간이 현재보다 이전이면(이미 지났으면), 내일 날짜로 설정
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }

        let diff = target - now;
        if (diff < 0) return "00:00:00";

        // 전체 남은 시간 계산 (24시간 넘지 않으므로 % 24는 그대로 둬도 무방하나 제거해도 됨)
        const rh = Math.floor(diff / (1000 * 60 * 60));
        const rm = Math.floor((diff / (1000 * 60)) % 60);
        const rs = Math.floor((diff / 1000) % 60);

        return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
    } catch (e) { return "00:00:00"; }
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    const stateProjectId = location.state?.projectData?.projectId;
    const isProjectContext = (stateProjectId !== undefined) || (params.projectId !== undefined) || location.pathname.startsWith('/projectDetail') || location.pathname.startsWith('/tasks') || location.pathname.startsWith('/daily-reports');
    const projectId = stateProjectId || params.projectId || 1;
    const projectName = location.state?.projectData?.name || `Project #${projectId}`;

    const [favorites, setFavorites] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [isAllProjOpen, setIsAllProjOpen] = useState(false);
    const [myTasks, setMyTasks] = useState([]);
    const [projectStatus, setProjectStatus] = useState("ACTIVE");
    const [githubUrl, setGithubUrl] = useState(null); // GitHub URL 상태 추가
    const [isReportWritten, setIsReportWritten] = useState(false);
    const [reportTargetTime, setReportTargetTime] = useState(null);
    const [displayTime, setDisplayTime] = useState("00:00:00");
    const [myIssues, setMyIssues] = useState([]);

    // Sidebar.js 로고 클릭
    // eslint-disable-next-line
    const goToHome = () => {
        navigate('/projectList', { replace: true, state: {} }); // state를 비움
    };

    // ProjectHeader.js 뒤로가기
    // eslint-disable-next-line
    const goBackToList = () => {
        navigate('/projectList', { state: {} });
    };

    const fetchSidebarData = useCallback(async () => {
        try {
            if (isProjectContext) {
                const res = await api.get(`/api/projects/${projectId}/sidebar`);
                setMyTasks(Array.isArray(res.myTasks) ? res.myTasks : []);
                setMyIssues(Array.isArray(res.myIssues) ? res.myIssues : []);
                setProjectStatus(res.projectStatus || "ACTIVE");
                setGithubUrl(res.githubUrl || null);
                setIsReportWritten(res.reportWritten);
                setReportTargetTime(res.dailyReportTime);
                setDisplayTime(calculateTimeRemaining(res.dailyReportTime));
            } else {
                const res = await api.get(`/api/sidebar`);
                setFavorites(res.favorites || []);
                setAllProjects(res.projects || []);
            }
        } catch (error) { console.error("사이드바 로딩 실패:", error); }
    }, [isProjectContext, projectId]);

    useEffect(() => {
        fetchSidebarData();
        const handleUpdate = () => fetchSidebarData();
        window.addEventListener('sidebar-update', handleUpdate);
        window.addEventListener('taskUpdate', handleUpdate);
        return () => {
            window.removeEventListener('sidebar-update', handleUpdate);
            window.removeEventListener('taskUpdate', handleUpdate);
        };
    }, [fetchSidebarData]);

    useEffect(() => {
        if (!isProjectContext || !reportTargetTime || isReportWritten) return;
        const intervalId = setInterval(() => setDisplayTime(calculateTimeRemaining(reportTargetTime)), 1000);
        return () => clearInterval(intervalId);
    }, [isProjectContext, reportTargetTime, isReportWritten]);

    const getStatusColor = (task) => {
        if (!task || !task.status) return '#3b82f6';
        const s = String(task.status).toUpperCase();
        return (s.includes("PROGRESS") || s.startsWith("I")) ? '#f59e0b' : '#3b82f6';
    };

    const getPriorityBadge = (priority) => {
        if (priority === 3) return { label: '상', className: 'badge-high' };
        if (priority === 2) return { label: '중', className: 'badge-medium' };
        if (priority === 1) return { label: '하', className: 'badge-low' };
        return null;
    };

    const sortedTasks = [...myTasks].sort((a, b) => {
        const colorA = getStatusColor(a);
        const colorB = getStatusColor(b);
        if (colorA === '#f59e0b' && colorB !== '#f59e0b') return -1;
        if (colorA !== '#f59e0b' && colorB === '#f59e0b') return 1;
        return (b.priority || 0) - (a.priority || 0);
    });

    return (
        <aside className="sidebar-container">
            <div className="sidebar-brand" onClick={() => {
                navigate('/projectList', { state: {} }); 
            }}>
                <Icons.LinkLogo /><span className="brand-name">LinkLogMate</span>
            </div>

            {isProjectContext && (
                <div className="project-context-card">
                    <div className="context-icon">P</div>
                    <div className="context-info">
                        <span className="context-label">PROJECT</span>
                        <span className="context-title">{projectName}</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-menu">
                {isProjectContext ? (
                    <>
                        <div className="menu-status-card">
                            <div className="status-header">
                                <span className="status-label">Status</span>
                                <span className={`status-badge ${projectStatus === 'ACTIVE' ? 'active' : 'done'}`}>{projectStatus}</span>
                            </div>
                            <div className="timer-box">
                                <Icons.Clock /><span className="timer-text">{isReportWritten ? "작성 완료" : displayTime}</span>
                            </div>
                            <div className={`daily-report-box ${isReportWritten ? 'disabled' : ''}`} onClick={() => !isReportWritten && navigate(`/aiReport`, { state: { projectData: { projectId, name: projectName } } })}>
                                <div className="report-icon-bg"><Icons.Edit /></div>
                                <div className="report-text-group">
                                    <span className="report-title">Daily Report</span>
                                    <span className={`report-action ${isReportWritten ? 'done' : 'write'}`}>{isReportWritten ? '작성 완료' : '작성하기'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="menu-section-label">PROJECT TOOLS</div>
                        
                        {/* ★ GitHub 바로가기 (테이블 없이 구현) */}
                        {githubUrl && githubUrl.trim() !== "" ? (
                            <a
                                href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="menu-item github-link"
                            >
                                <span className="menu-icon-box"><Icons.Github /></span>
                                <span className="menu-text">GitHub 저장소</span>
                                <Icons.ExternalLink style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </a>
                        ) : (
                            <div className="menu-item disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                <span className="menu-icon-box"><Icons.Github /></span>
                                <span className="menu-text">GitHub (주소 없음)</span>
                            </div>
                        )}

                        <div className="menu-divider" />

                        <div className="menu-section-label">MY TASKS ({myTasks.length})</div>
                        <div className="task-scroll-area">
                            {sortedTasks.length > 0 ? sortedTasks.map((task, idx) => {
                                const dotColor = getStatusColor(task);
                                const badge = getPriorityBadge(task.priority);
                                return (
                                    <div
                                        key={task.taskId || idx} 
                                        className="sidebar-task-item" 
                                        onClick={() => navigate('/projectDetail', { 
                                            state: { 
                                                activeTab: 'task', 
                                                projectData: { projectId },
                                                targetTaskId: task.taskId
                                            }
                                        })}
                                    >
                                        <span className="task-dot" style={{ backgroundColor: dotColor, boxShadow: `0 0 0 2px ${dotColor}33` }}></span>
                                        <span className={`task-title ${dotColor === '#f59e0b' ? 'highlight-text' : ''}`}>{task.title}</span>
                                        {badge && <span className={`mini-badge ${badge.className}`}>{badge.label}</span>}
                                    </div>
                                );
                            }) : <div className="no-tasks">남은 업무가 없습니다.</div>}
                        </div>

                        {/* MY ISSUES 섹션 (업무 목록 바로 아래에 추가) */}
                        <div className="menu-divider" />
                        <div className="menu-section-label">MY ISSUES ({myIssues.length})</div>

                        <div className="task-scroll-area" style={{ maxHeight: '150px' }}> {/* 필요시 높이 조절 */}
                            {myIssues.length > 0 ? myIssues.map((issue, idx) => (
                                <div
                                    key={issue.issueId || idx}
                                    className="sidebar-task-item"
                                    onClick={() => {
                                        // state 대신 search(쿼리 스트링) 사용
                                        navigate({
                                            pathname: '/projectDetail', // 또는 `/project/${projectId}/dashboard`
                                            search: `?issueId=${issue.issueId}`,
                                        }, {
                                            // state도 같이 보내주면 안전장치 역할 (프로젝트 정보 유지)
                                            state: {
                                                projectData: { projectId, name: projectName }
                                            }
                                        });
                                    }}
                                >
                                    {/* 이슈 구분용 보라색 점 (색상은 추후 논의) */}
                                    <span className="task-dot" style={{ backgroundColor: '#A855F7', boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.2)' }}></span>

                                    <span className="task-title">{issue.title}</span>

                                    {/* 우선순위 뱃지 (P0 ~ P5) */}
                                    {issue.priority !== undefined && (
                                        <span className="mini-badge badge-high" style={{ backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}>
                                            P{issue.priority}
                                        </span>
                                    )}
                                </div>
                            )) : <div className="no-tasks">할당된 이슈가 없습니다.</div>}
                        </div>

                        <div style={{ flex: 1 }} />
                        <div className="menu-item back-btn" onClick={() => navigate('/projectList')}>
                            <span className="menu-icon-box"><Icons.Back /></span><span className="menu-text">프로젝트 나가기</span>
                        </div>
                    </>
                ) : (
                    /* 메인 화면 (변경 없음) */
                    <>
                        <div className={`menu-item ${location.pathname === '/projectList' ? 'active' : ''}`} onClick={() => navigate('/projectList')}>
                            <span className="menu-icon-box"><Icons.Home /></span><span className="menu-text">홈</span>
                        </div>
                        <div className={`menu-item ${isAllProjOpen ? 'active-light' : ''}`} onClick={() => setIsAllProjOpen(!isAllProjOpen)}>
                            <span className="menu-icon-box"><Icons.Folder /></span><span className="menu-text">전체 프로젝트</span>
                            <span className={`toggle-arrow ${isAllProjOpen ? 'open' : ''}`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
                        </div>
                        <div className={`sub-menu-container ${isAllProjOpen ? 'open' : ''}`}>
                            {allProjects.map(proj => (
                                <div key={proj.projectId} className="sub-menu-item" onClick={() => navigate(`/projectDetail`, { state: { projectData: proj } })}>
                                    <span className="sub-menu-dot">•</span><span className="sub-menu-text">{proj.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="menu-divider" />
                        <div className="menu-section-label">FAVORITES</div>
                        {favorites.map(fav => (
                            <div key={fav.projectId} className="menu-item" onClick={() => navigate(`/projectDetail`, { state: { projectData: fav } })}>
                                <span className="menu-icon-box"><Icons.Star /></span><span className="menu-text">{fav.name}</span>
                            </div>
                        ))}
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
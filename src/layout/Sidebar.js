import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom'; // useParams 추가
import './Sidebar.css';

// 아이콘 컴포넌트
const Icons = {
    LinkLogo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
    Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Folder: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
    Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Star: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Github: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
};

const MENUS = {
    global: [
        { id: 'home', label: '홈', path: '/projectList', icon: <Icons.Home /> },
        { id: 'all_projects', label: '전체 프로젝트', path: '/projectList', icon: <Icons.Folder /> },
        { type: 'divider' },
        { type: 'label', label: 'FAVORITES' },
        { id: 'fav1', label: '쇼핑몰 리뉴얼', path: '/projects/1', icon: <Icons.Star /> },
        { id: 'fav2', label: '사내 메신저 V2', path: '/projects/2', icon: <Icons.Star /> },
    ],

    project_context: [
        // 상단: 프로젝트 상태 & 리포트
        { type: 'status_card', status: 'On Track', reportStatus: 'Not Written', remainTime: '02:30:15' },
        
        { type: 'label', label: 'MENU' },
        { id: 'dashboard', label: '대시보드', path: '/dashboard', icon: <Icons.Home /> },
        { id: 'tasks', label: '업무 보드', path: '/tasks', icon: <Icons.Folder /> },
        { id: 'members', label: '멤버 관리', path: '/members', icon: <Icons.Users /> },

        { type: 'divider' },
        
        { type: 'label', label: 'MY TASKS' },
        { type: 'my_tasks_list', tasks: [
            { id: 1, title: '로그인 API 연동', status: 'In Progress' },
            { id: 2, title: '메인 페이지 퍼블리싱', status: 'Todo' },
        ]},

        { type: 'spacer' },
        { id: 'back', label: '프로젝트 나가기', path: '/projectList', icon: <Icons.Back />, type: 'back' },
    ]
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = useParams(); // URL 파라미터에서 projectId 가져오기

    // 현재 경로가 프로젝트 내부인지 확인
    const isProjectContext = 
        location.pathname.startsWith('/projectDetail') || 
        location.pathname.startsWith('/projects') || 
        location.pathname.startsWith('/aiReport');


    // 메뉴 렌더링 함수
    const renderMenu = (menu, index) => {
        if (menu.type === 'divider') return <div key={`div-${index}`} className="menu-divider" />;
        if (menu.type === 'label') return <div key={`lbl-${index}`} className="menu-section-label">{menu.label}</div>;
        if (menu.type === 'spacer') return <div key={`sp-${index}`} style={{ flex: 1 }} />;
        
        // 1. 상태 + 리포트 위젯
        if (menu.type === 'status_card') {
            return (
                <div key={`st-${index}`} className="menu-status-card">
                    <div className="status-header">
                        <span className="status-label">Status</span>
                        <span className="status-badge on-track">{menu.status}</span>
                    </div>
                    <div className="ai-timer-badge">
                        <Icons.Clock />
                        <span>리포트 생성까지 {menu.remainTime}</span>
                    </div>
                    <button className="today-report-btn" onClick={() => navigate(`/projects/${projectId || 1}/daily-reports`)}>
                        <span className="report-icon"><Icons.Edit /></span>
                        <div className="report-text-col">
                            <span className="report-label">Daily Report</span>
                            <span className="report-status not-written">작성하기</span>
                        </div>
                    </button>
                </div>
            );
        }

        // 2. 내 업무 리스트
        if (menu.type === 'my_tasks_list') {
            return (
                <div key={`tasks-${index}`} className="my-tasks-container">
                    {menu.tasks.map(task => (
                        <div key={task.id} className="sidebar-task-item">
                            <span className={`task-dot ${task.status === 'In Progress' ? 'yellow' : 'blue'}`}></span>
                            <span className="task-title">{task.title}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // 3. 일반 메뉴 아이템
        // 현재 경로가 메뉴 경로를 포함하는지 확인 (Active 상태 유지)
        // 예: /projects/1/dashboard 는 /dashboard 메뉴를 활성화
        const currentPath = location.pathname;
        const targetPath = isProjectContext && menu.path.startsWith('/') 
            ? `/projects/${projectId}${menu.path}` 
            : menu.path;
            
        const isActive = currentPath === targetPath || (menu.id !== 'home' && currentPath.includes(menu.path));

        return (
            <div 
                key={menu.id || index} 
                className={`menu-item ${isActive ? 'active' : ''} ${menu.type === 'back' ? 'back-btn' : ''}`}
                onClick={() => navigate(targetPath)}
            >
                <span className="menu-icon-box">{menu.icon}</span>
                <span className="menu-text">{menu.label}</span>
            </div>
        );
    };

    return (
        <aside className="sidebar-container">
            <div className="sidebar-brand" onClick={() => navigate('/projectList')}>
                <Icons.LinkLogo />
                <span className="brand-name">LinkLogMate</span>
            </div>

            {isProjectContext && (
                <div className="project-context-card">
                    <div className="context-icon">P</div>
                    <div className="context-info">
                        <span className="context-label">PROJECT</span>
                        <span className="context-title">쇼핑몰 리뉴얼</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-menu">
                {isProjectContext 
                    ? MENUS.project_context.map(renderMenu) 
                    : MENUS.global.map(renderMenu)
                }
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">홍<div className="status-dot"></div></div>
                    <div className="user-meta">
                        <span className="user-name">홍길동</span>
                        <div className="user-git-status"><Icons.Github /><span>Linked</span></div>
                    </div>
                    <button className="footer-setting-btn"><Icons.Settings /></button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

// SVG Icons
const Icons = {
    LinkLogo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#58A6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
    Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Folder: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
    CheckSquare: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
    Github: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
    Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
};

const MENUS = {
    // 1. 공통 메뉴 (항상 보임)
    global: [
        { id: 'home', label: '홈', path: '/projectList', icon: <Icons.Home /> },
        { id: 'my-task', label: '내 작업', path: '/myTasks', icon: <Icons.CheckSquare /> },
        { id: 'projects', label: '전체 프로젝트', path: '/projectList', icon: <Icons.Folder /> },
    ],
    // 2. 프로젝트 내부 메뉴
    project_admin: [
        { type: 'divider' }, // 구분선
        { type: 'label', label: 'PROJECT ADMIN' },
        { id: 'member', label: '멤버 및 권한', path: '', icon: <Icons.Users /> },
        { id: 'setting', label: '프로젝트 설정', path: '', icon: <Icons.Settings /> },
        { type: 'spacer' }, // 여백용
        { id: 'back', label: '목록으로 나가기', path: '/projectList', icon: <Icons.Back />, type: 'back' },
    ]
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isProjectContext = location.pathname.startsWith('/projectDetail') || location.pathname.startsWith('/aiReport');

    return (
        <aside className="sidebar-container">
            {/* 로고 */}
            <div className="sidebar-brand" onClick={() => navigate('/projectList')}>
                <Icons.LinkLogo />
                <span className="brand-name">LinkLogMate</span>
            </div>

            {/* 프로젝트 컨텍스트 카드 */}
            {isProjectContext && (
                <div className="project-context-card">
                    <div className="context-icon">P</div>
                    <div className="context-info">
                        <span className="context-label">Current Project</span>
                        <span className="context-title">프로젝트 제목입니다</span>
                    </div>
                </div>
            )}

            {/* 메뉴 리스트 */}
            <nav className="sidebar-menu">
                {/* 1. 글로벌 메뉴 (항상 표시) */}
                {MENUS.global.map(renderMenu)}

                {/* 2. 프로젝트 관련 관리 메뉴 (프로젝트 진입 시에만 표시) */}
                {isProjectContext && MENUS.project_admin.map(renderMenu)}
            </nav>

            {/* 하단 프로필 */}
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

    // 메뉴 렌더링
    function renderMenu(menu, index) {
        if (menu.type === 'divider') return <div key={`div-${index}`} className="menu-divider" />;
        if (menu.type === 'label') return <div key={`lbl-${index}`} className="menu-section-label">{menu.label}</div>;
        if (menu.type === 'spacer') return <div key={`sp-${index}`} style={{ flex: 1 }} />;

        const isActive = location.pathname === menu.path;
        return (
            <div 
                key={menu.id} 
                className={`menu-item ${isActive ? 'active' : ''} ${menu.type === 'back' ? 'back-btn' : ''}`}
                onClick={() => menu.path && navigate(menu.path)}
            >
                <span className="menu-icon-box">{menu.icon}</span>
                <span className="menu-text">{menu.label}</span>
            </div>
        );
    }
};

export default Sidebar;
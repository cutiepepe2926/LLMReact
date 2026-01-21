import React from "react";
import "./TopNav.css";

// Icons
const Icons = {
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Help: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
};

export default function TopNav() {
    return (
        <header className="top-header">
            {/* 1. 좌측: 브레드크럼 */}
            <div className="header-left">
                <span className="breadcrumb-item">Workspace</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Project Name</span>
            </div>

            {/* 2. 중앙: 글로벌 검색창 */}
            <div className="header-center">
                <div className="search-bar-wrapper">
                    <Icons.Search />
                    <input type="text" placeholder="이슈, 리포트, 멤버 검색..." />
                </div>
            </div>

            {/* 3. 우측: 유틸리티 버튼 */}
            <div className="header-right">

                <div className="divider-vertical"></div>

                {/* 알림 */}
                <button className="icon-btn" title="알림">
                    <Icons.Bell />
                    <span className="noti-badge"></span>
                </button>
                
                <button className="icon-btn" title="도움말">
                    <Icons.Help />
                </button>

                {/* 프로필 */}
                <div className="header-profile">
                    <div className="mini-avatar">홍</div>
                </div>
            </div>
        </header>
    );
}
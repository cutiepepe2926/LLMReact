import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            
            {/* 1. 사이드바 */}
            <Sidebar />
            
            {/* 2. 우측 영역 */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minWidth: 0,
                backgroundColor: '#F8F9FA'
            }}>
                
                {/* 헤더 */}
                <TopNav />
                
                {/* 콘텐츠 영역 */}
                <main style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    overflowX: 'hidden',
                    position: 'relative'
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
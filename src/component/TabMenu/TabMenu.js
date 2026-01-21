import React, { useState, useEffect, useRef } from 'react';
import './TabMenu.css';

const TabMenu = ({ tabs, activeKey, onChange }) => {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(tabs.length);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // 화면 크기에 따라 보여줄 탭 개수
    useEffect(() => {
        const calculateVisibleTabs = () => {
            if (!containerRef.current) return;
            
            const containerWidth = containerRef.current.offsetWidth;
            const tabWidth = 100;
            const moreBtnWidth = 80;
            const maxTabs = Math.floor((containerWidth - moreBtnWidth) / tabWidth);
            const count = Math.max(1, Math.min(tabs.length, maxTabs));
            setVisibleCount(count);

        };

        calculateVisibleTabs();
        window.addEventListener('resize', calculateVisibleTabs);
        return () => window.removeEventListener('resize', calculateVisibleTabs);
    }, [tabs.length]);

    const visibleTabs = tabs.slice(0, visibleCount);
    const hiddenTabs = tabs.slice(visibleCount);

    return (
        <div className="tab-menu-container" ref={containerRef}>
            {/* 1. 보이는 탭들 */}
            {visibleTabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`tab-item ${activeKey === tab.key ? 'active' : ''}`}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.label}
                    {activeKey === tab.key && <div className="tab-indicator" />}
                </button>
            ))}

            {/* 2. 숨겨진 탭이 있을 때 '+N' 버튼 표시 */}
            {hiddenTabs.length > 0 && (
                <div className="tab-more-wrapper">
                    <button 
                        className={`tab-item more-btn ${hiddenTabs.some(t => t.key === activeKey) ? 'active' : ''}`}
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                    >
                        {hiddenTabs.length}
                    </button>
                    
                    {/* 드롭다운 메뉴 */}
                    {isMoreOpen && (
                        <div className="tab-dropdown">
                            {hiddenTabs.map(tab => (
                                <div 
                                    key={tab.key} 
                                    className={`dropdown-item ${activeKey === tab.key ? 'active' : ''}`}
                                    onClick={() => {
                                        onChange(tab.key);
                                        setIsMoreOpen(false);
                                    }}
                                >
                                    {tab.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TabMenu;
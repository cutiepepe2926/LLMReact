import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "../../../../utils/api";
import "./DashBoardGrid.css";

const Icons = {
    Task: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    Commit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    More: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
    Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
};

export default function DashboardGrid({ projectId }) {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        openIssues: 0,
        memberCount: 0
    });

    const [myTasks, setMyTasks] = useState([]);

   useEffect(() => {
        const fetchProjectStats = async () => {
            if (!projectId) return; 

            try {
                const res = await api.get(`/api/projects/${projectId}/dashboard`);
                
                setStats({
                    totalTasks: res.totalTaskCount || 0,
                    completedTasks: res.completedTaskCount || 0,
                    inProgressTasks: res.inProgressTaskCount || 0,
                    openIssues: res.openIssueCount || 0,
                    memberCount: res.memberCount || 0
                });
                
                // 내 업무 리스트 가져오기
                const sidebarRes = await api.get(`/api/projects/${projectId}/sidebar`);
                setMyTasks(sidebarRes.myTasks || []);

            } catch (error) {
                console.error("대시보드 데이터 로딩 실패:", error);
            }
        };

        fetchProjectStats();
    }, [projectId]);
    
    // 마감 임박 업무 필터링 로직
    const urgentTasks = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return myTasks
            .filter(task => task.status !== 'DONE') 
            .map(task => {
                const dateStr = task.dueDate || task.due_date; 
                if (!dateStr) return { ...task, dDay: 999 };

                const dueDate = new Date(dateStr);
                dueDate.setHours(0, 0, 0, 0);
                
                const diffTime = dueDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...task, dDay: diffDays };
            })
            .filter(task => task.dDay !== 999)
            .sort((a, b) => a.dDay - b.dDay)
            .slice(0, 4);
    }, [myTasks]);

    // 진행률 계산 (0으로 나누기 방지)
    const progressPercentage = stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100);
    // 진행 중인 업무 = 전체 - 완료 (단순 계산)
    // eslint-disable-next-line
    const inProgressTasks = stats.totalTasks - stats.completedTasks;

    return (
        <>
            {/* [1] 왼쪽 섹션 */}
            <div className="dashboard-column">
                {/* 1-1. 프로젝트 진행 현황 카드 */}
                <div className="card progress-card simple">
                    <div className="card-header-row">
                        <span className="card-title">프로젝트 완성도</span>
                        <span className="status-badge running">
                            진행중인 업무 {stats.inProgressTasks}건
                        </span>
                    </div>
                    <div className="big-fraction-display">
                        <span className="done-big">{stats.completedTasks}</span>
                        <span className="divider">/</span>
                        <span className="total-small">{stats.totalTasks}</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="progress-footer-text">
                        전체 <b>{stats.totalTasks}개</b> 업무 중 <b>{stats.completedTasks}개</b>를 완료했습니다.
                    </div>
                </div>

                {/* 1-2. 차트 카드 */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3>멤버별 기여도</h3>
                        <button className="icon-btn"><Icons.More /></button>
                    </div>
                    <div className="chart-wrapper">
                        <div className="donut-chart">
                            <div className="donut-hole">
                                <span className="chart-total">128</span>
                                <span className="chart-label">Total Commits</span>
                            </div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item"><span className="dot" style={{background: '#58A6FF'}}></span>홍길동 (40%)</div>
                            <div className="legend-item"><span className="dot" style={{background: '#A855F7'}}></span>김철수 (35%)</div>
                            <div className="legend-item"><span className="dot" style={{background: '#EC4899'}}></span>이영희 (25%)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* [2] 중앙 섹션 */}
            <div className="dashboard-column">
                {/* 2-1. 미니 스탯 */}
                <div className="stat-grid-row">
                    <div className="card stat-box">
                        <span className="stat-label">오픈 이슈</span>
                        <span className="stat-value red">{stats.openIssues}</span>
                    </div>
                    <div className="card stat-box">
                        <span className="stat-label">오늘 커밋</span>
                        <span className="stat-value blue">12</span>
                    </div>
                </div>

                {/* 2-2. 활동 로그 */}
                <div className="card log-card">
                    <div className="card-header">
                        <h3>최근 활동</h3>
                    </div>
                    <div className="timeline-list">
                        <div className="timeline-item">
                            <div className="timeline-line"></div>
                            <div className="timeline-dot commit"></div>
                            <div className="timeline-content">
                                <p className="log-text"><strong>홍길동</strong>님이 <span className="code">feat/login</span>을 푸시했습니다.</p>
                                <span className="log-time">10분 전</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-line"></div>
                            <div className="timeline-dot task"></div>
                            <div className="timeline-content">
                                <p className="log-text"><strong>김철수</strong>님이 <strong>이슈 #12</strong>를 완료했습니다.</p>
                                <span className="log-time">1시간 전</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot comment"></div>
                            <div className="timeline-content">
                                <p className="log-text"><strong>이영희</strong>님이 댓글을 남겼습니다.</p>
                                <span className="log-time">3시간 전</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* [3] 오른쪽 섹션: "나의 할 일" -> "마감 임박 업무"로 교체 */}
            <div className="dashboard-column">
                <div className="card todo-card urgent-widget">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <Icons.Alert />
                            <h3>마감 임박 업무</h3>
                        </div>
                        <span className="badge-count red">{urgentTasks.length}</span>
                    </div>
                    
                    <div className="urgent-list">
                        {urgentTasks.length > 0 ? (
                            urgentTasks.map((task) => (
                                <div 
                                    key={task.taskId} 
                                    className="urgent-item" 
                                    onClick={() => navigate('/projectDetail', { 
                                        state: { 
                                            activeTab: 'task', 
                                            projectData: { projectId },
                                            targetTaskId: task.taskId
                                        }
                                    })}
                                >
                                    <div className={`d-day-tag ${task.dDay <= 1 ? 'critical' : ''}`}>
                                        {task.dDay === 0 ? "D-Day" : task.dDay < 0 ? "지연" : `D-${task.dDay}`}
                                    </div>
                                    <div className="task-info">
                                        <div className="task-name">{task.title}</div>
                                        <div className="task-date">{task.dueDate || task.due_date} 마감</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-urgent">
                                <p>마감이 임박한 업무가 없습니다.</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className="view-all-btn" 
                        onClick={() => navigate('/projectDetail', { 
                            state: { 
                                activeTab: 'task', // 업무 탭으로 전환 요청
                                projectData: { projectId } 
                            } 
                        })}
                    >
                        전체 업무 보러가기
                    </button>
                </div>
            </div>
        </>
    );
}
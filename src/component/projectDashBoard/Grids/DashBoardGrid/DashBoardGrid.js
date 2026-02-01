import React, { useEffect, useState } from "react";
import { api } from "../../../../utils/api";
import "./DashBoardGrid.css";

const Icons = {
    Task: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    Commit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    More: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
};

export default function DashboardGrid({ projectId }) {

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        openIssues: 0,
        memberCount: 0
    });

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
            } catch (error) {
                console.error("대시보드 데이터 로딩 실패:", error);
            }
        };

        fetchProjectStats();
    }, [projectId]);

    // 진행률 계산 (0으로 나누기 방지)
    const progressPercentage = stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100);
    // 진행 중인 업무 = 전체 - 완료 (단순 계산)
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
                        <span className="stat-value red">3</span>
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

            {/* [3] 오른쪽 섹션 */}
            <div className="dashboard-column">
                <div className="card todo-card">
                    <div className="card-header">
                        <h3>나의 할 일</h3>
                        <span className="badge-count">4</span>
                    </div>
                    <ul className="custom-todo-list">
                        <li className="todo-item">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" defaultChecked />
                                <span className="custom-checkbox"><Icons.Check /></span>
                                <span className="todo-text completed">요구사항 명세서 작성</span>
                            </label>
                        </li>
                        <li className="todo-item">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="custom-checkbox"><Icons.Check /></span>
                                <span className="todo-text">API 설계 검토</span>
                            </label>
                            <span className="tag high">High</span>
                        </li>
                        <li className="todo-item">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="custom-checkbox"><Icons.Check /></span>
                                <span className="todo-text">메인 페이지 UI 구현</span>
                            </label>
                        </li>
                        <li className="todo-item">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="custom-checkbox"><Icons.Check /></span>
                                <span className="todo-text">DB 스키마 회의</span>
                            </label>
                            <span className="tag medium">Medium</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
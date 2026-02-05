import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "../../../../utils/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./DashBoardGrid.css";

const Icons = {
    Task: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
    Commit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    More: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
    Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
};

const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "방금 전";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString(); // 7일 이상이면 날짜 표시
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardGrid({ projectId }) {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        openIssues: 0,
        memberCount: 0,
        todayCommitCount: 0
    });

    const [myTasks, setMyTasks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("main"); // 기본값 main
    const [commitLogs, setCommitLogs] = useState([]);
    const [contributions, setContributions] = useState([]);

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
                    memberCount: res.memberCount || 0,
                    todayCommitCount: res.todayCommitCount || 0
                });
                
                // 내 업무 리스트 가져오기
                const sidebarRes = await api.get(`/api/projects/${projectId}/sidebar`);
                setMyTasks(sidebarRes.myTasks || []);

                // 내 브랜치 목록 가져오기
                const branchRes = await api.get(`/api/github/${projectId}/getBranch`);
                if (Array.isArray(branchRes)) {
                    setBranches(branchRes);
                    // 만약 'main' 브랜치가 목록에 없다면 첫 번째 브랜치를 선택
                    const hasMain = branchRes.some(b => b.name === 'main');
                    if (!hasMain && branchRes.length > 0) {
                        setSelectedBranch(branchRes[0].name);
                    }
                }

            } catch (error) {
                console.error("대시보드 데이터 로딩 실패:", error);
            }
        };

        fetchProjectStats();
    }, [projectId]);

    // 선택된 브랜치가 변경될 때마다 해당 브랜치의 커밋 수 조회
    // useEffect(() => {
    //     const fetchBranchCommitCount = async () => {
    //         if (!projectId || !selectedBranch) return;
    //
    //         try {
    //             // 백엔드에 새로 만든 API 호출 (branch 파라미터 전달)
    //             const res = await api.get(`/api/github/${projectId}/today-commit-count?branch=${selectedBranch}`);
    //
    //             // 받아온 커밋 수로 상태 업데이트
    //             setStats(prev => ({
    //                 ...prev,
    //                 todayCommitCount: res.commitCount || 0
    //             }));
    //         } catch (error) {
    //             console.error("브랜치 커밋 수 조회 실패:", error);
    //             // 에러 시 0으로 초기화하지 않고 기존 값 유지하거나 0 처리
    //         }
    //     };
    //
    //     fetchBranchCommitCount();
    // }, [projectId, selectedBranch]);
    useEffect(() => {
        const fetchGithubData = async () => {
            if (!projectId || !selectedBranch) return;

            try {
                // 1. 오늘 커밋 수 조회 (기존 로직)
                const countRes = await api.get(`/api/github/${projectId}/today-commit-count?branch=${selectedBranch}`);
                setStats(prev => ({ ...prev, todayCommitCount: countRes.commitCount || 0 }));

                // 2. 최근 커밋 로그 조회
                const logRes = await api.get(`/api/github/${projectId}/recent-commits?branch=${selectedBranch}`);
                setCommitLogs(logRes || []); // 받아온 리스트 저장

                // 3. 기여도 조회
                const contribRes = await api.get(`/api/github/${projectId}/contribution?branch=${selectedBranch}`);
                setContributions(contribRes || []);

            } catch (error) {
                console.error("GitHub 데이터 조회 실패:", error);
            }
        };

        fetchGithubData();
    }, [projectId, selectedBranch]);
    
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

    console.log(stats);

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
                <div className="card contribution-card" style={{ marginBottom: '15px' }}>
                    <div className="card-header">
                        <h3>멤버별 기여도 ({selectedBranch})</h3>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250 }}>
                        {contributions.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={contributions}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60} // 안쪽을 비워서 도넛 모양으로 (0이면 꽉 찬 원)
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="name" // 데이터에서 이름 키
                                    >
                                        {contributions.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} commits`} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-log">
                                <p>기여도 데이터가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* [2] 중앙 섹션 */}
            <div className="dashboard-column">

                {/* 2-1. 미니 스탯 (기존 유지, 드롭다운 제거됨) */}
                <div className="stat-grid-row">
                    <div className="card stat-box">
                        <span className="stat-label">오픈 이슈</span>
                        <span className="stat-value red">{stats.openIssues}</span>
                    </div>

                    <div className="card stat-box">
                        <span className="stat-label">오늘 커밋</span>
                        {/* 여기 있던 select 제거함 */}
                        <span className="stat-value blue">{stats.todayCommitCount}</span>
                    </div>
                </div>

                {/* [2-New] 브랜치 선택 바 (새로 추가된 위치) */}
                <div className="branch-selection-bar">
                    <div className="branch-label-group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', color:'#6b7280'}}>
                            <line x1="6" y1="3" x2="6" y2="15"></line>
                            <circle cx="18" cy="6" r="3"></circle>
                            <circle cx="6" cy="18" r="3"></circle>
                            <path d="M18 9a9 9 0 0 1-9 9"></path>
                        </svg>
                        <span className="selection-label">Target Branch:</span>
                    </div>

                    <select
                        className="branch-select-custom"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        {branches.map((branch) => (
                            <option key={branch.name} value={branch.name}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2-2. 활동 로그 (기존 유지) */}
                <div className="card log-card">
                    <div className="card-header">
                        {/* 제목에 선택된 브랜치 이름 표시로 명확성 업! */}
                        <h3>최근 커밋 활동 <span style={{fontSize:'0.8em', color:'#6b7280', fontWeight:'normal'}}>({selectedBranch})</span></h3>
                    </div>
                    <div className="timeline-list">
                        {commitLogs.length > 0 ? (
                            commitLogs.map((log, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-line"></div>
                                    <div className="timeline-dot commit"></div>
                                    <div className="timeline-content">
                                        <p className="log-text">
                                            <strong>{log.author}</strong>
                                            <a href={log.url} target="_blank" rel="noopener noreferrer" className="commit-link">
                                                "{log.message}"
                                            </a>
                                        </p>
                                        <span className="log-time">{timeAgo(log.date)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-log">
                                <p>최근 커밋 내역이 없습니다.</p>
                            </div>
                        )}
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
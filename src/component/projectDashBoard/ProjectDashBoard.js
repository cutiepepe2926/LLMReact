import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from "../../utils/api";

import ProjectHeader from "../projectHeader/ProjectHeader";
import TabMenu from "../TabMenu/TabMenu";
import DashboardGrid from "./Grids/DashBoardGrid/DashBoardGrid";
import TaskBoard from "./Grids/TaskGrid/TaskBoard";
import FinalReportGrid from "./Grids/FinalReportGrid/FinalReportGrid"; // [병합] 최종 리포트 컴포넌트
import MemberSettingsGrid from "./Grids/MemberSettingsGrid/MemberSettingsGrid";
import IssueTrackerView from "./Grids/IssueViewGrid/IssueTrackerView";
import InviteSelectModal from "../modal/InviteSelectModal";
import './ProjectDashBoard.css';

function ProjectDashBoard() {

    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    // 1. projectId 결정 (Invite 코드의 로직 유지 - 안전성 확보)
    const stateProjectData = location.state?.projectData;
    const projectId = params.projectId 
                      ? parseInt(params.projectId) 
                      : (location.state?.projectData?.projectId ? parseInt(location.state.projectData.projectId) : null);

    // 2. State 관리
    const [projectData, setProjectData] = useState(
        (stateProjectData && stateProjectData.name) ? stateProjectData : null
    );
    const [loading, setLoading] = useState(false);
    
    // [초기 탭 설정] location.state로 넘어온 탭이 있으면 우선 사용, 없으면 dashboard
    const [activeTab, setActiveTab] = React.useState(location.state?.initialTab || "dashboard");
    const [targetTaskId, setTargetTaskId] = useState(null);

    const TABS = [
        { key: "dashboard", label: "대시보드" },
        { key: "task", label: "업무" },
        { key: "issue", label: "이슈" },
        { key: "finalReport", label: "최종 리포트" },
        { key: "memberSettings", label: "멤버/설정"},
    ];

    // 새로고침 한 후 projectData 다시 불러오기
    useEffect(() => {
        const fetchProjectDetail = async () => {
            if (projectId && (!projectData || projectData.projectId !== projectId)) {
                try {
                    setLoading(true);
                    console.log(`데이터 복구 중... 프로젝트 ID: ${projectId}`);
                    const response = await api.get(`/api/projects/${projectId}`);
                    setProjectData(response.data || response);
                } catch (error) {
                    console.error("데이터 복구 실패:", error);
                    alert("프로젝트 정보를 불러올 수 없습니다.");
                    navigate('/projectList');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProjectDetail();
    }, [projectId, projectData, navigate]);

    // 3. 프로젝트 정보 갱신 함수 (하위 컴포넌트 전달용)
    const refreshProjectData = useCallback(async () => {
        if (!projectId) return;

        try {
            console.log("프로젝트 정보 갱신 중...");
            const res = await api.get(`/api/projects/${projectId}`);
            setProjectData(res.data || res); 
        } catch (error) {
            console.error("프로젝트 정보 갱신 실패:", error);
        }
    }, [projectId]);

    // 4. 초대 알림 초기 데이터 페칭 (중복 호출 방지 로직 포함)
    useEffect(() => {
        if (projectData && projectData.projectId === projectId && projectData.name) {
            return;
        }

        const fetchProjectDetail = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/projects/${projectId}`);
                setProjectData(response);
            } catch (error) {
                console.error("프로젝트 상세 조회 실패:", error);
                alert("존재하지 않거나 삭제된 프로젝트입니다.");
                navigate('/projectList');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectDetail();
        }
    }, [projectId, projectData, navigate]);

    // 5. 초대 수락/거절 핸들러
    const handleAcceptInvite = async () => {
        if (!window.confirm("프로젝트 초대를 수락하시겠습니까?")) return;
        try {
            await api.post(`/api/projects/${projectId}/accept`);
            alert("환영합니다! 프로젝트 참여가 완료되었습니다.");
            await refreshProjectData(); // 수락 후 데이터 갱신 (블러 해제)
        } catch (error) {
            console.error("초대 수락 실패:", error);
            alert(error.message || "초대 수락 중 오류가 발생했습니다.");
        }
    };

    const handleDeclineInvite = async () => {
        if (!window.confirm("정말 거절하시겠습니까? 거절 시 프로젝트 목록으로 이동합니다.")) return;
        try {
            await api.post(`/api/projects/${projectId}/decline`);
            alert("초대를 거절했습니다.");
            navigate('/projectList'); 
        } catch (error) {
            console.error("초대 거절 실패:", error);
            alert(error.message || "초대 거절 중 오류가 발생했습니다.");
        }
    };

    // 탭 자동 변경 로직 (외부 링크나 네비게이션으로 들어왔을 때)
    useEffect(() => {
        const requestedTab = location.state?.activeTab || location.state?.initialTab;
        const requestedTaskId = location.state?.targetTaskId; 

        if (requestedTab && TABS.some(tab => tab.key === requestedTab)) {
            setActiveTab(requestedTab);

            if (requestedTaskId) {
                setTargetTaskId(requestedTaskId);

                // URL 상태 정리 (새로고침 시 반복 실행 방지)
                window.history.replaceState(
                    { ...window.history.state, usr: { ...location.state, targetTaskId: null } }, 
                    document.title
                );
            }
        }
        // eslint-disable-next-line
    }, [location.state]);

    const handleTabChange = (key) => {
        setTargetTaskId(null); // 다른 탭 누르면 상세 호출 신호 초기화
        setActiveTab(key);
    };

    const isInvited = projectData?.currentUserStatus === 'INVITED';

    return (
        <div className="dashboard-container">
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>

            {/* 블러 처리를 위한 Wrapper */}
            <div className={`dashboard-content-wrapper ${isInvited ? 'blurred-locked' : ''}`}>

                {projectData && <ProjectHeader project={projectData} />}

                <TabMenu tabs={TABS} activeKey={activeTab} onChange={handleTabChange} />

                <main className="dashboard-grid">
                    {loading ? (
                        <div className="grid-loading">데이터를 불러오는 중입니다...</div>
                    ) : projectData ? (
                        <>
                            {/* [병합된 렌더링 로직] */}
                            {activeTab === "issue" || activeTab === "memberSettings" ? (
                                <div className="issue-grid-only">
                                    {activeTab === "issue" 
                                        ? <IssueTrackerView projectId={projectId} project={projectData} /> 
                                        : <MemberSettingsGrid projectId={projectId} project={projectData} onProjectUpdate={refreshProjectData} />
                                    }
                                </div>
                            ) : activeTab === "task" ? (
                                <TaskBoard projectId={projectId} project={projectData} initialTaskId={targetTaskId} />
                            ) : activeTab === "finalReport" ? (
                                // [추가] 최종 리포트 탭 연결
                                <FinalReportGrid projectId={projectId} project={projectData} />
                            ) : (
                                <DashboardGrid projectId={projectId} project={projectData} />
                            )}
                        </>
                    ) : null}
                </main>
            </div>

            {/* 초대 수락 모달 */}
            {isInvited && (
                <InviteSelectModal
                    projectName={projectData?.name}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                />
            )}
        </div>
    );
}

export default ProjectDashBoard;
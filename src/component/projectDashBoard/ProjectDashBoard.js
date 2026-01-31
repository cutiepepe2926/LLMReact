import React, { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from "../../utils/api";

import ProjectHeader from "../projectHeader/ProjectHeader";
import TabMenu from "../TabMenu/TabMenu";
import DashboardGrid from "./Grids/DashBoardGrid/DashBoardGrid";
import TaskBoard from "./Grids/TaskGrid/TaskBoard";
import FinalReportGrid from "./Grids/FinalReportGrid/FinalReportGrid";
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
    const projectId = stateProjectData?.projectId 
                      ? parseInt(stateProjectData.projectId) 
                      : (params.projectId ? parseInt(params.projectId) : 1);

    // 2. State 관리 (Invite 코드 + 갱신을 위한 준비)
    const [projectData, setProjectData] = useState(
        (stateProjectData && stateProjectData.name) ? stateProjectData : null
    );
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = React.useState("dashboard");

    const TABS = [
        { key: "dashboard", label: "대시보드" },
        { key: "task", label: "업무" },
        { key: "issue", label: "이슈" },
        { key: "finalReport", label: "최종 리포트" },
        { key: "memberSettings", label: "멤버/설정"},
    ];

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

    // 4. 초대 알림 초기 데이터 페칭
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

    const TAB_COMPONENTS = {
        dashboard: DashboardGrid,
        issue: IssueTrackerView,
        task: TaskBoard,
        finalReport: FinalReportGrid,
        memberSettings: MemberSettingsGrid,
    };

    const GridContent = TAB_COMPONENTS[activeTab] ?? DashboardGrid;

    if (loading) {
        return <div className="dashboard-loading">프로젝트 정보를 불러오는 중입니다...</div>;
    }

    const isInvited = projectData?.currentUserStatus === 'INVITED';

    return (
        <div className="dashboard-container">
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>

            {/* 블러 처리를 위한 Wrapper */}
            <div className={`dashboard-content-wrapper ${isInvited ? 'blurred-locked' : ''}`}>

                {projectData && <ProjectHeader project={projectData} />}

                <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

                <main className="dashboard-grid">
                    {activeTab === "issue" || activeTab === "memberSettings" ? (
                        <div className="issue-grid-only">
                            {activeTab === "issue" 
                                ? <IssueTrackerView 
                                    projectId={projectId} 
                                    project={projectData} // project 데이터 전달
                                  /> 
                                : <MemberSettingsGrid 
                                    projectId={projectId} 
                                    project={projectData} // project 데이터 전달
                                    onProjectUpdate={refreshProjectData} // 갱신 함수 전달
                                  />
                            }
                        </div>
                    ) : (
                        <GridContent 
                            projectId={projectId} 
                            project={projectData} // 공통적으로 전달
                        />
                    )}
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
import React, { useState, useEffect } from 'react'; // useEffect 추가
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from "../../utils/api"; // API 유틸 import

import ProjectHeader from "../projectHeader/ProjectHeader";
import TabMenu from "../TabMenu/TabMenu";
import DashboardGrid from "./Grids/DashBoardGrid/DashBoardGrid";
import TaskBoard from "./Grids/TaskGrid/TaskBoard";
import FinalReportGrid from "./Grids/FinalReportGrid/FinalReportGrid";
import MemberSettingsGrid from "./Grids/MemberSettingsGrid/MemberSettingsGrid";
import IssueTrackerView from "./Grids/IssueViewGrid/IssueTrackerView";
import './ProjectDashBoard.css';

function ProjectDashBoard() {

    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    // 1. state로 넘어온 데이터 확인 (알림에서는 { projectId: 1 } 형태로만 올 수 있음)
    const stateProjectData = location.state?.projectData;
    
    // 2. projectId 결정 (state 우선, 없으면 URL 파라미터)
    const projectId = stateProjectData?.projectId 
                      ? parseInt(stateProjectData.projectId) 
                      : (params.projectId ? parseInt(params.projectId) : 1);

    // 3. 프로젝트 데이터 상태 관리
    // state로 데이터가 넘어왔더라도, 'name' 같은 상세 정보가 없으면 null 취급하여 새로 fetch 유도
    const [projectData, setProjectData] = useState(
        (stateProjectData && stateProjectData.name) ? stateProjectData : null
    );
    
    const [loading, setLoading] = useState(false);

    const TABS = [
        { key: "dashboard", label: "대시보드" },
        { key: "task", label: "업무" },
        { key: "issue", label: "이슈" },
        { key: "finalReport", label: "최종 리포트" },
        { key: "memberSettings", label: "멤버/설정"},
    ];

    const [activeTab, setActiveTab] = React.useState("dashboard");

    // 4. 데이터 페칭 로직 (알림 타고 왔거나, 새로고침 했을 때 실행)
    useEffect(() => {
        // 이미 완전한 데이터(이름 포함)를 가지고 있고, ID가 일치하면 API 호출 스킵
        if (projectData && projectData.projectId === projectId && projectData.name) {
            return;
        }

        const fetchProjectDetail = async () => {
            try {
                setLoading(true);
                // 백엔드: GET /api/projects/{projectId} 호출
                const response = await api.get(`/api/projects/${projectId}`);
                setProjectData(response); // 받아온 ProjectDetailResponseDTO 저장
            } catch (error) {
                console.error("프로젝트 상세 조회 실패:", error);
                alert("존재하지 않거나 삭제된 프로젝트입니다.");
                navigate('/projectList'); // 에러 시 목록으로 이동
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectDetail();
        }
    }, [projectId, projectData, navigate]);


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

    return (
        <div className="dashboard-container">

            {/* 뒤로가기 버튼 */}
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>

            {/* 헤더: 데이터가 있을 때만 렌더링 */}
            {projectData && <ProjectHeader project={projectData} />}

            {/* 탭 메뉴 */}
            <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

            {/* 메인 콘텐츠 그리드 */}
            {activeTab === "issue" || activeTab === "memberSettings" ? (
                <div className="issue-grid-only">
                    {/* 하위 컴포넌트들에게 projectId 전달 (필요 시 자체적으로 데이터 로드 가능하도록) */}
                    {activeTab === "issue" 
                        ? <IssueTrackerView projectId={projectId} /> 
                        : <MemberSettingsGrid projectId={projectId} />
                    }
                </div>
            ) : (
                <main className="dashboard-grid">
                    <GridContent projectId={projectId} />
                </main>
            )}

        </div>
    );
}
export default ProjectDashBoard;
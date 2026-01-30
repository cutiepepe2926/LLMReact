import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../utils/api';

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
    const navigate = useNavigate();
    // 1. location.state로 초기값을 잡되, 변경 가능하도록 useState로 감싸기.
    const [projectData, setProjectData] = useState(location.state?.projectData || null);


    const TABS = [
        { key: "dashboard", label: "대시보드" },
        { key: "task", label: "업무" },
        { key: "issue", label: "이슈" },
        { key: "finalReport", label: "최종 리포트" },
        { key: "memberSettings", label: "멤버/설정"},
    ];

    const [activeTab, setActiveTab] = React.useState("dashboard");

    const TAB_COMPONENTS = {
        dashboard: DashboardGrid,
        issue: IssueTrackerView,
        task: TaskBoard,
        finalReport: FinalReportGrid,
        memberSettings: MemberSettingsGrid,
    };

    // 프로젝트 상세 정보를 다시 불러오는 함수 (Refetch)
    const refreshProjectData = useCallback(async () => {
        if (!projectData?.projectId) return;

        try {
            console.log("프로젝트 정보 갱신 중...");
            const res = await api.get(`/api/projects/${projectData.projectId}`);
            // 받아온 최신 데이터로 상태 업데이트 -> 헤더 및 하위 컴포넌트 자동 리렌더링
            setProjectData(res.data || res);
        } catch (error) {
            console.error("프로젝트 정보 갱신 실패:", error);
        }
    }, [projectData?.projectId]);

    const GridContent = TAB_COMPONENTS[activeTab] ?? DashboardGrid;

    return (
        <div className="dashboard-container">

            {/* 2. 프로젝트 헤더 */}
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>

            {/*<ProjectHeader*/}
            {/*    project={{projectData}}*/}
            {/*    onClickAiReport={() => console.log("AI 리포트 클릭")}*/}
            {/*/>*/}
            <ProjectHeader project={projectData} />


            {/* 3. 탭 메뉴 */}
            <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

            {/* 4. 대시보드 메인 그리드 */}
            {/* 4. 하위 컴포넌트에 refreshProjectData 함수(onProjectUpdate) 전달 */}
            {activeTab === "issue" || activeTab === "memberSettings" ? (
                <div className="issue-grid-only">
                    {activeTab === "issue" ?
                        <IssueTrackerView project={projectData}/> :
                        <MemberSettingsGrid project={projectData}
                                            onProjectUpdate={refreshProjectData} // 갱신 함수 전달
                        />}
                </div>
            ) : (
                <main className="dashboard-grid">
                    <GridContent project={projectData}/>
                </main>
            )}


        </div>
    );
}
export default ProjectDashBoard;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    const projectData = location.state?.projectData;
    const navigate = useNavigate();

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
            {activeTab === "issue" || activeTab === "memberSettings" ? (
                <div className="issue-grid-only">
                    {activeTab === "issue" ? <IssueTrackerView project={projectData}/> : <MemberSettingsGrid project={projectData}/>}
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

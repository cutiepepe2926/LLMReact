import React from 'react';
import ProjectHeader from "../projectHeader/ProjectHeader";
import TabMenu from "../TabMenu/TabMenu";
import DashboardGrid from "./Grids/DashBoardGrid/DashBoardGrid";
import FinalReportGrid from "./Grids/FinalReportGrid/FinalReportGrid";
import './ProjectDashBoard.css';
import {useNavigate} from "react-router-dom";

function ProjectDashBoard() {

    const navigate = useNavigate();

    const TABS = [
        { key: "dashboard", label: "대시보드" },
        { key: "task", label: "업무" },
        { key: "report", label: "AI 리포트" },
        { key: "finalReport", label: "최종 리포트" },
        { key: "member", label: "멤버"},
    ];

    const [activeTab, setActiveTab] = React.useState("dashboard");

    const TAB_COMPONENTS = {
        dashboard: DashboardGrid,
        task: DashboardGrid,
        report: DashboardGrid,
        finalReport: FinalReportGrid,
        member: DashboardGrid,
    };

    const GridContent = TAB_COMPONENTS[activeTab] ?? DashboardGrid;

    return (
        <div className="dashboard-container">

            {/* 2. 프로젝트 헤더 */}
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>
            <ProjectHeader
                title="프로젝트 제목입니다"
                dDay={10}
                periodText="기간: 2026.01.01 ~ 2026.02.02"
                onClickAiReport={() => console.log("AI 리포트 클릭")}
            />


            {/* 3. 탭 메뉴 */}
            <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

            {/* 4. 대시보드 메인 그리드 */}
            <main className="dashboard-grid">
                <GridContent/>
            </main>
        </div>
    );
}
export default ProjectDashBoard;

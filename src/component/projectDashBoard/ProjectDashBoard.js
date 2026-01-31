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
import InviteSelectModal from "../modal/InviteSelectModal";
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

    // 초대 수락 핸들러
    const handleAcceptInvite = async () => {
        if (!window.confirm("프로젝트 초대를 수락하시겠습니까?")) return;

        try {
            await api.post(`/api/projects/${projectId}/accept`);

            alert("환영합니다! 프로젝트 참여가 완료되었습니다.");
            
            // 데이터 새로고침 (블러 제거 및 내용 갱신을 위해)
            // 방법 1: 새로고침 (가장 확실)
            // window.location.reload(); 
            
            // 방법 2: state만 갱신 (더 부드러운 UX를 원한다면)
            const response = await api.get(`/api/projects/${projectId}`);
            setProjectData(response);

        } catch (error) {
            console.error("초대 수락 실패:", error);
            alert(error.message || "초대 수락 중 오류가 발생했습니다.");
        }
    };

    // 초대 거절 핸들러
    const handleDeclineInvite = () => {
        if(window.confirm("정말 거절하시겠습니까? 프로젝트 목록으로 이동합니다.")) {
            console.log("초대 거절 API 호출 예정");
            // TODO: API 호출 로직 추가
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

    // projectData가 있고, 내 상태가 'INVITED'이면 블러 적용
    const isInvited = projectData?.currentUserStatus === 'INVITED';

    return (
        <div className="dashboard-container">

            {/* 뒤로가기 버튼 */}
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>←</button>

            {/* 전체 컨텐츠 래퍼: INVITED 상태면 블러 및 클릭 잠금 처리 */}
            <div className={`dashboard-content-wrapper ${isInvited ? 'blurred-locked' : ''}`}>

                {/* 헤더: 래퍼 안으로 이동됨 (같이 블러 처리됨) */}
                {projectData && <ProjectHeader project={projectData} />}

                {/* 탭 메뉴: 래퍼 안으로 이동됨 (같이 블러 처리됨) */}
                <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

                {/* 메인 컨텐츠 영역*/}
                <main className="dashboard-grid">
                    {activeTab === "issue" || activeTab === "memberSettings" ? (
                        <div className="issue-grid-only">
                            {activeTab === "issue" 
                                ? <IssueTrackerView projectId={projectId} /> 
                                : <MemberSettingsGrid projectId={projectId} />
                            }
                        </div>
                    ) : (
                        <GridContent projectId={projectId} />
                    )}
                </main>
            </div>

            {/* 2. 블러 시 보여줄 오버레이 메시지 (위치 유지) */}
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
// IssueTrackerView.js
import React, { useState } from "react";
import IssueListPage from "./IssueGrid/IssueList/IssueListPage";
import IssueDetailModal from "./IssueGrid/IssueDetailModal/IssueDetailModal";
import TabMenu from "../../../TabMenu/TabMenu"; // TabMenu 컴포넌트 경로에 맞춰 임포트

export default function IssueTrackerView({project}) {
    // 1. 기존 view ("GRID" | "LIST") 상태 제거
    // 2. 탭 메뉴를 위한 상태 관리 (기본값: ALL 또는 UNASSIGNED)
    const [selectedStatus, setSelectedStatus] = useState("UNASSIGNED");
    const [selectedIssue, setSelectedIssue] = useState(null);
    const projectId = project?.projectId || project?.id;

    console.log("이슈트랙뷰야!");
    console.log(project);

    // 탭 구성을 위한 데이터
    const issueTabs = [
        // { key: "ALL", label: "전체 이슈" },
        { key: "UNASSIGNED", label: "미배정 이슈" },
        { key: "IN_PROGRESS", label: "처리중인 이슈" },
        { key: "DONE", label: "완료된 이슈" },
    ];

    return (
        <div className="issue-tracker-container">
            {/* 3. 상단에 IssueTabMenu 공간 생성 및 TabMenu 배치 */}
            <div className="issue-tab-menu-wrapper" style={{ marginBottom: '20px' }}>
                <TabMenu
                    tabs={issueTabs}
                    activeKey={selectedStatus}
                    onChange={setSelectedStatus}
                />
            </div>

            {/* 4. 항상 IssueListPage를 렌더링하며 현재 선택된 탭을 필터로 전달 */}
            {/* 리스트 페이지: selectedStatus가 UNASSIGNED이므로 필터링되어 보임 */}
            <IssueListPage
                projectId={projectId}
                initialStatus={selectedStatus}
                onOpenDetail={(issue) => setSelectedIssue(issue)}
            />

            {selectedIssue && (
                <IssueDetailModal
                    open={!!selectedIssue}
                    issue={selectedIssue}
                    projectId={projectId}  // <--- 여기가 핵심입니다!
                    onClose={() => setSelectedIssue(null)}
                    onChangeIssue={(updated) => {
                        console.log("Update Issue:", updated);
                        // 목록 새로고침이 필요하면 여기서 처리하거나 IssueListPage에 신호를 줘야 함
                        // 지금은 일단 UI 업데이트만 반영 (선택 사항)
                        setSelectedIssue(updated);
                    }}
                />
            )}
        </div>
    );
}
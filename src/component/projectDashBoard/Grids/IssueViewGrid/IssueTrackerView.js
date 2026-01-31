// IssueTrackerView.js
import React, { useState } from "react";
import IssueListPage from "./IssueGrid/IssueList/IssueListPage";
import IssueDetailModal from "./IssueGrid/IssueDetailModal/IssueDetailModal";
import TabMenu from "../../../TabMenu/TabMenu"; // TabMenu 컴포넌트 경로에 맞춰 임포트

export default function IssueTrackerView({project}) {
    // 1. 기존 view ("GRID" | "LIST") 상태 제거
    // 2. 탭 메뉴를 위한 상태 관리 (기본값: ALL 또는 UNASSIGNED)
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedIssue, setSelectedIssue] = useState(null);

    console.log("이슈트랙뷰야!");
    console.log(project);

    // 탭 구성을 위한 데이터
    const issueTabs = [
        // { key: "ALL", label: "전체 이슈" },
        { key: "UNASSIGNED", label: "미배정 이슈" },
        { key: "IN_PROGRESS", label: "처리중인 이슈" },
        { key: "DONE", label: "완료된 이슈" },
    ];

    const openDetail = (issue) => setSelectedIssue(issue);
    const closeDetail = () => setSelectedIssue(null);

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
            <IssueListPage
                initialStatus={selectedStatus}
                onOpenDetail={openDetail}
                // onBack은 그리드가 없어졌으므로 더 이상 필요하지 않음
            />

            <IssueDetailModal
                open={!!selectedIssue}
                issue={selectedIssue}
                onClose={closeDetail}
                onChangeIssue={(next) => setSelectedIssue(next)}
            />
        </div>
    );
}
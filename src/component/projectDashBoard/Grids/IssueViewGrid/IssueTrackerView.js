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
    const [refreshKey, setRefreshKey] = useState(0); // 새로고침용 키
    const projectId = project?.projectId || project?.id;

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
                refreshKey={refreshKey} // 값이 변하면 리스트 재조회
                onOpenDetail={(issue) => setSelectedIssue(issue)}
            />

            {selectedIssue && (
                <IssueDetailModal
                    open={!!selectedIssue}
                    issue={selectedIssue}
                    projectId={projectId}
                    onClose={() => setSelectedIssue(null)}
                    onChangeIssue={(updated) => {
                        console.log("Update Issue:", updated);
                        // 1. 모달 내부 데이터 최신화 (UI 즉시 반영)
                        setSelectedIssue(updated);

                        // 2. 리스트 페이지 새로고침 트리거
                        setRefreshKey(prev => prev + 1);
                        //role={myRole}
                    }}
                    onDeleteSuccess={() => {
                        console.log("이슈 삭제 완료 -> 리스트 갱신");
                        setSelectedIssue(null);       // 1. 모달 닫기 (선택 해제)
                        setRefreshKey(prev => prev + 1); // 2. 리스트 새로고침
                    }}
                />
            )}
        </div>
    );
}
// IssueTrackerView.js
import React, { useState } from "react";
import IssueGrid from "./IssueGrid/IssueGrid";
import IssueListPage from "./IssueGrid/IssueList/IssueListPage";
import IssueDetailModal from "./IssueGrid/IssueDetailModal/IssueDetailModal";

export default function IssueTrackerView() {
    const [view, setView] = useState("GRID"); // "GRID" | "LIST"
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    // 상세 모달용 상태
    const [selectedIssue, setSelectedIssue] = useState(null);

    const openList = (status) => {
        setSelectedStatus(status);
        setView("LIST");
    };

    const backToGrid = () => {
        setView("GRID");
    };

    const openDetail = (issue) => setSelectedIssue(issue);
    const closeDetail = () => setSelectedIssue(null);

    return (
        <>
            {view === "GRID" && <IssueGrid onOpenList={openList} />}
            {view === "LIST" && (
                <IssueListPage
                    initialStatus={selectedStatus}
                    onBack={backToGrid}
                    onOpenDetail={openDetail}
                />
            )}
            <IssueDetailModal
                open={!!selectedIssue}
                issue={selectedIssue}
                onClose={closeDetail}
                onChangeIssue={(next) => setSelectedIssue(next)} // 일단 UI만 갱신 (더미 기준)
            />
        </>
    );
}

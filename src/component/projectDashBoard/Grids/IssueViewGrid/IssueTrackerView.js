// IssueTrackerView.js
import React, { useState } from "react";
import IssueGrid from "./IssueGrid/IssueGrid";
import IssueListPage from "./IssueGrid/IssueList/IssueListPage";

export default function IssueTrackerView() {
    const [view, setView] = useState("GRID"); // "GRID" | "LIST"
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    const openList = (status) => {
        setSelectedStatus(status);
        setView("LIST");
    };

    const backToGrid = () => {
        setView("GRID");
    };

    return (
        <>
            {view === "GRID" && <IssueGrid onOpenList={openList} />}
            {view === "LIST" && (
                <IssueListPage
                    initialStatus={selectedStatus}
                    onBack={backToGrid}
                />
            )}
        </>
    );
}

// IssueGrid.js
import React, { useState } from "react";
import { IssueDummy } from "./IssueDummy";
import IssueColumn from "./IssueColumn/IssueColumn";
import IssueCreateModal from "./IssueCreate/IssueCreateModal";
import "./IssueGrid.css";

export default function IssueGrid({ onOpenList }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleClickIssue = (issue) => {
        console.log("카드 클릭:", issue);
    };

    return (
        <section className="issue-grid-wrap">
            <div className="issue-columns">
                <IssueColumn
                    title="미배정 이슈"
                    items={IssueDummy.unassigned}
                    onItemClick={handleClickIssue}
                    onColumnClick={() => onOpenList?.("UNASSIGNED")}
                />
                <IssueColumn
                    title="처리중인 이슈"
                    items={IssueDummy.inProgress}
                    onItemClick={handleClickIssue}
                    onColumnClick={() => onOpenList?.("IN_PROGRESS")}
                />
                <IssueColumn
                    title="완료된 이슈"
                    items={IssueDummy.done}
                    onItemClick={handleClickIssue}
                    onColumnClick={() => onOpenList?.("DONE")}
                />
            </div>

            <button className="issue-fab" onClick={() => setIsCreateOpen(true)}>
                +
            </button>

            <IssueCreateModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </section>
    );
}


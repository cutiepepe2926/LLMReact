import React, {useState} from "react";
import IssueColumn from "./IssueColumn/IssueColumn";
import { IssueDummy } from "./IssueDummy";
import IssueCreateModal from "./IssueCreate/IssueCreateModal";
import "./IssueGrid.css";

export default function IssueGrid() {

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleCreateIssue = () => setIsCreateOpen(true);

    const handleClickIssue = (issue) => {
        console.log("이슈 클릭:", issue);
        // TODO: 상세 페이지 라우팅으로 교체
    };

    return (
        <section className="issue-grid-wrap">
            <div className="issue-columns">
                <IssueColumn
                    title="미배정 이슈"
                    items={IssueDummy.unassigned}
                    onItemClick={handleClickIssue}
                />
                <IssueColumn
                    title="처리중인 이슈"
                    items={IssueDummy.inProgress}
                    onItemClick={handleClickIssue}
                />
                <IssueColumn
                    title="완료된 이슈"
                    items={IssueDummy.done}
                    onItemClick={handleClickIssue}
                />
            </div>

            <button
                type="button"
                className="issue-fab"
                onClick={handleCreateIssue}
                aria-label="이슈 추가"
            >
                +
            </button>

            <IssueCreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </section>
    );
}

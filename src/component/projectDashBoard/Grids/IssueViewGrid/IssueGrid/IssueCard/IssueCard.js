// IssueCard.js
import React from "react";
import "../IssueGrid.css";

export default function IssueCard({ item, onClick }) {
    return (
        <div
            className="issue-card"
            role="button"
            tabIndex={0}
            onClick={(e) => {
                onClick?.(item);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.stopPropagation();
                    onClick?.(item);
                }
            }}
        >
            <div className="issue-card-top">
                <span className="issue-id">#{item.id}</span>
                <span className="issue-title">{item.title}</span>
            </div>

            <div className="issue-card-bottom">
        <span className="issue-assignee">
          담당자 : {item.assignee ? item.assignee : "없음"}
        </span>
                <span className="issue-updated">{item.updatedAgo}</span>
            </div>
        </div>
    );
}

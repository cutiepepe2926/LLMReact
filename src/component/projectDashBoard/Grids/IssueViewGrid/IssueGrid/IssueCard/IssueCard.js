// IssueCard.js
import React from "react";
import "../IssueGrid.css";

export default function IssueCard({ item, onClick }) {

    const getAssigneeText = (assignees) => {
        if (!assignees || assignees.length === 0) {
            return "없음";
        }

        // 이름만 추출
        const names = assignees.map(a => a.userName);

        if (names.length === 1) {
            return names[0];
        } else if (names.length === 2) {
            return `${names[0]}, ${names[1]}`;
        } else {
            // 3명 이상일 때: "홍길동, 김철수 외 2명"
            return `${names[0]}, ${names[1]} 외 ${names.length - 2}명`;
        }
    };

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
                <span className="issue-title">{item.title}</span>
            </div>

            <div className="issue-card-bottom">
        <span className="issue-assignee">
          담당자 : {getAssigneeText(item.assignees)}
        </span>
                <span className="issue-updated">{item.updatedAgo}</span>
            </div>
        </div>
    );
}

import React from "react";
import IssueCard from "../IssueCard/IssueCard";

export default function IssueColumn({ title, items, onItemClick }) {
    return (
        <div className="issue-col">
            <h3 className="issue-col-title">{title}</h3>
            <div className="issue-col-body">
                {items.map((it) => (
                    <IssueCard key={it.id} item={it} onClick={() => onItemClick?.(it)} />
                ))}
            </div>
        </div>
    );
}

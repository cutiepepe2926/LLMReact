import React from "react";
import IssueCard from "../IssueCard/IssueCard";
import "../IssueGrid.css";

export default function IssueColumn({ title, items, onItemClick, onColumnClick }) {
    return (
        <div className="issue-col" onClick={() => onColumnClick?.()}>
            <div className="issue-col-head">
                <h3 className="issue-col-title">{title}</h3>
            </div>

            <div className="issue-col-body">
                {items.map((it) => (
                    <IssueCard key={it.id} item={it} onClick={() => onItemClick?.(it)} />
                ))}
            </div>
        </div>
    );
}
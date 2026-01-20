// list/IssueListPage.js
import React, {useEffect, useMemo, useState} from "react";
import { IssueDummy } from "../IssueDummy";
import IssueCard from "../IssueCard/IssueCard";
import IssueFilterBar from "./IssueFilterBar";
import "./IssueListPage.css";

const ALL = "ALL";

export default function IssueListPage({ initialStatus = ALL, onBack }) {
    const [filters, setFilters] = useState({
        status: initialStatus,
        assignee: ALL,
        priority: ALL,
        sort: "LATEST",
        startDate: "",
        endDate: "",
    });

    // ✅ 컬럼 클릭으로 들어올 때 status를 반영
    useEffect(() => {
        setFilters((prev) => ({ ...prev, status: initialStatus }));
    }, [initialStatus]);

    const allIssues = useMemo(() => {
        return [
            ...IssueDummy.unassigned.map((x) => ({ ...x, status: "UNASSIGNED" })),
            ...IssueDummy.inProgress.map((x) => ({ ...x, status: "IN_PROGRESS" })),
            ...IssueDummy.done.map((x) => ({ ...x, status: "DONE" })),
        ].map((it) => ({
            ...it,
            createdAt: it.createdAt || Date.now() - it.id * 1000 * 60 * 10,
            priority: it.priority || "P2",
        }));
    }, []);

    const filtered = useMemo(() => {
        let arr = [...allIssues];

        if (filters.status !== ALL) arr = arr.filter((x) => x.status === filters.status);
        if (filters.assignee !== ALL) arr = arr.filter((x) => (x.assignee || "") === filters.assignee);
        if (filters.priority !== ALL) arr = arr.filter((x) => x.priority === filters.priority);

        arr.sort((a, b) => (filters.sort === "LATEST" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
        return arr;
    }, [allIssues, filters]);

    return (
        <div className="issue-list-page">
            <div className="issue-list-panel">
                {/* ✅ 여기서 "뒤로" */}
                <div className="issue-list-top">
                    <button className="issue-back-btn" onClick={onBack}>←</button>
                    <div className="issue-list-title">이슈 목록</div>
                </div>

                <IssueFilterBar filters={filters} onChange={setFilters} />

                <div className="issue-list-grid">
                    {filtered.map((it) => (
                        <IssueCard key={`${it.status}-${it.id}`} item={it} onClick={() => console.log(it)} />
                    ))}
                </div>
            </div>
        </div>
    );
}

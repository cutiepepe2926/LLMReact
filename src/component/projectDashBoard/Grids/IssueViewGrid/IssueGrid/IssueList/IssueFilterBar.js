import React, { useMemo, useState } from "react";
import SelectModal from "./IssueListModal/SelectModal";
import DateRangeModal from "./IssueListModal/DateRangeModal"; // 너가 만든 달력 모달 경로
import "./IssueFilterBar.css";

const ALL = "ALL";

export default function IssueFilterBar({ filters, onChange }) {
    const [openKey, setOpenKey] = useState(null); // 이것만 사용

    const statusOptions = useMemo(() => [
        { label: "전체", value: ALL },
        { label: "미배정 이슈", value: "UNASSIGNED" },
        { label: "처리중인 이슈", value: "IN_PROGRESS" },
        { label: "완료된 이슈", value: "DONE" },
    ], []);

    const priorityOptions = useMemo(() => ([
        { label: "전체", value: ALL },
        ...["P0","P1","P2","P3","P4","P5"].map(p => ({ label: p, value: p }))
    ]), []);

    const sortOptions = useMemo(() => ([
        { label: "최신순", value: "LATEST" },
        { label: "오래된순", value: "OLDEST" },
    ]), []);

    const assigneeOptions = useMemo(() => ([
        { label: "전체", value: ALL },
        { label: "user", value: "user" },
        { label: "User", value: "User" },
    ]), []);

    return (
        <>
            <div className="issue-filter-bar">
                <button className="filter-pill" onClick={() => setOpenKey("status")}>
                    상태 : {filters.status} ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("assignee")}>
                    담당자 : {filters.assignee} ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("date")}>
                    기간 ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("priority")}>
                    우선도 : {filters.priority} ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("sort")}>
                    정렬 : {filters.sort} ▼
                </button>
            </div>

            {/* ✅ open은 반드시 boolean */}
            <SelectModal
                open={openKey === "priority"}
                title="우선도 선택"
                options={priorityOptions}
                value={filters.priority}
                onClose={() => setOpenKey(null)}
                onChange={(v) => {
                    onChange({ ...filters, priority: v });
                    setOpenKey(null);
                }}
            />

            <SelectModal
                open={openKey === "sort"}
                title="정렬"
                options={sortOptions}
                value={filters.sort}
                onClose={() => setOpenKey(null)}
                onChange={(v) => {
                    onChange({ ...filters, sort: v });
                    setOpenKey(null);
                }}
            />

            <SelectModal
                open={openKey === "status"}
                title="상태 선택"
                options={statusOptions}
                value={filters.status}
                onClose={() => setOpenKey(null)}
                onChange={(v) => {
                    onChange({ ...filters, status: v });
                    setOpenKey(null);
                }}
            />

            <SelectModal
                open={openKey === "assignee"}
                title="담당자 선택"
                options={assigneeOptions}
                value={filters.assignee}
                onClose={() => setOpenKey(null)}
                onChange={(v) => {
                    onChange({ ...filters, assignee: v });
                    setOpenKey(null);
                }}
            />

            <DateRangeModal
                open={openKey === "date"}
                onClose={() => setOpenKey(null)}
                onApply={({ startDate, endDate }) => {
                    onChange({ ...filters, startDate, endDate });
                    setOpenKey(null);
                }}
            />
        </>
    );
}

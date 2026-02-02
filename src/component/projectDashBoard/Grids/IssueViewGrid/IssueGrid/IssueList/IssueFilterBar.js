import React, { useMemo, useState } from "react";
import SelectModal from "./IssueListModal/SelectModal";
import DateRangeModal from "./IssueListModal/DateRangeModal"; // 너가 만든 달력 모달 경로
import "./IssueFilterBar.css";

const ALL = "ALL";

export default function IssueFilterBar({ filters, onChange, members = [] }) {
    const [openKey, setOpenKey] = useState(null); // 이것만 사용

    const handleClose = () => setOpenKey(null);

    const statusOptions = [
        { value: ALL, label: "모든 상태" },
        { value: "UNASSIGNED", label: "미배정" },
        { value: "IN_PROGRESS", label: "진행중" },
        { value: "DONE", label: "완료" },
    ];

    const assigneeOptions = useMemo(() => {
        // 기본 "전체" 옵션
        const base = [{ value: ALL, label: "모든 담당자" }];

        // 멤버 리스트 매핑 (value: userId, label: name)
        const memberOpts = members.map((m) => ({
            value: m.userId,
            label: m.name, // 혹은 `${m.name} (@${m.userId})` 처럼 상세 표시 가능
        }));

        return [...base, ...memberOpts];
    }, [members]);

    const priorityOptions = [
        { value: ALL, label: "모든 우선순위" },
        { value: "P0", label: "P0" },
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
        { value: "P3", label: "P3" },
        { value: "P4", label: "P4" },
    ];

    const sortOptions = [
        { value: "LATEST", label: "최신순" },
        { value: "OLDEST", label: "오래된순" },
    ];

    const getLabel = (options, value) =>
        options.find(o => o.value === value)?.label ?? value;


    return (
        <>
            <div className="issue-filter-bar">

                <button className="filter-pill" onClick={() => setOpenKey("ASSIGNEE")}>
                    담당자 : {getLabel(assigneeOptions, filters.assignee)} ▼
                </button>

                <button className={`filter-pill ${filters.createdStart || filters.createdEnd ? 'active' : ''}`}
                        onClick={() => setOpenKey("DATE_CREATED")}>
                    작성일 {filters.createdStart ? 'ON' : ''} ▼
                </button>

                <button className={`filter-pill ${filters.dueStart || filters.dueEnd ? 'active' : ''}`}
                        onClick={() => setOpenKey("DATE_DUE")}>
                    마감일 {filters.dueStart ? 'ON' : ''} ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("priority")}>
                    우선도 : {getLabel(priorityOptions, filters.priority)} ▼
                </button>

                <button className="filter-pill" onClick={() => setOpenKey("sort")}>
                    정렬 : {getLabel(sortOptions, filters.sort)} ▼
                </button>
            </div>

            {/* open은 반드시 boolean */}
            <SelectModal
                open={openKey === "ASSIGNEE"}
                title="담당자 선택"
                options={assigneeOptions}
                value={filters.assignee}
                onClose={handleClose}
                onChange={(v) => {
                    onChange({ ...filters, assignee: v });
                    handleClose();
                }}
            />

            <DateRangeModal
                open={openKey === "DATE_CREATED"}
                title="작성일 기간 설정"
                startDate={filters.createdStart}
                endDate={filters.createdEnd}
                onClose={handleClose}
                onClear={() => {
                    onChange({ ...filters, createdStart: "", createdEnd: "" });
                    handleClose();
                }}
                onApply={({ startDate, endDate }) => {
                    onChange({ ...filters, createdStart: startDate, createdEnd: endDate });
                    handleClose();
                }}
            />

            <DateRangeModal
                open={openKey === "DATE_DUE"}
                title="마감일 기간 설정"
                startDate={filters.dueStart}
                endDate={filters.dueEnd}
                onClose={handleClose}
                onClear={() => {
                    onChange({ ...filters, dueStart: "", dueEnd: "" });
                    handleClose();
                }}
                onApply={({ startDate, endDate }) => {
                    onChange({ ...filters, dueStart: startDate, dueEnd: endDate });
                    handleClose();
                }}
            />

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

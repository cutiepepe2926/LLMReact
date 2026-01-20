import React, { useMemo, useState } from "react";
import "./IssueCreateModal.css";
import SelectModal from "./SelectModal";

function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function IssueCreateModal({ open, onClose }) {
    const [title, setTitle] = useState("");
    const [startDate] = useState(todayStr()); // ✅ 시작일 고정(수정 불가)
    const [endDate, setEndDate] = useState(todayStr());
    const [description, setDescription] = useState("");

    const [status, setStatus] = useState("UNASSIGNED");
    const [priority, setPriority] = useState("P0");

    const [assigneeInput, setAssigneeInput] = useState("");

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [priorityModalOpen, setPriorityModalOpen] = useState(false);

    const statusOptions = useMemo(
        () => [
            { value: "UNASSIGNED", label: "미배정 이슈" },
            { value: "IN_PROGRESS", label: "처리중인 이슈" },
            { value: "DONE", label: "완료된 이슈" },
        ],
        []
    );

    const priorityOptions = useMemo(
        () =>
            ["P0", "P1", "P2", "P3", "P4", "P5"].map((p) => ({
                value: p,
                label: p,
            })),
        []
    );

    const statusLabel =
        statusOptions.find((o) => o.value === status)?.label ?? status;
    const priorityLabel =
        priorityOptions.find((o) => o.value === priority)?.label ?? priority;

    if (!open) return null;

    const handleOverlay = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = () => {
        // TODO: API 연동 전이라 콘솔만
        console.log("이슈 생성", {
            title,
            startDate,
            endDate,
            description,
            status,
            priority,
            assigneeInput,
        });
        onClose();
    };

    return (
        <>
            <div className="issue-create-overlay" onMouseDown={handleOverlay}>
                <div className="issue-create-modal">
                    <h2 className="issue-create-title">이슈 생성</h2>

                    {/* 1행: 이슈명 / 마감기간 */}
                    <div className="issue-create-row two-col">
                        <div className="field">
                            <label className="field-label">이슈 명</label>
                            <input
                                className="field-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="이슈 명을 입력하세요."
                            />
                        </div>

                        <div className="field">
                            <label className="field-label">마감 기간</label>

                            <div className="date-range">
                                <input className="field-input" value={startDate} disabled />
                                <span className="date-dash">~</span>
                                <input
                                    className="field-input"
                                    type="date"
                                    value={endDate}
                                    min={startDate} // ✅ 오늘 이전 선택 불가
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2행: 설명 */}
                    <div className="issue-create-row">
                        <div className="field">
                            <label className="field-label">프로젝트 설명</label>
                            <textarea
                                className="field-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="이슈 설명을 작성하세요."
                            />
                        </div>
                    </div>

                    {/* 3행: 커밋 / 상태 / 우선도 */}
                    <div className="issue-create-row three-col">
                        <div className="field">
                            <label className="field-label">커밋 연결하기</label>
                            <div className="inline">
                                <input
                                    className="field-input"
                                    placeholder="커밋을 지정해주세요."
                                    disabled
                                />
                                <button type="button" className="btn gray" disabled>
                                    커밋 연결
                                </button>
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label">상태 설정</label>
                            <button
                                type="button"
                                className="btn select"
                                onClick={() => setStatusModalOpen(true)}
                            >
                                {statusLabel} ▼
                            </button>
                        </div>

                        <div className="field">
                            <label className="field-label">우선도 설정</label>
                            <button
                                type="button"
                                className="btn select"
                                onClick={() => setPriorityModalOpen(true)}
                            >
                                {priorityLabel} ▼
                            </button>
                        </div>
                    </div>

                    {/* 4행: 담당자 */}
                    <div className="issue-create-row">
                        <div className="field">
                            <label className="field-label">담당자 할당</label>
                            <div className="inline">
                                <input
                                    className="field-input"
                                    value={assigneeInput}
                                    onChange={(e) => setAssigneeInput(e.target.value)}
                                    placeholder="담당자 입력(임시)"
                                />
                                <button type="button" className="btn gray">
                                    추가
                                </button>
                            </div>
                            {/* abc123, user1 칩은 지금은 무시 */}
                        </div>
                    </div>

                    {/* 하단 버튼: 같은 줄 */}
                    <div className="issue-create-actions">
                        <button type="button" className="btn primary" onClick={handleSubmit}>
                            생성하기
                        </button>
                        <button type="button" className="btn danger" onClick={onClose}>
                            취소하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 상태 선택 모달 */}
            {statusModalOpen && (
                <SelectModal
                    title="상태 설정"
                    options={statusOptions}
                    value={status}
                    onChange={(v) => {
                        setStatus(v);
                        setStatusModalOpen(false);
                    }}
                    onClose={() => setStatusModalOpen(false)}
                />
            )}

            {/* 우선도 선택 모달 */}
            {priorityModalOpen && (
                <SelectModal
                    title="우선도 설정"
                    options={priorityOptions}
                    value={priority}
                    onChange={(v) => {
                        setPriority(v);
                        setPriorityModalOpen(false);
                    }}
                    onClose={() => setPriorityModalOpen(false)}
                />
            )}
        </>
    );
}

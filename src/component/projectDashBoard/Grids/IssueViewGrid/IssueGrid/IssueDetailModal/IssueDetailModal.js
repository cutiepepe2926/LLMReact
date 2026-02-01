// IssueDetailModal.js
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../../../../utils/api"; // api 유틸 경로 확인 필요
import SelectModal from "../IssueList/IssueListModal/SelectModal";
import DateRangeModal from "../IssueList/IssueListModal/DateRangeModal";
import CommitLinkModal from "./CommitLinkModal/CommitLinkModal";
import IssueChatModal from "./IssueChatModal/IssueChatModal";
import "./IssueDetailModal.css";

const ALL = "ALL";

const getLabel = (options, value) =>
    options.find((o) => o.value === value)?.label ?? value ?? "-";

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split('T')[0];
};

export default function IssueDetailModal({ open, issue: initialIssue, projectId, onClose, onChangeIssue }) {
    const [detail, setDetail] = useState(null); // 상세 데이터 상태
    const [openKey, setOpenKey] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // 모달 열릴 때 최신 데이터 조회
    useEffect(() => {
        if (open && initialIssue?.id && projectId) {
            // 1. 사용자 ID 가져오기 (권한 체크용)
            const storedId = localStorage.getItem("userId");
            setCurrentUserId(storedId);

            // 2. 최신 이슈 상세 조회 API 호출
            api.get(`/api/projects/${projectId}/issues/${initialIssue.id}`)
                .then((response) => {
                    // 백엔드 응답을 상태에 저장
                    setDetail(response);
                })
                .catch((err) => {
                    console.error("이슈 상세 조회 실패:", err);
                    // 실패 시 목록에서 넘겨받은 초기 데이터라도 보여줌
                    setDetail(initialIssue);
                });
        }
    }, [open, initialIssue, projectId]);


    // 수정 핸들러 (TODO)
    const handleUpdate = () => {
        console.log("TODO: 이슈 수정 요청 API 호출", detail);
        // api.patch(...)
        alert("수정 기능은 추후 구현 예정입니다.");
    };

    // 삭제 핸들러 (TODO)
    const handleDelete = () => {
        console.log("TODO: 이슈 삭제 요청 API 호출", detail.issueId);
        // api.delete(...)
        alert("삭제 기능은 추후 구현 예정입니다.");
        onClose();
    };

    // 담당자 추가 핸들러 (TODO)
    const handleAddAssignee = () => {
        console.log("TODO: 담당자 추가 모달 오픈");
    };


    const statusOptions = useMemo(
        () => [
            { label: "전체", value: ALL },
            { label: "미배정", value: "UNASSIGNED" },
            { label: "진행중", value: "IN_PROGRESS" },
            { label: "완료", value: "DONE" },
        ],
        []
    );

    const priorityOptions = useMemo(
        () => [
            { label: "전체", value: ALL },
            ...["P0", "P1", "P2", "P3", "P4", "P5"].map((p) => ({ label: p, value: 0 + parseInt(p.replace("P","")) })), // value 타입 주의
        ],
        []
    );

    if (!open || !detail) return null;

    // 권한 체크: 작성자 본인 확인 (ADMIN/OWNER 체크는 추후 role 정보를 가져와서 추가 필요)
    const isWriter = currentUserId && detail.createdBy === currentUserId;
    // const canEdit = isWriter || role === 'OWNER'; // 추후 확장
    const canEdit = isWriter;

    return (
        <div
            className="issue-detail-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="issue-detail-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="issue-detail-header">
                    <div className="issue-detail-title-row">
                        <span className="issue-detail-id">#{detail.issueId || detail.id}</span>
                        <span className="issue-detail-title">{detail.title}</span>
                    </div>

                    <button className="issue-detail-x" type="button" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* 상단 메타 영역 */}
                <div className="issue-detail-meta">
                    {/* 첫 번째 줄: 상태, 작성자 */}
                    <div className="meta-line">
                        <span className="meta-item">
                            상태 :
                            <button
                                type="button"
                                className="meta-select"
                                onClick={() => setOpenKey("status")}
                            >
                                [{getLabel(statusOptions, detail.status)}▼]
                            </button>
                        </span>

                        {/* 작성자 정보 표시 (이름 + ID) */}
                        <span className="meta-item">
                            작성자 : <b>{detail.creatorName ? `${detail.creatorName}` : detail.createdBy}</b>
                        </span>
                    </div>

                    {/* 두 번째 줄: 담당자 목록 (칩 형태) */}
                    <div className="meta-line" style={{ alignItems: "center" }}>
                        <span className="meta-item" style={{ marginRight: "8px" }}>담당자 : </span>

                        <div className="assignee-list">
                            {detail.assignees && detail.assignees.length > 0 ? (
                                detail.assignees.map((assignee) => (
                                    <span key={assignee.userId} className="assignee-chip">
                                        {assignee.userName}
                                    </span>
                                ))
                            ) : (
                                <span className="no-assignee">없음</span>
                            )}

                            {/* 담당자 추가 버튼 */}
                            <button className="add-assignee-btn" onClick={handleAddAssignee}>
                                +
                            </button>
                        </div>
                    </div>

                    {/* 세 번째 줄: 날짜, 우선순위 */}
                    <div className="meta-line">
                        <span className="meta-item">
                            생성일 : <b>{formatDate(detail.createdAt)}</b>
                        </span>

                        <span className="meta-item">
                            마감일 :
                            <button
                                type="button"
                                className="meta-select"
                                onClick={() => setOpenKey("dueDate")}
                            >
                                [{formatDate(detail.dueDate) || "-"}▼]
                            </button>
                        </span>

                        <span className="meta-item">
                            우선도 :
                            <button
                                type="button"
                                className="meta-select"
                                onClick={() => setOpenKey("priority")}
                            >
                                [P{detail.priority}▼]
                            </button>
                        </span>
                    </div>

                    {/* 네 번째 줄: 커밋, 채팅 버튼 (더미) */}
                    <div className="meta-line meta-actions">
                         <span className="meta-item">
                            관련 커밋 : <b>{detail.commitSummary ?? "-"}</b>
                        </span>

                        <button
                            type="button"
                            className="btn-green"
                            onClick={() => setOpenKey("commit")}
                        >
                            커밋 연결하기
                        </button>

                        <button type="button" className="btn-green" onClick={() => setOpenKey("chat")}>
                            채팅
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="issue-detail-section">
                    <div className="section-title">설명(Description)</div>
                    <textarea
                        className="desc-box"
                        value={detail.description ?? ""}
                        placeholder="설명..."
                        onChange={(e) =>
                            setDetail({ ...detail, description: e.target.value })
                        }
                    />

                    {/* 수정/삭제 버튼 영역 (권한 있을 때만 표시) */}
                    {canEdit && (
                        <div className="issue-edit-actions">
                            <button className="btn-save" onClick={handleUpdate}>
                                수정
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* --- 모달 컴포넌트들 --- */}

                {/* 상태 변경 */}
                <SelectModal
                    open={openKey === "status"}
                    title="상태 선택"
                    options={statusOptions}
                    value={detail.status}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => {
                        // TODO: 즉시 API 호출 필요
                        onChangeIssue?.({ ...detail, status: v });
                        setDetail({...detail, status: v});
                        setOpenKey(null);
                    }}
                />

                {/* 우선순위 변경 */}
                <SelectModal
                    open={openKey === "priority"}
                    title="우선도 선택"
                    options={priorityOptions}
                    value={detail.priority} // P0 등이 아니라 숫자일 수 있음
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => {
                        // TODO: 즉시 API 호출 필요
                        onChangeIssue?.({ ...detail, priority: v });
                        setDetail({...detail, priority: v});
                        setOpenKey(null);
                    }}
                />

                {/* 마감일 변경 */}
                <DateRangeModal
                    open={openKey === "dueDate"}
                    onClose={() => setOpenKey(null)}
                    onApply={({ endDate }) => {
                        // TODO: 즉시 API 호출 필요
                        onChangeIssue?.({ ...detail, dueDate: endDate });
                        setDetail({...detail, dueDate: endDate});
                        setOpenKey(null);
                    }}
                />

                {/* 커밋 (더미) */}
                <CommitLinkModal
                    open={openKey === "commit"}
                    onClose={() => setOpenKey(null)}
                    issue={detail}
                />

                {/* 채팅 (더미) */}
                <IssueChatModal
                    open={openKey === "chat"}
                    onClose={() => setOpenKey(null)}
                    issue={detail}
                />

            </div>
        </div>
    );
}
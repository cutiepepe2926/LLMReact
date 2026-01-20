// IssueDetailModal.js
import React, { useMemo, useState } from "react";
import SelectModal from "../IssueList/IssueListModal/SelectModal";
import DateRangeModal from "../IssueList/IssueListModal/DateRangeModal";
import CommitLinkModal from "./CommitLinkModal/CommitLinkModal";
import IssueChatModal from "./IssueChatModal/IssueChatModal";
import "./IssueDetailModal.css";

const ALL = "ALL";

const getLabel = (options, value) =>
    options.find((o) => o.value === value)?.label ?? value ?? "-";

export default function IssueDetailModal({ open, issue, onClose, onChangeIssue }) {
    const [openKey, setOpenKey] = useState(null);

    const statusOptions = useMemo(
        () => [
            { label: "전체", value: ALL },
            { label: "미배정 이슈", value: "UNASSIGNED" },
            { label: "처리중인 이슈", value: "IN_PROGRESS" },
            { label: "완료된 이슈", value: "DONE" },
        ],
        []
    );

    const priorityOptions = useMemo(
        () => [
            { label: "전체", value: ALL },
            ...["P0", "P1", "P2", "P3", "P4", "P5"].map((p) => ({ label: p, value: p })),
        ],
        []
    );

    const assigneeOptions = useMemo(
        () => [
            { label: "전체", value: ALL },
            { label: "me", value: "me" },
            { label: "User", value: "User" },
        ],
        []
    );

    if (!open || !issue) return null;

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
                        <span className="issue-detail-id">#{issue.id}</span>
                        <span className="issue-detail-title">{issue.title}</span>
                    </div>

                    <button className="issue-detail-x" type="button" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* 상단 메타 영역 (그림처럼) */}
                <div className="issue-detail-meta">
                    <div className="meta-line">
            <span className="meta-item">
              상태 :
              <button
                  type="button"
                  className="meta-select"
                  onClick={() => setOpenKey("status")}
              >
                [{getLabel(statusOptions, issue.status)}▼]
              </button>
            </span>

                        <span className="meta-item">
              담당자 :
              <button
                  type="button"
                  className="meta-select"
                  onClick={() => setOpenKey("assignee")}
              >
                [{getLabel(assigneeOptions, issue.assignee)}▼]
              </button>
            </span>
                    </div>

                    <div className="meta-line">
            <span className="meta-item">
              생성일 : <b>{issue.createdAt ?? "-"}</b>
            </span>

                        <span className="meta-item">
              마감일 :
              <button
                  type="button"
                  className="meta-select"
                  onClick={() => setOpenKey("dueDate")}
              >
                [{issue.dueDate ?? "-"}▼]
              </button>
            </span>

                        <span className="meta-item">
              우선도 :
              <button
                  type="button"
                  className="meta-select"
                  onClick={() => setOpenKey("priority")}
              >
                [{getLabel(priorityOptions, issue.priority)}▼]
              </button>
            </span>
                    </div>

                    <div className="meta-line meta-actions">
            <span className="meta-item">
              관련 커밋 :{" "}
                <b>{issue.commitSummary ?? "-"}</b>
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
                        value={issue.description ?? ""}
                        placeholder="설명..."
                        onChange={(e) =>
                            onChangeIssue?.({ ...issue, description: e.target.value })
                        }
                    />
                </div>

                {/* 모달들 */}
                <SelectModal
                    open={openKey === "status"}
                    title="상태 선택"
                    options={statusOptions}
                    value={issue.status}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => {
                        onChangeIssue?.({ ...issue, status: v });
                        setOpenKey(null);
                    }}
                />

                <SelectModal
                    open={openKey === "assignee"}
                    title="담당자 선택"
                    options={assigneeOptions}
                    value={issue.assignee}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => {
                        onChangeIssue?.({ ...issue, assignee: v });
                        setOpenKey(null);
                    }}
                />

                <SelectModal
                    open={openKey === "priority"}
                    title="우선도 선택"
                    options={priorityOptions}
                    value={issue.priority}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => {
                        onChangeIssue?.({ ...issue, priority: v });
                        setOpenKey(null);
                    }}
                />

                <DateRangeModal
                    open={openKey === "dueDate"}
                    onClose={() => setOpenKey(null)}
                    onApply={({ endDate }) => {
                        onChangeIssue?.({ ...issue, dueDate: endDate });
                        setOpenKey(null);
                    }}
                />

                <CommitLinkModal
                    open={openKey === "commit"}
                    onClose={() => setOpenKey(null)}
                    issue={issue}
                />

                <IssueChatModal
                    open={openKey === "chat"}
                    onClose={() => setOpenKey(null)}
                    issue={issue}
                />

            </div>
        </div>
    );
}

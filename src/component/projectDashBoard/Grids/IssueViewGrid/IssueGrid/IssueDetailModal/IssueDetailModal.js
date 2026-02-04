// IssueDetailModal.js
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../../../../utils/api"; // api 유틸 경로 확인 필요
import SelectModal from "../IssueList/IssueListModal/SelectModal";
import DateRangeModal from "../IssueList/IssueListModal/DateRangeModal";
import IssueChatModal from "./IssueChatModal/IssueChatModal";
import CommitSelectModal from "../IssueCreate/CommitSelectModal";
import "./IssueDetailModal.css";

const ALL = "ALL";

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split('T')[0];
};

const getDisplayStatus = (status, options) => {
    if (status === "UNASSIGNED" || status === "IN_PROGRESS") return "진행중";
    if (status === "DONE") return "완료";
    return options.find(o => o.value === status)?.label || "진행중";
};

export default function IssueDetailModal({ open, issue: initialIssue, projectId, onClose, onChangeIssue, onDeleteSuccess, role }) {
    const [detail, setDetail] = useState(null); // 상세 데이터 상태
    const [editData, setEditData] = useState(null);
    const [openKey, setOpenKey] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [assigneeOptions, setAssigneeOptions] = useState([]);

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
                    setEditData({
                        title: response.title,
                        description: response.description,
                        status: response.status,
                        priority: response.priority,
                        dueDate: response.dueDate,
                        linkedCommitSha: response.linkedCommitSha,
                        linkedCommitMessage: response.linkedCommitMessage,
                        linkedCommitUrl: response.linkedCommitUrl
                    });
                })
                .catch((err) => {
                    console.error("이슈 상세 조회 실패:", err);
                    // 실패 시 목록에서 넘겨받은 초기 데이터라도 보여줌
                    setDetail(initialIssue);
                    setEditData({...initialIssue,
                        linkedCommitSha: initialIssue.linkedCommitSha || null,
                        linkedCommitMessage: initialIssue.linkedCommitMessage || null,
                        linkedCommitUrl: initialIssue.linkedCommitUrl || null});
                });
        }
    }, [open, initialIssue, projectId]);

    // 권한 체크 로직
    // OWNER, ADMIN, 또는 작성자 본인만 수정 권한 가짐
    const isAuthorized = useMemo(() => {
        if (!detail || !currentUserId) return false;
        // role은 부모로부터 전달받거나, 여기서 api로 조회해야 함 (여기선 props로 가정)
        // role이 없다면 작성자 여부만 체크
        const isWriter = detail.createdBy === currentUserId;
        const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN';
        return isWriter || isAdminOrOwner;
    }, [detail, currentUserId, role]);


    // 담당자 후보 목록 조회 (Add 버튼 클릭 시 호출)
    const fetchAssigneeCandidates = async () => {
        try {
            // "담당자로 지정 가능한 멤버(ACTIVE)" 목록 조회 API 호출
            const response = await api.get(`/api/projects/${projectId}/members/assignees`);

            // 이미 담당자인 사람은 제외하거나 포함할 수 있음 (여기선 UI 편의상 전체 멤버 표시)
            // SelectModal 포맷 {label, value}로 변환
            const options = response.map(member => ({
                label: member.name, // 이름 (필요시 member.userId와 조합)
                value: member.userId
            }));
            setAssigneeOptions(options);
            setOpenKey("addAssignee"); // 데이터 로드 후 모달 오픈
        } catch (err) {
            console.error("멤버 목록 조회 실패:", err);
            alert("멤버 목록을 불러오지 못했습니다.");
        }
    };

    // 담당자 추가 핸들러
    const handleAddAssigneeSubmit = async (targetUserId) => {
        try {
            // 이미 담당자인지 체크
            if (detail.assignees.some(a => a.userId === targetUserId)) {
                alert("이미 담당자로 지정된 멤버입니다.");
                return;
            }

            // API 호출
            await api.post(`/api/projects/${projectId}/issues/${detail.issueId}/assignees`, {
                userId: targetUserId
            });

            // UI 즉시 반영 (UX 향상)
            // 1) 담당자 목록 갱신
            // 선택된 유저의 이름을 options에서 찾음
            const targetUserName = assigneeOptions.find(o => o.value === targetUserId)?.label || targetUserId;
            const newAssignee = { userId: targetUserId, userName: targetUserName };
            const updatedAssignees = [...detail.assignees, newAssignee];

            // 2) 상태 자동 업데이트 로직 (프론트엔드 미러링)
            // 0명 -> 1명이 되면 'IN_PROGRESS'로 간주
            let newStatus = editData.status;
            if (detail.assignees.length === 0 && newStatus === "UNASSIGNED") {
                newStatus = "IN_PROGRESS";
            }

            // 상태 업데이트
            const updatedDetail = { ...detail, assignees: updatedAssignees, status: newStatus };
            setDetail(updatedDetail);
            setEditData({ ...editData, status: newStatus });

            // 부모 리스트 갱신 알림
            onChangeIssue?.(updatedDetail);

            setOpenKey(null); // 모달 닫기
            // alert("담당자가 추가되었습니다."); // 너무 잦은 알림 방지 위해 생략 가능

        } catch (err) {
            console.error("담당자 추가 실패:", err);
            alert("담당자 추가에 실패했습니다.");
        }
    };

    // 담당자 제거 핸들러 ('x' 버튼)
    const handleRemoveAssignee = async (targetUserId) => {
        if (!isAuthorized) return; // 권한 없으면 동작 안 함
        if (!window.confirm("해당 담당자를 제거하시겠습니까?")) return;

        try {
            await api.delete(`/api/projects/${projectId}/issues/${detail.issueId}/assignees/${targetUserId}`);

            // UI 즉시 반영
            const updatedAssignees = detail.assignees.filter(a => a.userId !== targetUserId);

            // 상태 자동 업데이트 로직
            // 남은 담당자가 0명이 되고, 현재 상태가 'IN_PROGRESS'라면 'UNASSIGNED'로 변경
            let newStatus = editData.status;
            if (updatedAssignees.length === 0 && newStatus === "IN_PROGRESS") {
                newStatus = "UNASSIGNED";
            }

            const updatedDetail = { ...detail, assignees: updatedAssignees, status: newStatus };
            setDetail(updatedDetail);
            setEditData({ ...editData, status: newStatus });

            onChangeIssue?.(updatedDetail);

        } catch (err) {
            console.error("담당자 제거 실패:", err);
            alert("담당자 제거에 실패했습니다.");
        }
    };

    // 커밋 선택 완료 핸들러
    const handleCommitSelect = (commit) => {
        // 1. editData(수정 대기 상태)에 커밋 정보 반영
        setEditData((prev) => ({
            ...prev,
            linkedCommitSha: commit.sha,
            linkedCommitMessage: commit.message,
            linkedCommitUrl: commit.htmlUrl
        }));

        // 2. 모달 닫기
        setOpenKey(null);
    };

    // 통합 수정 핸들러 (값을 변경한다고 바로 변경하지 않음)
    const handleUpdate = async () => {
        if (!isAuthorized) {
            alert("수정 권한이 없습니다.");
            return;
        }

        try {
            // 변경된 사항만 전송하거나, 전체 editData 전송
            await api.patch(`/api/projects/${projectId}/issues/${detail.issueId}`, {
                title: editData.title,
                description: editData.description,
                status: editData.status,
                priority: editData.priority,
                dueDate: editData.dueDate,
                linkedCommitSha: editData.linkedCommitSha,
                linkedCommitMessage: editData.linkedCommitMessage,
                linkedCommitUrl: editData.linkedCommitUrl,
            });

            alert("이슈가 수정되었습니다.");

            // 로컬 state 업데이트 및 부모 알림
            const updatedDetail = { ...detail, ...editData };
            setDetail(updatedDetail);
            onChangeIssue?.(updatedDetail); // 목록 갱신용

        } catch (err) {
            console.error("이슈 수정 실패:", err);
            alert("수정에 실패했습니다.");
        }
    };

    // 로컬 상태 변경 핸들러 (UI 반영용)
    const handleLocalChange = (key, value) => {
        setEditData((prev) => ({ ...prev, [key]: value }));
        setOpenKey(null); // 모달 닫기
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (!isAuthorized) return;
        if (!window.confirm("정말로 이 이슈를 삭제하시겠습니까?")) return;

        try {
            await api.delete(`/api/projects/${projectId}/issues/${detail.issueId}`);
            alert("이슈가 삭제되었습니다.");
            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                // 혹시 부모에서 props를 안 넘겼을 경우 대비 (기본 동작)
                onClose();
            }
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제에 실패했습니다.");
        }
    };

    const statusOptions = useMemo(
        () => [
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

    if (!open || !detail || !editData) return null;

    return (
        <div
            className="issue-detail-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="issue-detail-modal" onMouseDown={(e) => e.stopPropagation()}>

                {/* [1] 헤더 영역 */}
                <div className="issue-detail-header">
                    <div className="issue-detail-title-row">
                        {isAuthorized ? (
                            <input
                                type="text"
                                className="issue-detail-title-input"
                                value={editData.title}
                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                                placeholder="이슈 제목을 입력하세요"
                            />
                        ) : (
                            <span className="issue-detail-title">{detail.title}</span>
                        )}
                    </div>
                    <button className="issue-detail-x" type="button" onClick={onClose}>×</button>
                </div>

                {/* [2] 액션 툴바 (새로 추가됨) */}
                <div className="issue-action-bar">
                    <div className="action-left">
                        {/* 작성자 정보 등 간단한 정보는 여기 남겨두거나 메타박스로 이동 */}
                        <span className="writer-badge">
                            Written by <b>{detail.creatorName || detail.createdBy}</b>
                        </span>
                    </div>
                    <div className="action-right">
                        <button
                            type="button"
                            className="btn-action"
                            onClick={() => {
                                if(isAuthorized) setOpenKey("commit");
                                else alert("권한이 없습니다.");
                            }}
                        >
                            <span className="icon">🔗</span> 커밋 연결
                        </button>
                        <button
                            type="button"
                            className="btn-action"
                            onClick={() => setOpenKey("chat")}
                        >
                            <span className="icon">💬</span> 채팅
                        </button>
                    </div>
                </div>

                <div className="issue-content-body">
                    {/* [3] 메타 데이터 영역 (좌우 분할 혹은 상단 배치) */}
                    <div className="issue-detail-meta">
                        {/* 첫 번째 줄: 상태, 날짜 */}
                        <div className="meta-line">
                            <span className="meta-item">
                                상태
                                <button
                                    type="button"
                                    className="meta-select"
                                    onClick={() => isAuthorized ? setOpenKey("status") : alert("권한이 없습니다.")}
                                >
                                    <span className={`status-badge ${editData.status}`}>
                                        {getDisplayStatus(editData.status, statusOptions)}
                                    </span> ▼
                                </button>
                            </span>

                            <span className="meta-divider">|</span>

                            <span className="meta-item">
                                우선순위
                                <button
                                    type="button"
                                    className="meta-select"
                                    onClick={() => isAuthorized ? setOpenKey("priority") : alert("권한이 없습니다.")}
                                >
                                    P{editData.priority} ▼
                                </button>
                            </span>

                            <span className="meta-divider">|</span>

                            <span className="meta-item">
                                마감일 :
                                <button
                                    type="button"
                                    className="meta-select-text"
                                    onClick={() => isAuthorized ? setOpenKey("dueDate") : alert("권한이 없습니다.")}
                                >
                                    {formatDate(detail.dueDate) || "설정 안됨"}
                                </button>
                            </span>
                        </div>

                        {/* 두 번째 줄: 담당자 */}
                        <div className="meta-line assignee-line">
                            <span className="meta-label">담당자</span>
                            <div className="assignee-list">
                                {detail.assignees && detail.assignees.length > 0 ? (
                                    detail.assignees.map((assignee) => (
                                        <span key={assignee.userId} className="assignee-chip">
                                            <span className="avatar-placeholder">{assignee.userName[0]}</span>
                                            {assignee.userName}
                                            {isAuthorized && (
                                                <button
                                                    className="remove-assignee-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveAssignee(assignee.userId);
                                                    }}
                                                >×</button>
                                            )}
                                        </span>
                                    ))
                                ) : (
                                    <span className="no-assignee">담당자 없음</span>
                                )}
                                <button className="add-assignee-btn" onClick={fetchAssigneeCandidates}>+</button>
                            </div>
                        </div>
                    </div>

                    {/* 커밋 섹션: detail 대신 editData를 바라보게 변경 (미리보기 기능) */}
                    {editData.linkedCommitUrl && (
                        <div className="linked-commit-container">
                            <div className="section-label">🔗 Linked Commit</div>
                            <a
                                href={editData.linkedCommitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="commit-link-card"
                            >
                                <div className="commit-icon">
                                    <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                                </div>
                                <div className="commit-info">
                                    <span className="commit-message">{editData.linkedCommitMessage || "No commit message"}</span>
                                    <span className="commit-sha">{editData.linkedCommitSha ? editData.linkedCommitSha.substring(0, 7) : "unknown"}</span>
                                </div>
                                <div className="external-link-icon">↗</div>
                            </a>
                        </div>
                    )}

                    {/* [5] 설명(Description) 영역 */}
                    <div className="issue-detail-section">
                        <div className="section-title">Description</div>
                        <textarea
                            className="desc-box"
                            value={editData.description ?? ""}
                            placeholder="이슈에 대한 상세 설명을 작성하세요."
                            readOnly={!isAuthorized}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        />

                        {/* 저장/삭제 버튼 */}
                        {isAuthorized && (
                            <div className="issue-edit-actions">
                                <button className="btn-delete" onClick={handleDelete}>이슈 삭제</button>
                                <button className="btn-save" onClick={handleUpdate}>변경사항 저장</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 모달 컴포넌트들 (기존과 동일) --- */}
                <SelectModal
                    open={openKey === "status"}
                    title="상태 선택"
                    options={statusOptions}
                    value={editData.status}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => handleLocalChange("status", v)}
                />
                <SelectModal
                    open={openKey === "priority"}
                    title="우선도 선택"
                    options={priorityOptions}
                    value={editData.priority}
                    onClose={() => setOpenKey(null)}
                    onChange={(v) => handleLocalChange("priority", v)}
                />
                <SelectModal
                    open={openKey === "addAssignee"}
                    title="담당자 추가"
                    options={assigneeOptions}
                    value={null}
                    onClose={() => setOpenKey(null)}
                    onChange={(userId) => handleAddAssigneeSubmit(userId)}
                />
                <DateRangeModal
                    open={openKey === "dueDate"}
                    isSingle={true}
                    minDate={new Date().toISOString().split("T")[0]}
                    onClose={() => setOpenKey(null)}
                    onApply={({ endDate }) => handleLocalChange("dueDate", endDate)}
                />
                {openKey === "commit" && (
                    <CommitSelectModal
                        projectId={projectId}
                        onClose={() => setOpenKey(null)}
                        onSelect={handleCommitSelect}
                    />
                )}
                <IssueChatModal
                    open={openKey === "chat"}
                    onClose={() => setOpenKey(null)}
                    issue={detail}
                />

            </div>
        </div>
    );
}
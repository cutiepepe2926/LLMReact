import React, { useMemo, useState } from "react";
import SelectModal from "./SelectModal";
import { api } from '../../../../../../utils/api';
import "./IssueCreateModal.css";

function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function IssueCreateModal({ open, onClose, projectId }) {

    const [title, setTitle] = useState("");
    const [endDate, setEndDate] = useState(todayStr());
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("P0");
    const [assigneeInput, setAssigneeInput] = useState("");
    const [priorityModalOpen, setPriorityModalOpen] = useState(false);
    const priorityOptions = useMemo(
        () =>
            ["P0", "P1", "P2", "P3", "P4", "P5"].map((p) => ({
                value: p,
                label: p,
            })),
        []
    );
    const priorityLabel =
        priorityOptions.find((o) => o.value === priority)?.label ?? priority;
    if (!open) return null;

    const handleOverlay = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async () => {
        // 1. 유효성 검사 (제목은 필수)
        if (!title.trim()) {
            alert("이슈 명을 입력해주세요.");
            return;
        }

        // 프로젝트 ID 방어 코드
        if (!projectId) {
            alert("프로젝트 정보를 불러오지 못했습니다.");
            return;
        }

        // 2. 데이터 변환 (Frontend -> Backend DTO)
        // (1) 우선순위 변환: "P0" -> 0 (문자열 제거 후 정수로 변환)
        const priorityInt = parseInt(priority.replace("P", ""), 10);

        // (2) 담당자 변환: 단일 문자열 -> 리스트 (Backend는 List<String>을 원함)
        // 담당자가 입력되지 않았다면 빈 배열 [] 전송
        const assigneeIdsPayload = assigneeInput.trim() ? [assigneeInput.trim()] : [];

        // 3. 최종 Payload 구성
        const payload = {
            title: title,               // 제목
            description: description,   // 설명
            priority: priorityInt,      // 우선순위 (int)
            dueDate: endDate,           // [중요] 변수명 매칭 (endDate -> dueDate)
            assigneeIds: assigneeIdsPayload // 담당자 리스트
        };

        try {
            // props로 받은 projectId 사용
            const response = await api.post(`/api/projects/${projectId}/issues`, payload);

            console.log("이슈 생성 성공:", response);
            alert("이슈가 성공적으로 생성되었습니다.");

            // 입력 필드 초기화
            setTitle("");
            setDescription("");
            setAssigneeInput("");
            setPriority("P0");

            onClose(); // 모달 닫기
        } catch (error) {
            console.error("이슈 생성 실패:", error);
            alert(error.message || "이슈 생성 중 오류가 발생했습니다.");
        }
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
                            <label className="field-label">마감일</label>
                            {/* 날짜 범위 선택 대신 단일 날짜 선택으로 변경 */}
                            <div className="date-range">
                                <input
                                    className="field-input"
                                    type="date"
                                    value={endDate}
                                    min={todayStr()}
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

                    {/* 3행: 커밋 / 우선도 */}
                    <div className="issue-create-row two-col">
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
                                {/* 추가 버튼 등 UI는 추후 '멤버 선택 모달'로 고도화 필요 */}
                                <button type="button" className="btn gray">
                                    추가
                                </button>
                            </div>
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

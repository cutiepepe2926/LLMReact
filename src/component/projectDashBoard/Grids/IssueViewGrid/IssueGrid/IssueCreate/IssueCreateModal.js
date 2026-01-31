import React, {useMemo, useRef, useState, useEffect } from "react";
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

    // === 기본 입력 데이터 ===
    const [title, setTitle] = useState("");
    const [endDate, setEndDate] = useState(todayStr());
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("P0");

    // === 담당자 검색 및 선택 관련 State (CreateProjectModal 로직 이식) ===
    const [assigneeInput, setAssigneeInput] = useState("");     // 검색어 입력
    const [allMembers, setAllMembers] = useState([]);           // 전체 프로젝트 멤버 리스트
    const [searchResults, setSearchResults] = useState([]);     // 검색 결과 (드롭다운 표시용)
    const [selectedAssignees, setSelectedAssignees] = useState([]); // 선택된 담당자들

    // 드롭다운 제어를 위한 Ref
    const searchWrapperRef = useRef(null);

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

    // === 초기화 및 멤버 목록 조회 ===
    useEffect(() => {
        if (open && projectId) {
            fetchProjectMembers();
        }
        // 모달 닫힐 때 상태 초기화
        if (!open) {
            setTitle("");
            setDescription("");
            setAssigneeInput("");
            setSelectedAssignees([]);
            setSearchResults([]);
            setPriority("P0");
        }
        // eslint-disable-next-line
    }, [open, projectId]);

    const fetchProjectMembers = async () => {
        try {
            // [API] 프로젝트 멤버 전체 조회
            const response = await api.get(`/api/projects/${projectId}/members`);
            setAllMembers(response || []); // 전체 멤버 저장
        } catch (error) {
            console.error("멤버 목록 조회 실패:", error);
        }
    };

    // === 검색 로직 (Client-side Filtering) ===
    useEffect(() => {
        // 입력값이 없으면 드롭다운 숨김
        if (assigneeInput.trim() === "") {
            setSearchResults([]);
            return;
        }

        // 전체 멤버 중에서 (이름 or ID)가 일치하고, 아직 선택되지 않은 사람 필터링
        const lowerInput = assigneeInput.toLowerCase();
        const filtered = allMembers.filter((member) => {
            const isMatch =
                (member.name && member.name.toLowerCase().includes(lowerInput)) ||
                (member.userId && member.userId.toLowerCase().includes(lowerInput));

            const isAlreadySelected = selectedAssignees.some(sel => sel.userId === member.userId);

            return isMatch && !isAlreadySelected;
        });

        setSearchResults(filtered);
    }, [assigneeInput, allMembers, selectedAssignees]);

    // === 외부 클릭 감지 (드롭다운 닫기) ===
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchWrapperRef]);

    // === 핸들러 함수들 ===
    const handleAddAssignee = (member) => {
        setSelectedAssignees([...selectedAssignees, member]);
        setAssigneeInput(""); // 입력창 초기화
        setSearchResults([]); // 드롭다운 닫기
    };

    const handleRemoveAssignee = (targetUserId) => {
        setSelectedAssignees(selectedAssignees.filter((m) => m.userId !== targetUserId));
    };

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

        // 선택된 객체 배열에서 ID만 추출
        const assigneeIdsPayload = selectedAssignees.map(m => m.userId);

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

    if (!open) return null;

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

                    {/* 4행: 담당자 선택 (CreateProjectModal 스타일 적용) */}
                    <div className="issue-create-row">
                        <div className="field">
                            <label className="field-label">담당자 할당</label>

                            {/* 검색창 + 드롭다운 */}
                            <div className="assignee-search-wrapper" ref={searchWrapperRef} style={{ position: 'relative' }}>
                                <input
                                    className="field-input"
                                    value={assigneeInput}
                                    onChange={(e) => setAssigneeInput(e.target.value)}
                                    placeholder="이름 또는 ID로 검색하여 추가"
                                    onFocus={() => {
                                        // 포커스 시 입력값이 있으면 검색 결과 다시 표시
                                        if(assigneeInput) setSearchResults(allMembers.filter(m =>
                                            (m.name.includes(assigneeInput) || m.userId.includes(assigneeInput)) &&
                                            !selectedAssignees.some(s => s.userId === m.userId)
                                        ));
                                    }}
                                />

                                {/* 드롭다운 목록 (스타일은 CreateProjectModal의 CSS 클래스 활용 가정) */}
                                {searchResults.length > 0 && (
                                    <ul className="search-dropdown" style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'white', border: '1px solid #ddd', borderRadius: '4px',
                                        maxHeight: '150px', overflowY: 'auto', zIndex: 10, listStyle: 'none', padding: 0, margin: 0
                                    }}>
                                        {searchResults.map((member) => (
                                            <li
                                                key={member.userId}
                                                onClick={() => handleAddAssignee(member)}
                                                style={{
                                                    padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex', alignItems: 'center', gap: '8px'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <img
                                                    src={member.filePath || "/img/Profile.svg"}
                                                    alt="profile"
                                                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                                />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{member.name}</span>
                                                    <span style={{ fontSize: '12px', color: '#888' }}>@{member.userId}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* 선택된 담당자 태그 리스트 */}
                            <div className="selected-assignees-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {selectedAssignees.map((member) => (
                                    <div key={member.userId} className="user-tag" style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: '#e3f2fd', padding: '4px 8px', borderRadius: '16px', fontSize: '13px'
                                    }}>
                                        <img
                                            src={member.filePath || "/img/Profile.svg"}
                                            alt="profile"
                                            style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                        />
                                        <span>{member.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAssignee(member.userId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                ))}
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

import React, { useState, useEffect, useRef } from "react";
import { api } from "../../../../../../utils/api"

export default function InviteMemberModal({ open, onClose, onInvite }) {
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // 외부 클릭 감지를 위한 Ref
    const wrapperRef = useRef(null);

    // 모달이 열릴 때 상태 초기화
    useEffect(() => {
        if (open) {
            setKeyword("");
            setSearchResults([]);
            setSelectedUser(null);
        }
    }, [open]);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // 검색 API 호출 (디바운스 적용)
    useEffect(() => {
        // 이미 선택된 상태라면 검색하지 않음
        if (selectedUser) return;

        const delayDebounce = setTimeout(async () => {
            if (keyword.trim().length > 0) {
                setIsSearching(true);
                try {
                    // 사용자 검색 API 호출
                    const res = await api.get("/api/user/search", { keyword: keyword });
                    setSearchResults(res.data || res); // 응답 구조에 따라 조정
                } catch (error) {
                    console.error("User search failed:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [keyword, selectedUser]);

    // 사용자 선택 핸들러
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setKeyword(`${user.name} (${user.userId})`); // 입력창에 선택된 정보 표시
        setSearchResults([]); // 드롭다운 닫기
    };

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        setKeyword(e.target.value);
        if (selectedUser) {
            setSelectedUser(null); // 다시 타이핑하면 선택 해제
        }
    };

    const handleInviteClick = () => {
        // 선택된 유저가 있으면 그 유저의 ID, 없으면 입력된 텍스트 그대로 전달
        const userIdToInvite = selectedUser ? selectedUser.userId : keyword;
        onInvite(userIdToInvite);
    };

    if (!open) return null;

    return (
        <div className="mm-modal-backdrop" onClick={onClose}>
            <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-title">멤버 초대</div>

                <div className="mm-modal-body" style={{ minHeight: '150px' }}>
                    <div style={{ fontWeight: 800, marginBottom: '8px' }}>초대할 사용자 검색</div>

                    {/* 검색 영역 Wrapper */}
                    <div style={{ position: 'relative' }} ref={wrapperRef}>
                        <input
                            value={keyword}
                            onChange={handleChange}
                            placeholder="ID 또는 이름으로 검색"
                            style={{
                                width: "100%",
                                border: "1px solid rgba(0,0,0,0.12)",
                                borderRadius: "10px",
                                padding: "10px 12px",
                                outline: "none",
                            }}
                        />

                        {/* 검색 결과 드롭다운 */}
                        {searchResults.length > 0 && !selectedUser && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 1000,
                                listStyle: 'none',
                                padding: '5px 0',
                                margin: '4px 0 0 0'
                            }}>
                                {searchResults.map((user) => (
                                    <li
                                        key={user.userId}
                                        onClick={() => handleSelectUser(user)}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderBottom: '1px solid #eee'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <img
                                            src={user.filePath || "/img/Profile.svg"}
                                            alt={user.name}
                                            style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display:'block' }}>{user.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>@{user.userId}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* 검색 결과 없음 표시 (선택사항) */}
                        {isSearching && <div style={{position:'absolute', right:10, top:12, fontSize:'0.8rem', color:'#999'}}>검색중...</div>}
                    </div>
                </div>

                <div className="mm-modal-actions">
                    <button
                        type="button"
                        className="mm-modal-btn"
                        onClick={handleInviteClick}
                        disabled={!keyword.trim()}
                        style={{
                            opacity: keyword.trim() ? 1 : 0.5,
                            backgroundColor: selectedUser ? '#4CAF50' : '' // 선택 완료 시 색상 강조
                        }}
                    >
                        초대
                    </button>
                    <button type="button" className="mm-modal-btn" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

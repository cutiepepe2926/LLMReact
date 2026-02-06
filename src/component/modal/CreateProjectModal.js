import React, { useState, useEffect, useRef } from 'react';
import './CreateProjectModal.css';
import { api } from '../../utils/api';

// 오늘 날짜 문자열(YYYY-MM-DD) 반환 함수
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const CreateProjectModal = ({ open, onClose, onCreate }) => {
  // 1. 기본 입력 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '2026-01-01',
    endDate: '2026-01-13',
    reportTime: '09:00',
    repoUrl: '',
  });

  // eslint-disable-next-line
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState("");

  // 깃허브 저장소 목록 및 미니 모달 상태
  const [myRepos, setMyRepos] = useState([]);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoPage, setRepoPage] = useState(1);

  // 깃허브 저장소 목록 불러오기
  const fetchMyRepos = async (pageToLoad = 1) => {
    try {
      setIsLoadingRepos(true);

      // 첫 페이지 로딩일 때만 모달 열기 & 리스트 초기화
      if (pageToLoad === 1) {
        setIsRepoModalOpen(true);
        setMyRepos([]); // 초기화
      }

      // 백엔드 API 호출 (쿼리 스트링으로 page 전달)
      const res = await api.get(`/api/github/repos?page=${pageToLoad}`);
      const newData = res.data || res;

      if (pageToLoad === 1) {
        setMyRepos(newData);
      } else {
        // 2페이지 이상이면 기존 리스트 뒤에 붙이기
        setMyRepos(prev => [...prev, ...newData]);
      }

      setRepoPage(pageToLoad); // 현재 페이지 업데이트

    } catch (error) {
      console.error("저장소 목록 로딩 실패:", error);
      alert("깃허브 저장소 목록을 불러오지 못했습니다.");
      if (pageToLoad === 1) setIsRepoModalOpen(false);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // 더보기 버튼 핸들러
  const handleLoadMore = () => {
    fetchMyRepos(repoPage + 1);
  };

  // 저장소 선택 핸들러
  const handleSelectRepo = (repo) => {
    setFormData(prev => ({
      ...prev,
      repoUrl: repo.html_url, // URL 자동 입력
      repoName: repo.full_name // (필요 시 사용) 이름 저장
    }));
    setIsRepoModalOpen(false); // 미니 모달 닫기
  };

  // 2. 협업자 및 검색 관련 상태
  const [inviteInput, setInviteInput] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line
  const [isSearching, setIsSearching] = useState(false);

  // 외부 클릭 감지를 위한 Ref
  const searchWrapperRef = useRef(null);

  // 3. 외부 클릭 시 드롭다운 닫기 (요구사항 1)
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setSearchResults([]); // 검색 결과 초기화 (드롭다운 닫기)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchWrapperRef]);

  // 4. 검색 로직 (0.5초 디바운스)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (inviteInput.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await api.get("/api/user/search", { keyword: inviteInput });
          const filteredResults = (res.data || res).filter(
            (user) => !collaborators.some((collab) => collab.userId === user.userId)
          );
          setSearchResults(filteredResults);
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
  }, [inviteInput, collaborators]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCollaborator = (user) => {
    setCollaborators([...collaborators, user]);
    setInviteInput('');
    setSearchResults([]);
  };

  // 요구사항 3: X 버튼 동작 수정 (userId 기준 필터링)
  const handleRemoveCollaborator = (targetUserId) => {
    setCollaborators(collaborators.filter(user => user.userId !== targetUserId));
  };

  const handleCreate = () => {
    // 백엔드로 보낼 데이터 구성
    const requestData = {
      ...formData,
      startDate: startDate,
      endDate: endDate,
      // collaborators(객체 배열) -> memberIds(문자열 배열)로 변환
      // 백엔드는 userId만 필요함
      members: collaborators.map(member => member.userId)
    };
    
    onCreate(requestData);
  };

  const isFormValid = 
      formData.name.trim() !== '' && 
      formData.repoUrl.trim() !== '' && 
      endDate !== '';
  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in-up">
        
        <h2 className="modal-title">프로젝트 생성</h2>

        <div className="modal-body">
          {/* ... 기존 상단 입력 폼 (이름, 날짜, 설명, 깃허브 등) 유지 ... */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 명</label>
              <input type="text" name="name" placeholder="프로젝트 입니다" onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field-label">기간 설정</label>
              <div className="date-range">
                {/* [변경 2] 시작일 입력칸 비활성화 (disabled) */}
                <input
                    type="date"
                    className="field-input"
                    value={startDate}
                    disabled  // 사용자가 수정 불가능하게 막음
                />
                <span className="date-dash">~</span>
                <input
                    type="date"
                    className="field-input"
                    value={endDate}
                    min={startDate} // 종료일은 시작일(오늘) 이후로만 선택 가능하게 제한
                    onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 설명</label>
              <textarea name="description" placeholder="설명을 입력하세요" onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>리포트 생성 시간</label>
              <input 
                type="time" 
                name="reportTime" 
                value={formData.reportTime} 
                onChange={handleChange}
                className="field-input" // 기존 CSS 클래스 활용 (필요 시 스타일 조정)
                style={{ width: '100%', boxSizing: 'border-box' }} // 레이아웃 깨짐 방지
              />
            </div>
          </div>

          {/* [수정] 깃허브 주소 입력 및 연결 버튼 */}
          <div className="form-group">
            <label>GitHub Repository URL</label>
            <div className="repo-input-group">
              <input
                  type="text"
                  name="repoUrl"
                  value={formData.repoUrl}
                  placeholder="https://github.com/username/repo"
                  onChange={handleChange}
              />
              <button
                  className="btn-connect-github"
                  type="button"
                  onClick={() => fetchMyRepos(1)}
              >
                🔗 GitHub 연결
              </button>
            </div>
          </div>

          {/* --- 요구사항 4: 하단 레이아웃 변경 (수직 배치) --- */}
          <div className="bottom-section">
            
            <label>협업자 초대</label>
            
            {/* 검색창 + 드롭다운 영역 (ref 추가) */}
            <div className="invite-input-group" ref={searchWrapperRef}> 
              <input 
                type="text" 
                value={inviteInput} 
                onChange={(e) => setInviteInput(e.target.value)} 
                placeholder="ID 또는 이름으로 검색"
                className="invite-input"
              />
              
              {/* 드롭다운 */}
              {searchResults.length > 0 && (
                <ul className="search-dropdown">
                  {searchResults.map((user) => (
                    <li 
                      key={user.userId} 
                      onClick={() => handleAddCollaborator(user)}
                      className="search-result-item"
                    >
                      {/* 요구사항 2: 기본 이미지 처리 */}
                      <img 
                        src={user.filePath || "/img/Profile.svg"} 
                        alt={user.name} 
                        className="user-avatar-small"
                      />
                      <div className="user-info-text">
                        <span className="user-name">{user.name}</span>
                        <span className="user-id">@{user.userId}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* 선택된 협업자 리스트 (검색창 아래 배치) */}
            <div className="collaborator-list">
              {collaborators.length === 0 && <span className="empty-msg">초대할 협업자가 없습니다.</span>}
              {collaborators.map((user, idx) => (
                <span key={idx} className="user-tag">
                  {/* 요구사항 2: 리스트에서도 기본 이미지 처리 */}
                  <img 
                    src={user.filePath || "/img/Profile.svg"} 
                    alt="profile" 
                    className="user-avatar-img" 
                  />
                  <span className="user-name">{user.name}</span>
                  
                  {/* 요구사항 3: type="button" 추가하여 폼 제출 방지 및 클릭 이벤트 수정 */}
                  <button 
                    type="button" 
                    className="remove-tag-btn" 
                    onClick={() => handleRemoveCollaborator(user.userId)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>

            {/* 오른쪽: 버튼 그룹 (공개 범위 삭제됨 -> 하단 정렬) */}
            {/*<div className="button-group">*/}
            <div className="right-panel">
              <div className="button-group">
                <button className="cancel-btn" onClick={onClose}>취소</button>
                <button 
                  className="create-confirm-btn" 
                  onClick={handleCreate}
                  disabled={!isFormValid}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* 깃허브 저장소 선택 미니 모달 */}
      {isRepoModalOpen && (
          <div className="mini-modal-overlay" onClick={() => setIsRepoModalOpen(false)}>
            <div className="mini-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="mini-modal-header">
                <h3>내 GitHub 저장소 목록</h3>
                <button className="close-btn" onClick={() => setIsRepoModalOpen(false)}>×</button>
              </div>

              <div className="repo-list-container">
                {/* 로딩 중이고 데이터가 없으면(첫 로딩) */}
                {isLoadingRepos && myRepos.length === 0 ? (
                    <p className="loading-text">목록을 불러오는 중...</p>
                ) : myRepos.length > 0 ? (
                    <>
                      <ul className="repo-list">
                        {myRepos.map((repo, index) => (
                            <li key={`${repo.full_name}-${index}`} className="repo-item" onClick={() => handleSelectRepo(repo)}>
                              {/* 기존 리스트 아이템 코드 동일 */}
                              <div className="repo-info">
                                <span className="repo-name">{repo.name}</span>
                                <span className={`repo-badge ${repo.private ? 'private' : 'public'}`}>
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                              </div>
                              <div className="repo-desc">{repo.description || "설명 없음"}</div>
                            </li>
                        ))}
                      </ul>

                      {/* 더보기 버튼 (데이터가 10개 단위로 왔을 때만 표시) */}
                      {!isLoadingRepos && myRepos.length % 10 === 0 && myRepos.length > 0 && (
                          <button className="btn-load-more" onClick={handleLoadMore}>
                            ▼ 더보기
                          </button>
                      )}

                      {/* 추가 로딩 중 표시 */}
                      {isLoadingRepos && myRepos.length > 0 && (
                          <div className="loading-more-text">불러오는 중...</div>
                      )}
                    </>
                ) : (
                    <p className="no-data-text">연결된 저장소가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default CreateProjectModal;
import React, { useState, useEffect } from 'react';
import { api } from '../../../../../../utils/api';
import '../../../../../modal/CreateProjectModal.css'
import "./ProjectEditModal.css";

const ProjectEditModal = ({ project, onClose, onEditSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        repoUrl: project.githubRepoUrl || "", // DB 필드명에 맞춰 초기값 설정
    });

    // 깃허브 저장소 목록 및 미니 모달 상태
    const [myRepos, setMyRepos] = useState([]);
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
    const [repoPage, setRepoPage] = useState(1);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);

    // 1. 모달 진입 시 상세 정보 API 호출
    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!project?.projectId) return;

            try {
                setLoading(true);
                // [API 호출] 새로 만든 상세 조회 API 사용
                const res = await api.get(`/api/projects/${project.projectId}`);
                const data = res.data || res; // 응답 구조(response.data 또는 바로 객체)에 따라 대응

                // 날짜 포맷 (YYYY-MM-DD)
                const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

                // 2. 폼 데이터 초기화
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    startDate: formatDate(data.startDate),
                    endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
                    reportTime: formData.reportTime, // 서버 필드명: dailyReportTime
                    repoUrl: data.githubRepoUrl || ''             // 서버 필드명: githubRepoUrl
                });
            } catch (error) {
                console.error("프로젝트 상세 조회 실패:", error);
                alert("상세 정보를 불러오지 못했습니다.");
                onClose();
            } finally {
                setLoading(false);
            }
        };


        fetchProjectDetails();
        // eslint-disable-next-line
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. 수정 요청 핸들러
    const handleEdit = async () => {
        // 유효성 검사: 종료일은 오늘 이후여야 함
        const today = new Date().toISOString().split('T')[0];
        if (formData.endDate < today) {
            alert("종료일은 오늘 이후로 설정해야 합니다.");
            return;
        }

        try {
            // [API 호출] 프로젝트 수정 (PUT)
            const requestData = {
                name: formData.name,
                description: formData.description,
                endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
                reportTime: formData.reportTime,
                gitUrl: formData.repoUrl // 서버 DTO 필드명(gitUrl)에 매핑
            };

            await api.put(`/api/projects/${project.projectId}`, requestData);

            alert("프로젝트 정보가 수정되었습니다.");

            onEditSuccess(); // 성공 콜백 (목록 새로고침 등)
            onClose();

        } catch (error) {
            alert("수정 실패: " + (error.message || "오류가 발생했습니다."));
        }
    };

    // 깃허브 저장소 목록 불러오기 (페이지네이션 적용)
    const fetchMyRepos = async (pageToLoad = 1) => {
        try {
            setIsLoadingRepos(true);

            if (pageToLoad === 1) {
                setIsRepoModalOpen(true);
                setMyRepos([]);
            }

            const res = await api.get(`/api/github/repos?page=${pageToLoad}`);
            const newData = res.data || res;

            if (pageToLoad === 1) {
                setMyRepos(newData);
            } else {
                setMyRepos(prev => [...prev, ...newData]);
            }

            setRepoPage(pageToLoad);

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
            repoUrl: repo.html_url,
        }));
        setIsRepoModalOpen(false);
    };

    const isFormValid = formData.name.trim() !== '';

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{textAlign:'center', padding:'40px'}}>
                    불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in-up">
                <h2 className="modal-title">프로젝트 수정</h2>

                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>프로젝트 명</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>기간</label>
                            <div className="date-display">
                                {/* 시작일 수정 불가 (readOnly) */}
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    readOnly
                                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#666' }}
                                />
                                <span>~</span>
                                {/* 종료일 수정 가능 */}
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>프로젝트 설명</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>리포트 생성 시간</label>
                            <select
                                name="reportTime"
                                value={formData.reportTime}
                                onChange={handleChange}
                            >
                                <option value="09:00">09:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="18:00">06:00 PM</option>
                                <option value="21:00">09:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>깃허브 주소</label>
                        <div className="repo-input-group" style={{ display: 'flex', gap: '10px' }}> {/* 인라인 스타일 또는 CSS 클래스 사용 */}
                            <input
                                type="text"
                                name="repoUrl"
                                value={formData.repoUrl}
                                onChange={handleChange}
                                placeholder="https://github.com/username/repo"
                                style={{ flex: 1 }}
                            />
                            <button
                                className="btn-connect-github"
                                type="button"
                                onClick={() => fetchMyRepos(1)}
                                style={{
                                    backgroundColor: '#24292e', color: 'white', border: 'none',
                                    padding: '0 16px', borderRadius: '6px', cursor: 'pointer',
                                    fontWeight: '600', whiteSpace: 'nowrap'
                                }}
                            >
                                🔗 GitHub 연결
                            </button>
                        </div>
                    </div>

                    <div className="bottom-section" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                        <div className="button-group">
                            <button className="cancel-btn" onClick={onClose}>취소</button>
                            <button
                                className="create-confirm-btn"
                                onClick={handleEdit}
                                disabled={!isFormValid}
                            >
                                수정하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isRepoModalOpen && (
                <div className="mini-modal-overlay" onClick={() => setIsRepoModalOpen(false)}>
                    <div className="mini-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="mini-modal-header">
                            <h3>내 GitHub 저장소 목록</h3>
                            <button className="close-btn" onClick={() => setIsRepoModalOpen(false)}>×</button>
                        </div>

                        <div className="repo-list-container">
                            {isLoadingRepos && myRepos.length === 0 ? (
                                <p className="loading-text">목록을 불러오는 중...</p>
                            ) : myRepos.length > 0 ? (
                                <>
                                    <ul className="repo-list">
                                        {myRepos.map((repo, index) => (
                                            <li key={`${repo.full_name}-${index}`} className="repo-item" onClick={() => handleSelectRepo(repo)}>
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

                                    {!isLoadingRepos && myRepos.length % 10 === 0 && myRepos.length > 0 && (
                                        <button className="btn-load-more" onClick={handleLoadMore}>
                                            ▼ 더보기
                                        </button>
                                    )}

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

export default ProjectEditModal;
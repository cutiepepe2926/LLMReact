import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../../utils/api';
import './CommitSelectModal.css'; // 아래에서 스타일 정의

const CommitSelectModal = ({ projectId, onClose, onSelect }) => {
    const [step, setStep] = useState(1); // 1: 브랜치 선택, 2: 커밋 선택
    const [selectedBranch, setSelectedBranch] = useState(null);

    // 데이터 상태
    const [branches, setBranches] = useState([]);
    const [commits, setCommits] = useState([]);

    // 페이지네이션 및 로딩 상태
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchBranches = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/github/${projectId}/getBranch?page=${pageNum}`);
            const newData = res.data || res;

            if (pageNum === 1) {
                setBranches(newData);
            } else {
                setBranches(prev => [...prev, ...newData]);
            }

            // 데이터가 10개 미만이면 더 이상 없음 (Github API 기본값 기준)
            setHasMore(newData.length === 10);
            setLoading(false);
        } catch (error) {
            console.error("브랜치 로딩 실패:", error);
            setLoading(false);
        }
    }, [projectId]);

    // 2. 커밋 목록 불러오기 (브랜치 선택 후)
    const fetchCommits = useCallback(async (branchName, pageNum) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/github/${projectId}/commits?sha=${branchName}&page=${pageNum}`);
            const newData = res.data || res;

            if (pageNum === 1) {
                setCommits(newData);
            } else {
                setCommits(prev => [...prev, ...newData]);
            }

            setHasMore(newData.length === 10);
            setLoading(false);
        } catch (error) {
            console.error("커밋 로딩 실패:", error);
            setLoading(false);
        }
    }, [projectId]);

    // 1. 브랜치 목록 불러오기 (첫 진입 시)
    useEffect(() => {
        if (step === 1) {
            fetchBranches(1);
        }
    }, [step, fetchBranches]);

    // 핸들러: 브랜치 선택 -> 커밋 목록으로 이동
    const handleBranchClick = (branch) => {
        setSelectedBranch(branch);
        setStep(2);
        setPage(1); // 페이지 초기화
        setCommits([]); // 기존 커밋 초기화
        fetchCommits(branch.name, 1);
    };

    // 핸들러: 더보기 버튼
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        if (step === 1) {
            fetchBranches(nextPage);
        } else {
            fetchCommits(selectedBranch.name, nextPage);
        }
    };

    // 핸들러: 뒤로가기 (커밋 선택 -> 브랜치 선택)
    const handleBack = () => {
        setStep(1);
        setBranches([]); // 브랜치 다시 로드 (혹은 상태 유지 선택 가능)
        setPage(1);
    };

    return (
        <div className="commit-modal-overlay" onClick={onClose}>
            <div className="commit-modal-content" onClick={e => e.stopPropagation()}>
                <div className="commit-modal-header">
                    {step === 2 && (
                        <button className="back-btn" onClick={handleBack}>←</button>
                    )}
                    <h3>{step === 1 ? '브랜치 선택' : `커밋 선택 (${selectedBranch?.name})`}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="commit-list-container">
                    {/* [Step 1] 브랜치 목록 */}
                    {step === 1 && (
                        <ul className="commit-list">
                            {branches.map((branch, idx) => (
                                <li key={idx} className="commit-item branch" onClick={() => handleBranchClick(branch)}>
                                    <span className="branch-icon">🌿</span>
                                    <span className="branch-name">{branch.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* [Step 2] 커밋 목록 */}
                    {step === 2 && (
                        <ul className="commit-list">
                            {commits.map((commit, idx) => (
                                <li key={idx} className="commit-item" onClick={() => onSelect(commit)}>
                                    <div className="commit-msg">{commit.message}</div>
                                    <div className="commit-meta">
                                        <span className="commit-author">{commit.authorName}</span>
                                        <span className="commit-date">{new Date(commit.date).toLocaleDateString()}</span>
                                        <span className="commit-sha">{commit.sha.substring(0, 7)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* 로딩 및 더보기 */}
                    {loading && <div className="loading-text">로딩 중...</div>}
                    {!loading && hasMore && (
                        <button className="btn-load-more" onClick={handleLoadMore}>▼ 더보기</button>
                    )}
                    {!loading && (step === 1 ? branches.length === 0 : commits.length === 0) && (
                        <div className="no-data-text">데이터가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitSelectModal;
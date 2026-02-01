// list/IssueListPage.js
import React, {useEffect, useState} from "react";
import { api } from '../../../../../../utils/api';

import IssueCard from "../IssueCard/IssueCard";
import IssueFilterBar from "./IssueFilterBar";
import IssueCreateModal from "../IssueCreate/IssueCreateModal";
import "./IssueListPage.css";


const ALL = "ALL";

export default function IssueListPage({ projectId, initialStatus = ALL, onBack, onOpenDetail }) {

    // 이슈 목록을 담을 상태 객체
    const [issueList, setIssueList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 멤버 목록
    const [activeMembers, setActiveMembers] = useState([]);

    const [filters, setFilters] = useState({
        status: initialStatus,
        assignee: ALL,
        priority: ALL,
        sort: "LATEST",
        // 작성일 기준
        createdStart: "",
        createdEnd: "",
        // 마감일 기준
        dueStart: "",
        dueEnd: "",
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchProjectMembers = async () => {
        if (!projectId) return;
        try {
            const response = await api.get(`/api/projects/${projectId}/members`);
            // ACTIVE 상태인 멤버만 필터링 (필요 시 조건 조정)
            const actives = (response || []).filter(m => m.status === 'ACTIVE' || m.status === 'me');
            setActiveMembers(actives);
        } catch (error) {
            console.error("멤버 목록 조회 실패:", error);
        }
    };

    // 컬럼 클릭으로 들어올 때 status를 반영
    useEffect(() => {
        setFilters((prev) => ({ ...prev, status: initialStatus }));
    }, [initialStatus]);

    // 3. API 호출하여 이슈 목록 가져오기
    const fetchIssues = async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            const params = {};

            if (filters.status !== ALL) params.status = filters.status;
            if (filters.priority !== ALL) params.priority = parseInt(filters.priority.replace("P", ""), 10);
            if (filters.assignee !== ALL) params.assigneeId = filters.assignee;

            // [수정] 작성일 필터 파라미터 추가
            if (filters.createdStart) params.createdStart = filters.createdStart;
            if (filters.createdEnd) params.createdEnd = filters.createdEnd;

            // [수정] 마감일 필터 파라미터 추가
            if (filters.dueStart) params.dueStart = filters.dueStart;
            if (filters.dueEnd) params.dueEnd = filters.dueEnd;

            // 정렬 파라미터
            if (filters.sort === "LATEST") params.sort = "createdAt_desc";
            else if (filters.sort === "OLDEST") params.sort = "createdAt_asc";
            else if (filters.sort === "PRIORITY_HIGH") params.sort = "priority_desc";
            else if (filters.sort === "PRIORITY_LOW") params.sort = "priority_asc";

            const response = await api.get(`/api/projects/${projectId}/issues`, params);

            // ... (데이터 매핑 로직은 기존과 동일)
            const mappedIssues = (response || []).map(item => ({
                // ... 기존 매핑 코드
                id: item.issueId,
                title: item.title,
                status: item.status,
                priority: `P${item.priority}`,
                dueDate: item.dueDate,
                assignee: item.assignees && item.assignees.length > 0 ? item.assignees[0] : null,
                assignees: item.assignees || [],
                createdAt: item.createdAt,
                createdBy: item.createdBy
            }));
            setIssueList(mappedIssues);

        } catch (error) {
            console.error("이슈 목록 조회 실패:", error);
            setIssueList([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 5. projectId나 필터가 변경될 때마다 데이터 다시 불러오기
    useEffect(() => {
        fetchIssues();
        fetchProjectMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, filters]); // filters 객체 전체를 의존성으로 두면 내부 값 변경 시 호출됨


    // 더 이상 클라이언트 사이드 필터링(useMemo)은 필요 없음 (서버에서 필터링해옴)
    // 바로 issueList를 렌더링

    return (
        <div className="issue-list-page">
            <div className="issue-list-panel">
                <div className="issue-list-top">
                    <div className="issue-list-title">이슈 목록</div>
                </div>

                {/* 필터 바: 여기서 setFilters하면 useEffect가 돌아 API 재호출됨 */}
                <IssueFilterBar filters={filters} onChange={setFilters} members={activeMembers} />

                <div className="issue-list-grid">
                    {/* 로딩 및 빈 상태 처리 로직 */}
                    {isLoading ? (
                        <div className="issue-empty-state">
                            <div className="loading-spinner"></div>
                            <p>이슈를 불러오는 중입니다...</p>
                        </div>
                    ) : issueList.length === 0 ? (
                        <div className="issue-empty-state">
                            <p>등록된 이슈가 없습니다.</p>
                            <p className="sub-text">우측 하단의 + 버튼을 눌러 이슈를 생성해보세요.</p>
                        </div>
                    ) : (
                        issueList.map((it) => (
                            <IssueCard
                                key={`${it.status}-${it.id}`}
                                item={it}
                                onClick={() => onOpenDetail?.(it)}
                            />
                        ))
                    )}
                </div>
            </div>

            <button className="issue-fab" onClick={() => setIsCreateOpen(true)}>
                +
            </button>

            {/* 이슈 생성 후 목록 새로고침을 위해 fetchIssues를 전달하거나 Context 사용 필요 */}
            {/* 여기서는 모달이 닫힐 때(onClose) 새로고침하도록 간단히 처리 가능 */}
            <IssueCreateModal
                projectId={projectId}
                open={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchIssues(); // [추가] 생성 후 목록 새로고침
                }}
            />
        </div>
    );
}

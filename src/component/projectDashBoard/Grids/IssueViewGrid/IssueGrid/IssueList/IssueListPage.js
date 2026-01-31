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

    const [filters, setFilters] = useState({
        status: initialStatus,
        assignee: ALL,
        priority: ALL,
        sort: "LATEST",
        startDate: "",
        endDate: "",
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // 컬럼 클릭으로 들어올 때 status를 반영
    useEffect(() => {
        setFilters((prev) => ({ ...prev, status: initialStatus }));
    }, [initialStatus]);

    // 3. API 호출하여 이슈 목록 가져오기
    const fetchIssues = async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            // 필터 파라미터 구성
            const params = {};

            // 상태 필터 (ALL이면 보내지 않음 -> 백엔드가 전체 조회)
            if (filters.status !== ALL) {
                params.status = filters.status;
            }

            // 우선순위 필터 (ALL이 아니면 "P0" -> 0 변환해서 전송)
            if (filters.priority !== ALL) {
                params.priority = parseInt(filters.priority.replace("P", ""), 10);
            }

            // 담당자 필터 (User ID)
            if (filters.assignee !== ALL) {
                params.assigneeId = filters.assignee;
            }

            // 정렬 필터 (LATEST -> createdAt_desc 등 변환)
            // 백엔드 IssueController: sort=createdAt_desc (기본값)
            if (filters.sort === "LATEST") params.sort = "createdAt_desc";
            else if (filters.sort === "OLDEST") params.sort = "createdAt_asc";
            else if (filters.sort === "PRIORITY_HIGH") params.sort = "priority_desc";
            else if (filters.sort === "PRIORITY_LOW") params.sort = "priority_asc";

            // API 호출
            const response = await api.get(`/api/projects/${projectId}/issues`, params);

            // 4. 데이터 매핑 (Backend DTO -> Frontend IssueCard Props)
            // Backend DTO: issueId, title, status, priority(int), assignees(List), ...
            const mappedIssues = (response || []).map(item => ({
                id: item.issueId,
                title: item.title,
                status: item.status,
                // 백엔드(0) -> 프론트엔드("P0") 변환
                priority: `P${item.priority}`,
                dueDate: item.dueDate,
                // 담당자 리스트 중 첫 번째 사람을 대표로 표시하거나 전체 전달
                // IssueCard가 어떻게 구현됐냐에 따라 다르지만 일단 객체 형태로 전달
                assignee: item.assignees && item.assignees.length > 0 ? item.assignees[0] : null,
                assignees: item.assignees || [],
                createdAt: item.createdAt,
                createdBy: item.createdBy
            }));

            setIssueList(mappedIssues);

        } catch (error) {
            console.error("이슈 목록 조회 실패:", error);
            // 에러 시 빈 목록 유지
            setIssueList([]);
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    // 5. projectId나 필터가 변경될 때마다 데이터 다시 불러오기
    useEffect(() => {
        fetchIssues();
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
                <IssueFilterBar filters={filters} onChange={setFilters} />

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

import React, {useMemo, useState} from "react";
import ProjectEditModal from "./ProjectEditModal/ProjectEditModal";
import { api } from "../../../../../utils/api";
import "./ProjectSettingsMiniGrid.css";

export default function ProjectSettingsMiniGrid({ project, myRole ,onRefresh }) {

    // 모달 상태
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 권한 체크: OWNER만 삭제/복구 가능
    const isOwner = myRole === "OWNER";

    // 삭제 예정 상태인지 확인 (deletedAt 값이 있으면 삭제 대기 중)
    const isDeleteRequested = !!project.deletedAt;

    // 현재 프로젝트 완료(아카이브) 상태인지 확인
    const isArchived = project.status === "DONE";

    // [핸들러] 프로젝트 상태 토글 (ACTIVE <-> DONE)
    const handleArchiveToggle = async () => {
        const nextStatus = isArchived ? "ACTIVE" : "DONE";
        const actionName = isArchived ? "재활성화" : "완료(아카이브)";

        const confirmMsg = isArchived
            ? "프로젝트를 다시 활성화하시겠습니까?\n이제 프로젝트 수정이 가능해집니다."
            : "프로젝트를 완료 처리하시겠습니까?\n완료 시 프로젝트가 '읽기 전용' 상태가 되어 수정할 수 없습니다.";

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.patch(`/api/projects/${project.projectId}/status`, { status: nextStatus });
            alert(`프로젝트가 ${actionName} 되었습니다.`);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            alert("상태 변경 실패: " + (error.message || "오류 발생"));
        }
    };

    // 삭제까지 남은 기간 계산 (D-Day)
    const remainingDays = useMemo(() => {
        if (!project.deletedAt) return null;

        const now = new Date();
        const deleteDate = new Date(project.deletedAt);

        // 시간 차이를 일(Day) 단위로 계산 (올림 처리)
        const diffTime = deleteDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }, [project.deletedAt]);

    // [핸들러] 삭제 요청 (Soft Delete)
    const handleDeleteRequest = async () => {
        if (!window.confirm("정말 프로젝트 삭제를 요청하시겠습니까?\n7일 간의 유예 기간 후 영구 삭제됩니다.")) {
            return;
        }

        try {
            await api.delete(`/api/projects/${project.projectId}`);
            alert("삭제 요청이 접수되었습니다. 7일 후 삭제됩니다.");
            // 데이터 갱신 (부모의 refreshProjectData 실행)
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            alert("삭제 요청 실패: " + (error.message || "오류 발생"));
        }
    };

    // [핸들러] 삭제 취소 (Restore)
    const handleRestoreRequest = async () => {
        if (!window.confirm("삭제 요청을 취소하고 프로젝트를 복구하시겠습니까?")) {
            return;
        }

        try {
            await api.post(`/api/projects/${project.projectId}/restore`);
            alert("프로젝트가 정상적으로 복구되었습니다.");
            // 데이터 갱신
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            alert("복구 실패: " + (error.message || "오류 발생"));
        }
    };

    return (
        <>
            <div className="psg-card">
                {/* 프로젝트 설정 */}
                <div className="psg-row-top">
                    <div className="psg-label">프로젝트 설정</div>
                    <button
                        type="button"
                        className="psg-btn"
                        onClick={() => setIsEditModalOpen(true)}
                        // [요청 반영] OWNER가 아니면 수정 버튼 비활성화
                        disabled={!isOwner}
                        title={!isOwner ? "프로젝트 소유자만 수정할 수 있습니다" : ""}
                    >
                        변경하기
                    </button>
                </div>

                {/* 고급 설정 */}
                <div className="psg-section-title">고급 설정</div>

                {/* 아카이브 (상태 변경) 버튼 */}
                <div className="psg-row">
                    <button
                        type="button"
                        className={`psg-btn ${isArchived ? "active" : ""}`} // 스타일 필요 시 css 추가 (선택사항)
                        onClick={handleArchiveToggle}
                        disabled={!isOwner}
                        title={!isOwner ? "프로젝트 소유자만 상태를 변경할 수 있습니다" : ""}
                    >
                        {isArchived ? "[프로젝트 활성화]" : "[프로젝트 완료]"}
                    </button>
                    <div className="psg-desc">
                        {isArchived
                            ? "(현재 완료 상태입니다. 다시 활성화하려면 클릭하세요.)"
                            : "(프로젝트가 끝났다면 완료처리하세요.)"}
                    </div>
                </div>

                <div className="psg-row">
                    {!isDeleteRequested ? (
                        // 1. 정상 상태 -> [삭제 요청] 버튼 표시
                        <>
                            <button
                                type="button"
                                className="psg-btn danger"
                                onClick={handleDeleteRequest}
                                disabled={!isOwner} // OWNER만 가능
                                title={!isOwner ? "프로젝트 소유자만 삭제할 수 있습니다" : ""}
                            >
                                [삭제 요청]
                            </button>
                            <div className="psg-desc">(유예 삭제 : 요청 후 7일 뒤 삭제)</div>
                        </>
                    ) : (
                        // 2. 삭제 대기 상태 -> [삭제 취소] 버튼 표시
                        <>
                            <button
                                type="button"
                                className="psg-btn"
                                style={{ color: '#2563EB', fontWeight: 'bold' }} // 파란색 강조
                                onClick={handleRestoreRequest}
                                disabled={!isOwner} // OWNER만 가능
                            >
                                [삭제 요청 취소]
                            </button>
                            {/* 남은 기간 붉은색 표시 */}
                            <div className="psg-desc" style={{ color: '#DC2626', fontWeight: 'bold' }}>
                                (삭제까지 {remainingDays}일 남았습니다)
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 프로젝트 수정 모달 */}
            {isEditModalOpen && (
                <ProjectEditModal
                    project={project}
                    onClose={() => setIsEditModalOpen(false)}
                    onEditSuccess={() => {
                        if (onRefresh) onRefresh();
                    }}
                />
            )}
        </>
    );
}

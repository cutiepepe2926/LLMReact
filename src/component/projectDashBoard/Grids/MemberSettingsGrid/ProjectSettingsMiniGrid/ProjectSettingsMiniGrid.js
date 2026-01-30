import React, { useState } from "react";
import ProjectEditModal from "./ProjectEditModal/ProjectEditModal";
import "./ProjectSettingsMiniGrid.css";

export default function ProjectSettingsMiniGrid({ project, onRefresh }) {

    // 모달 상태
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 삭제 요청 상태(데모)
    const [deleteRequested, setDeleteRequested] = useState(false);

    return (
        <>
            <div className="psg-card">
                {/* 프로젝트 설정 */}
                <div className="psg-row-top">
                    <div className="psg-label">프로젝트 설정</div>
                    <button
                        type="button"
                        className="psg-btn"
                        onClick={() => setIsEditModalOpen(true)} // 모달 열기
                    >
                        변경하기
                    </button>
                </div>

                {/* 고급 설정 */}
                <div className="psg-section-title">고급 설정</div>

                <div className="psg-row">
                    <button type="button" className="psg-btn">
                        [프로젝트 아카이브]
                    </button>
                    <div className="psg-desc">(완료 처리, Read-only 전환)</div>
                </div>

                <div className="psg-row">
                    <button
                        type="button"
                        className={`psg-btn ${!deleteRequested ? "danger" : ""}`}
                        onClick={() => setDeleteRequested(true)}
                        disabled={deleteRequested}
                    >
                        [삭제 요청]
                    </button>
                    <div className="psg-desc">(유예 삭제 : [남은 기간])</div>
                </div>

                {deleteRequested && (
                    <div className="psg-row">
                        <button
                            type="button"
                            className="psg-btn danger"
                            onClick={() => setDeleteRequested(false)}
                        >
                            [삭제 요청 취소]
                        </button>
                    </div>
                )}
            </div>

            {/* 프로젝트 수정 모달 렌더링 */}
            {isEditModalOpen && (
                <ProjectEditModal
                    project={project} // 현재 데이터(projectId) 전달
                    onClose={() => setIsEditModalOpen(false)}
                    onEditSuccess={() => {
                        // 수정 성공 시 수행할 동작
                        if (onRefresh) onRefresh();
                    }}
                />
            )}
        </>
    );
}

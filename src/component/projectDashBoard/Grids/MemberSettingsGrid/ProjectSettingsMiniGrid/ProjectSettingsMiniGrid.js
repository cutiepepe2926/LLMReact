import React from "react";
import "./ProjectSettingsMiniGrid.css";

export default function ProjectSettingsMiniGrid() {
    // 삭제 요청 상태(데모)
    const [deleteRequested, setDeleteRequested] = React.useState(false);

    return (
        <div className="psg-card">
            {/* 프로젝트 설정 */}
            <div className="psg-row-top">
                <div className="psg-label">프로젝트 설정</div>
                <button type="button" className="psg-btn">
                    변경하기
                </button>
                {/*TODO 변경하기 버튼 클릭 시 프로젝트 생성 템플릿 그대로 가져와서 데이터 덧씌우기*/}
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
                    disabled={deleteRequested}  // 요청 걸리면 클릭 막기(원하면 유지)
                >
                    [삭제 요청]
                </button>
                <div className="psg-desc">(유예 삭제 : [남은 기간])</div>
            </div>

            {/* 요구사항: "삭제 요청 취소"는 삭제 요청 비활성화 상태에서는 숨김 */}
            {/* 그리고 삭제 요청이 비활성화되면(= deleteRequested false) 빨간색으로 */}
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
    );
}

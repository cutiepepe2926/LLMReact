import React from "react";
import { useNavigate } from "react-router-dom";
import ChoiceModal from "./Modal/ChoiceModal";
import useFinalReportForm from "./useFinalReportForm";
import "./FinalReportGrid.css";
import "./Modal/Modal.css"

export default function FinalReportGrid() {

    const f = useFinalReportForm();
    const navigate = useNavigate();
    const goCreatePage = () => {
        navigate("/final-report/create", {
            state: {
                projectName: f.projectName,
                template: f.template,
                sections: f.sections,
                sources: f.sources,
            },
        });
    };

    return (
        <section className="card final-report-card">
            <div className="final-report-meta">
                <div className="final-report-meta-left">
                    <input
                        className="fr-project-input"
                        value={f.projectName}
                        onChange={(e) => f.setProjectName(e.target.value)}
                        placeholder="프로젝트 명을 입력하세요"
                    />
                </div>

                <div className="final-report-meta-right">
                    <span>진행률: <b>100%</b></span>
                    <span>상태: <b>DONE</b></span>
                    <span>완료일자: <b>2026-01-16</b></span>
                </div>
            </div>

            {/* body: 버튼 우측 하단 */}
            <div className="final-report-body">
                <div className="final-report-step">
                    <b>1. 템플릿 선택</b>
                    <button type="button" className="fr-select-btn" onClick={f.openTemplate}>
                        {f.template} <span className="fr-caret">▼</span>
                    </button>
                </div>

                <div className="final-report-step">
                    <b>2. 포함할 섹션 선택</b>
                    <button type="button" className="fr-select-btn" onClick={f.openSections}>
                        {f.summary(f.sections)} <span className="fr-caret">▼</span>
                    </button>
                </div>

                <div className="final-report-step">
                    <b>3. 근거 소스 선택</b>
                    <button type="button" className="fr-select-btn" onClick={f.openSources}>
                        {f.summary(f.sources)} <span className="fr-caret">▼</span>
                    </button>
                </div>

                {/* 버튼: 우측 하단으로 갈 액션 영역 */}
                <div className="final-report-actions">
                    <button className="final-report-btn" type="button" onClick={goCreatePage}>
                        최종 리포트 생성
                    </button>
                </div>
            </div>

            <ChoiceModal
                open={f.modal.open}
                title={f.modal.title}
                mode={f.modal.mode}
                options={f.modal.options}
                value={f.value}
                onChange={f.setValue}
                onClose={f.closeModal}
            />
        </section>
    );
}
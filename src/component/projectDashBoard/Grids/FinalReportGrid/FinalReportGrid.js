import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChoiceModal from "./Modal/ChoiceModal";
import useFinalReportForm from "./useFinalReportForm";
import {api} from "../../../../utils/api";
import "./FinalReportGrid.css";
import "./Modal/Modal.css"

export default function FinalReportGrid({projectId}) {

    const f = useFinalReportForm();
    const navigate = useNavigate();

    const [ existingReport, setExistingReport] = useState(null);
    const [loading, setLoading] = useState(true);

    // 컴포넌트 마운트 시 최종 리포트 조회
    useEffect(() => {
        if(!projectId) return;

        const fetchFinalReport = async () => {
            try{
                // 백엔드 GET API 호출
                const res = await api.get(`/api/projects/${projectId}/final-reports`);
                // 데이터가 있으면 상태 업데이트
                if(res && res.finalReportId){
                    setExistingReport(res);
                }
            }catch (error){
                console.error("최종 리포트 조회 실패: ", error);
            }finally{
                setLoading(false);
            }
        };

        fetchFinalReport();
    }, [projectId]);

    // 기존 리포트 보러가기 핸들러
    const goViewReport = () => {
        if(!existingReport) return;
        navigate("/final-report/create",{
            state: {
                finalReportId: existingReport.finalReportId,
                projectId: projectId,
                mode: "VIEW"
            },
        });
    };

    const goCreatePage = () => {
        navigate("/final-report/create", {
            state: {
                projectName: f.projectName,
                template: f.template,
                sections: f.sections,
                sources: f.sources,
                projectId: projectId,
            },
        });
    };

    if(loading){
        return <div classNAme="final-report-loading">로딩 중...</div>;
    }

    if (existingReport) {
        return (
            <section className="card final-report-card existing-mode">
                <div className="final-report-header">
                    <h3>🎉 최종 리포트가 생성되었습니다.</h3>
                </div>
                
                <div className="final-report-info-box">
                    <div className="report-info-row">
                        <span className="info-label">문서 제목</span>
                        {/* Title에 하이퍼링크(클릭 이벤트) 적용 */}
                        <span className="info-value link-title" onClick={goViewReport}>
                            {existingReport.title || "제목 없음"} 🔗
                        </span>
                    </div>
                    
                    <div className="report-info-row">
                        <span className="info-label">작성자</span>
                        <span className="info-value">{existingReport.createdBy}</span>
                    </div>
                    
                    <div className="report-info-row">
                        <span className="info-label">작성일(createAt)</span>
                        <span className="info-value">
                            {existingReport.createdAt 
                                ? new Date(existingReport.createdAt).toLocaleDateString() 
                                : "-"}
                        </span>
                    </div>
                </div>

                <div className="final-report-actions">
                    <button className="final-report-btn view-btn" onClick={goViewReport}>
                        리포트 열람 / 수정
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="card final-report-card">
            <div className="final-report-meta">
                <div className="final-report-meta-right">
                    <span>진행률: <b>100%</b></span>
                    <span>상태: <b>DONE</b></span>
                    <span>완료일자: <b>{new Date().toISOString().split('T')[0]}</b></span>
                </div>
            </div>

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
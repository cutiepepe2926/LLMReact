import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChoiceModal from "./Modal/ChoiceModal";
import useFinalReportForm from "./useFinalReportForm";
import {api} from "../../../../utils/api";
import "./FinalReportGrid.css";
import "./Modal/Modal.css"

export default function FinalReportGrid({projectId, project}) {

    const f = useFinalReportForm();
    const navigate = useNavigate();

    const [myReports, setMyReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // 컴포넌트 마운트 시 내 최종 리포트 목록 조회
    useEffect(() => {
        if(!projectId) return;

        const fetchFinalReports = async () => {
            try{
                const res = await api.get(`/api/projects/${projectId}/final-reports`);
                
                if (Array.isArray(res)) {
                    setMyReports(res);
                } else if (res && res.finalReportId) {
                    setMyReports([res]);
                } else {
                    setMyReports([]);
                }
            }catch (error){
                console.error("최종 리포트 조회 실패: ", error);
            }finally{
                setLoading(false);
            }
        };

        fetchFinalReports();
    }, [projectId]);

    // report 객체 전체를 인자로 받음
    const goViewReport = (report) => {
        if(!report) return;
        navigate("/final-report/create",{
            state: {
                finalReportId: report.finalReportId,
                projectId: projectId,
                title: report.title, // 제목 정보를 함께 전달
                mode: "VIEW"
            },
        });
    };

    const goCreatePage = () => {
        if(myReports.length >= 7) {
            alert("최종 리포트는 최대 7개까지만 생성할 수 있습니다.");
            return;
        }

        navigate("/final-report/create", {
            state: {
                projectId: projectId,
                projectName: f.projectName,
                template: f.template,
                sections: f.sections,
                title: "새 리포트", // 신규 생성 시 기본 제목 전달
            },
        });
    };

    if(loading){
        return <div className="final-report-loading">로딩 중...</div>;
    }

    if (project?.status !== "DONE") {
        return (
            <section className="card final-report-card centered-message">
                 <div className="message-content">
                    <span className="msg-title">프로젝트가 완료되지 않았습니다</span>
                    <span className="msg-desc">(상태가 'DONE'인 프로젝트만 최종 리포트를 생성할 수 있습니다)</span>
                 </div>
            </section>
        );
    }

    return (
        <section className="card final-report-card">
            <div className="final-report-create-section">
                <div className="fr-header">
                    <h3>최종 리포트 생성</h3>
                    <div className="fr-status-badge">
                        STATUS: <b>DONE</b>
                    </div>
                </div>

                {myReports.length < 7 ? (
                    <div className="fr-controls-container">
                        <div className="fr-control-item">
                            <span className="fr-label">1. 템플릿</span>
                            <button type="button" className="fr-select-btn" onClick={f.openTemplate}>
                                {f.template} <span className="fr-caret">▼</span>
                            </button>
                        </div>

                        <div className="fr-control-item">
                            <span className="fr-label">2. 섹션 선택</span>
                            <button type="button" className="fr-select-btn" onClick={f.openSections}>
                                {f.summary(f.sections)} <span className="fr-caret">▼</span>
                            </button>
                        </div>

                        <div className="fr-action-item">
                            <button className="final-report-btn create-btn" type="button" onClick={goCreatePage}>
                                리포트 생성
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="fr-limit-reached">
                        생성 한도(7개)에 도달했습니다. 기존 리포트를 수정하거나 삭제하세요.
                    </div>
                )}
            </div>

            <hr className="final-report-divider" />

            <div className="final-report-list-section">
                <h4>내 리포트 목록 ({myReports.length}/7)</h4>
                
                {myReports.length === 0 ? (
                    <div className="fr-empty-list">
                        생성된 리포트가 없습니다. 위에서 새로 생성해보세요!
                    </div>
                ) : (
                    <div className="fr-list-container">
                        {myReports.map((report, index) => (
                            // onClick에 report 객체 전체 전달
                            <div key={report.finalReportId} className="fr-list-item" onClick={() => goViewReport(report)}>
                                <div className="fr-item-left">
                                    <span className="fr-index">#{index + 1}</span>
                                    <span className="fr-title">{report.title || "제목 없는 리포트"}</span>
                                </div>
                                <div className="fr-item-right">
                                    <span className="fr-date">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "-"}
                                    </span>
                                    <button className="fr-arrow-btn">➜</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
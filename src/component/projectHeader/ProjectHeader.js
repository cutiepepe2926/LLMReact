import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectHeader.css";

export default function ProjectHeader({
      title = "프로젝트 제목입니다",
      dDay = 10,
      periodText = "기간: 2026.01.01 ~ 2026.02.02",
    }) {

    const navigate = useNavigate();

    const onClickAiReport = () => {
        navigate("/aiReport");
    }

    return (
        <section className="project-header">
            <div>
                <div className="title-row">
                    <h1 className="project-title">{title}</h1>
                    <span className="d-day-badge">D - {dDay}</span>
                </div>
                <p className="project-period">{periodText}</p>
            </div>

            <button className="ai-report-btn-glow" onClick={onClickAiReport}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>AI 리포트</span>
            </button>
        </section>
    );
}

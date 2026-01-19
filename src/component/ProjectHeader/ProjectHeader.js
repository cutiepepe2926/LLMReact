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

            <button className="ai-button" onClick={onClickAiReport}>
                AI 리포트
            </button>
        </section>
    );
}

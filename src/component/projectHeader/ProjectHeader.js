import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectHeader.css";

export default function ProjectHeader({ project }) {

    const navigate = useNavigate();

    console.log(project); //디버깅 용 로그

    const onClickAiReport = () => {
        navigate("/aiReport");
    }

    // 1. D-Day 계산 함수 (endDate - 현재 날짜)
    // useMemo를 사용하여 project 정보가 바뀔 때만 재계산하도록 합니다.
    const dDayLabel = useMemo(() => {
        // 데이터가 없으면 계산하지 않음
        if (!project || !project.endDate) return "-";

        const today = new Date();
        const end = new Date(project.endDate);

        // 시간 오차 제거
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "D-Day";
        return diffDays > 0 ? `D - ${diffDays}` : `D + ${Math.abs(diffDays)}`;
    }, [project]);

    // 2. 날짜 포맷팅 함수 (2026-01-01 -> 2026.01.01)
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return dateString.split('T')[0].replace(/-/g, '.');
    };

    // [중요] 데이터가 없을 때 빈 화면(null) 대신 로딩 중 표시 (흰 화면 방지)
    if (!project) {
        return (
            <section className="project-header">
                <div><h1 className="project-title">프로젝트 정보를 불러오는 중...</h1></div>
            </section>
        );
    }

    return (
        <section className="project-header">
            <div>
                <div className="title-row">
                    {/* 프로젝트 이름 표시 */}
                    <h1 className="project-title">{project.name}</h1>
                    {/* 계산된 D-Day 표시 */}
                    <span className="d-day-badge">{dDayLabel}</span>
                </div>
                {/* 기간 표시 (startDate ~ endDate) */}
                <p className="project-period">
                    기간: {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
                </p>
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

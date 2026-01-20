// src/component/memberSettingsGrid/MemberSettingsGrid.js
import React, {useState} from "react";
import MemberMiniGrid from "./MemberMiniGrid/MemberMiniGrid";
import "./MemberSettingsGrid.css";
import {MEMBER_DEMO_LIST} from "./MemberSettingsGridDemoData";

const SUB_TABS = [
    { key: "members", label: "멤버 관리 설정" },
    { key: "project", label: "프로젝트 설정" },
    { key: "notify", label: "알림/연동 설정" },
    { key: "security", label: "권한/보안 설정" },
];

export default function MemberSettingsGrid() {
    const [activeSub, setActiveSub] = useState("members");
    return (
        <section className="ms-wrap">
            {/* 내부 탭 */}
            <div className="ms-subtabs">
                {SUB_TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={`ms-subtab-btn ${activeSub === t.key ? "active" : ""}`}
                        onClick={() => setActiveSub(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="ms-panel">
                {activeSub === "members" && <MemberMiniGrid member={MEMBER_DEMO_LIST} />}

                {activeSub === "project" && (
                    <div className="ms-empty">프로젝트 설정 그리드(추가 예정)</div>
                )}

                {activeSub === "notify" && (
                    <div className="ms-empty">알림/연동 설정 그리드(추가 예정)</div>
                )}

                {activeSub === "security" && (
                    <div className="ms-empty">권한/보안 설정 그리드(추가 예정)</div>
                )}
            </div>
        </section>
    );
}

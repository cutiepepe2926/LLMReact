// src/component/memberSettingsGrid/MemberSettingsGrid.js
import React, {useState} from "react";
import MemberMiniGrid from "./MemberMiniGrid/MemberMiniGrid";
import PermissionMiniGrid from "./PermissionMiniGrid/PermissionMiniGrid";
import {MEMBER_DEMO_LIST} from "./MemberSettingsGridDemoData";
import "./MemberSettingsGrid.css";
import NotifyIntegrationMiniGrid from "./NotifyIntegrationMiniGrid/NotifyIntegrationMiniGrid";
import ProjectSettingsMiniGrid from "./ProjectSettingsMiniGrid/ProjectSettingsMiniGrid";


export default function MemberSettingsGrid() {

    const [activeSub, setActiveSub] = useState("members");

    const SUB_TABS = [
        { key: "members", label: "멤버 관리 설정" },
        { key: "project", label: "프로젝트 설정" },
        { key: "notify", label: "알림/연동 설정" },
        { key: "security", label: "권한/보안 설정" },
    ];

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
                {activeSub === "members" && <MemberMiniGrid members={MEMBER_DEMO_LIST} />}

                {activeSub === "project" && <ProjectSettingsMiniGrid />}

                {activeSub === "notify" && <NotifyIntegrationMiniGrid />}

                {activeSub === "security" && (
                    <PermissionMiniGrid onCancel={() => setActiveSub("members")} />
                )}
            </div>
        </section>
    );
}

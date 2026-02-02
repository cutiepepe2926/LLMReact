// src/component/memberSettingsGrid/MemberSettingsGrid.js
import React, { useState, useEffect, useCallback } from "react";
import MemberMiniGrid from "./MemberMiniGrid/MemberMiniGrid";
// import PermissionMiniGrid from "./PermissionMiniGrid/PermissionMiniGrid";
// import NotifyIntegrationMiniGrid from "./NotifyIntegrationMiniGrid/NotifyIntegrationMiniGrid";
import ProjectSettingsMiniGrid from "./ProjectSettingsMiniGrid/ProjectSettingsMiniGrid";
import { api } from "../../../../utils/api";
import "./MemberSettingsGrid.css";

export default function MemberSettingsGrid({project, onProjectUpdate}) {

    const [activeSub, setActiveSub] = useState("members");
    const [members, setMembers] = useState([]);
    const [myRole, setMyRole] = useState("MEMBER");

    console.log("멤버세팅이다.");
    console.log(project);

    const SUB_TABS = [
        { key: "members", label: "멤버 관리 설정" },
        { key: "project", label: "프로젝트 설정" },
        // { key: "notify", label: "알림/연동 설정" },
        // { key: "security", label: "권한/보안 설정" },
    ];

    // 멤버 목록 불러오기 및 가공
    const fetchMembers = useCallback(async () => {
        if (!project?.projectId) return;

        try {
            const data = await api.get(`/api/projects/${project.projectId}/members`);

            // 1. 내 정보 찾기 (서버가 보내준 status: 'me' 활용)
            const me = data.find(m => m.status === 'me');
            if (me) {
                setMyRole(me.role);
            }

            // 2. 데이터 가공 (UI 요구사항 반영)
            const processed = data.map(m => {
                // 상태 변환: 'ACTIVE'나 'me'는 'JOINED'로 표시
                let displayStatus = m.status;
                if (m.status === 'ACTIVE' || m.status === 'me') {
                    displayStatus = 'JOINED';
                }

                return {
                    ...m,
                    // 닉네임(아이디) 형식
                    displayName: `${m.name}(${m.userId})`,
                    displayStatus: displayStatus,
                    // 로직용 원본 데이터 보존
                    isMe: m.status === 'me',
                };
            });

            // 3. 정렬 (1순위: OWNER, 2순위: 나, 3순위: 나머지)
            processed.sort((a, b) => {
                // OWNER 우선
                if (a.role === 'OWNER') return -1;
                if (b.role === 'OWNER') return 1;

                // 그 다음 '나' 우선
                if (a.isMe) return -1;
                if (b.isMe) return 1;

                return 0; // 나머지는 순서 유지 (또는 가입일순)
            });

            setMembers(processed);

        } catch (error) {
            console.error("멤버 목록 로딩 실패:", error);
        }
    }, [project]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

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

                {activeSub === "members" && (
                    <MemberMiniGrid
                        members={members}
                        myRole={myRole}
                        projectId={project.projectId}
                        onRefresh={fetchMembers} // 멤버 목록 갱신
                    />
                )}

                {activeSub === "project" && (
                    <ProjectSettingsMiniGrid
                        project={project}          // [필수] 현재 프로젝트 데이터
                        myRole={myRole}     // 역할
                        onRefresh={onProjectUpdate}   // 프로젝트 정보 갱신 함수 전달
                    />
                )}

                {/*{activeSub === "notify" && <NotifyIntegrationMiniGrid />}*/}

                {/*{activeSub === "security" && (*/}
                {/*    <PermissionMiniGrid onCancel={() => setActiveSub("members")} />*/}
                {/*)}*/}
            </div>
        </section>
    );
}

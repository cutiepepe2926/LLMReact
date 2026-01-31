import React, { useState, useEffect } from "react";
import RoleChangeModal from "./RoleChangeModal/RoleChangeModal";
import ConfirmModal from "./RoleChangeModal/ConfirmModal";
import MemberActionModal from "./MemberActionModal/MemberActionModal";
import InviteMemberModal from "./InviteMemberModal/InviteMemberModal";
import { api } from "../../../../../utils/api";
import "./MemberMiniGrid.css";

// myRole이 다시 포함되었습니다.
export default function MemberMiniGrid({ members = [], myRole, projectId, onRefresh }) {

    const [list, setList] = useState(members);
    useEffect(() => setList(members), [members]);

    // 모달 상태 관리
    const [target, setTarget] = useState(null);
    const [selectedRole, setSelectedRole] = useState("MEMBER");

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionDoneOpen, setActionDoneOpen] = useState(false);
    const [actionLabel, setActionLabel] = useState("");
    const [inviteOpen, setInviteOpen] = useState(false);

    const DEFAULT_PROFILE = "/img/Profile.svg";

    // 1. 역할 변경 가능 여부 판단 (myRole 사용)
    const canEditRole = (m) => {
        if (m.role === 'OWNER') return false;
        if (m.isMe) return false;
        if (m.status === 'INVITED' || m.displayStatus === 'INVITED') return false;

        if (myRole === 'OWNER') return true;
        if (myRole === 'ADMIN') return m.role !== 'ADMIN';
        return false;
    };

    // 2. 역할 배지 클릭 핸들러
    const onRoleBadgeClick = (m) => {
        if (!canEditRole(m)) return;
        setTarget(m);
        setSelectedRole(m.role);
        setRoleModalOpen(true);
    };

    // 3. 역할 변경 API 호출
    const handleRoleChange = async () => {
        if (!target) return;
        try {
            await api.patch(`/api/projects/${projectId}/members/role`, {
                targetUserId: target.userId,
                role: selectedRole
            });
            setRoleModalOpen(false);
            setTarget(null);
            alert("역할이 성공적으로 변경되었습니다.");
            if (onRefresh) onRefresh();
        } catch (error) {
            alert(error.message || "역할 변경에 실패했습니다.");
        }
    };

    // 4. 멤버 작업(추방/나가기/초대취소) API 호출
    const onConfirmAction = async () => {
        if (!target) return;
        try {
            await api.post(`/api/projects/${projectId}/members/remove`, {
                targetUserId: target.userId,
                action: actionLabel
            });
            setActionModalOpen(false);
            setActionDoneOpen(true);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert("작업 실패: " + (error.message || "오류가 발생했습니다."));
            setActionModalOpen(false);
        }
    };

    // 5. 멤버 초대 API 호출
    const handleInvite = async (userId) => {
        try {
            await api.post(`/api/projects/${projectId}/members/invite`, {
                userId: userId
            });
            alert("초대가 발송되었습니다.");
            setInviteOpen(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert("초대 실패: " + (error.message || "오류가 발생했습니다."));
        }
    };

    // 작업 버튼 렌더링 (myRole 사용)
    const renderActions = (m) => {
        if (m.role === 'OWNER') return <span className="mm-disabled">[비활성화]</span>;

        const buttons = [];
        if (m.isMe) {
            buttons.push(
                <button key="leave" type="button" className="mm-link"
                        onClick={() => { setTarget(m); setActionLabel("나가기"); setActionModalOpen(true); }}
                >[나가기]</button>
            );
        }

        if (myRole === 'ADMIN' || myRole === 'OWNER') {
            if (m.status === 'INVITED' || m.displayStatus === 'INVITED') {
                buttons.push(
                    <button key="cancel" type="button" className="mm-link"
                            onClick={() => { setTarget(m); setActionLabel("초대취소"); setActionModalOpen(true); }}
                    >[초대취소]</button>
                );
            }
            if ((m.status === 'ACTIVE' || m.displayStatus === 'JOINED') && !m.isMe && m.role !== 'OWNER') {
                buttons.push(
                    <button key="kick" type="button" className="mm-link"
                            onClick={() => { setTarget(m); setActionLabel("추방"); setActionModalOpen(true); }}
                    >[추방]</button>
                );
            }
        }
        return buttons;
    };

    return (
        <>
            <div className="mm-card">
                <div className="mm-header-row">
                    <div>프로필</div>
                    <div>닉네임(아이디)</div>
                    <div>역할</div>
                    <div>상태</div>
                    <div>작업</div>
                </div>

                <div className="mm-body">
                    {list.map((m) => (
                        <div className="mm-row" key={m.userId}>
                            <div className="mm-avatar-wrapper">
                                <img
                                    src={m.filePath || DEFAULT_PROFILE}
                                    alt="profile"
                                    className="mm-avatar-img"
                                    onError={(e) => { e.target.src = DEFAULT_PROFILE; }}
                                />
                            </div>
                            <div className="mm-name">{m.displayName}</div>

                            <div className="mm-role">
                                {canEditRole(m) ? (
                                    <button type="button" className="mm-role-btn clickable" onClick={() => onRoleBadgeClick(m)}>
                                        [{m.role}] ▼
                                    </button>
                                ) : (
                                    <span className="mm-pill">[{m.role}]</span>
                                )}
                            </div>

                            <div className="mm-status">
                                <span className={`mm-pill ${m.displayStatus === 'INVITED' ? 'invited' : ''}`}>
                                    [{m.displayStatus}]
                                </span>
                            </div>

                            <div className="mm-action">
                                {renderActions(m)}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '10px', textAlign: 'right' }}>
                    {(myRole === 'ADMIN' || myRole === 'OWNER') && (
                        <button className="member-invite" onClick={() => setInviteOpen(true)}>
                            +
                        </button>
                    )}
                </div>
            </div>

            <RoleChangeModal
                open={roleModalOpen}
                targetName={target?.displayName || ""}
                value={selectedRole}
                onChange={setSelectedRole}
                onConfirm={handleRoleChange}
                onCancel={() => { setRoleModalOpen(false); setTarget(null); }}
            />

            <MemberActionModal
                open={actionModalOpen}
                actionLabel={actionLabel}
                onConfirm={onConfirmAction}
                onCancel={() => setActionModalOpen(false)}
            />

            <ConfirmModal
                open={actionDoneOpen}
                message={`${actionLabel} 처리가 완료되었습니다.`}
                onClose={() => setActionDoneOpen(false)}
            />

            <InviteMemberModal
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onInvite={handleInvite}
            />
        </>
    );
}
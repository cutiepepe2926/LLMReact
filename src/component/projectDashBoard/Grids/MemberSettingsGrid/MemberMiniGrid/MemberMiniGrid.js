import React from "react";
import RoleChangeModal from "./RoleChangeModal/RoleChangeModal";
import ConfirmModal from "./RoleChangeModal/ConfirmModal";
import MemberActionModal from "./MemberActionModal/MemberActionModal";
import "./MemberMiniGrid.css";


export default function MemberMiniGrid({ members = [] }) {
    const [list, setList] = React.useState(members);
    React.useEffect(() => setList(members), [members]);

    const [target, setTarget] = React.useState(null);
    const [selectedRole, setSelectedRole] = React.useState("MEMBER");
    const [roleModalOpen, setRoleModalOpen] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [actionModalOpen, setActionModalOpen] = React.useState(false);
    const [actionDoneOpen, setActionDoneOpen] = React.useState(false);
    const [actionLabel, setActionLabel] = React.useState(""); // "추방", "나가기", "초대취소"


    const openRoleModal = (m) => {
        setTarget(m);
        setSelectedRole(m.role);
        setRoleModalOpen(true);
    };

    const onConfirmAction = () => {
        setActionModalOpen(false);
        setActionDoneOpen(true);
    };


    const closeRoleModal = () => {
        setRoleModalOpen(false);
        setTarget(null);
    };

    const applyRoleChange = () => {
        if (!target || target.type === "owner") return closeRoleModal();

        setList((prev) =>
            prev.map((u) => (u.id === target.id ? { ...u, role: selectedRole } : u))
        );

        closeRoleModal();
        setConfirmOpen(true);
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
                        <div className="mm-row" key={m.id}>
                            <div className={`mm-avatar ${m.type}`} />
                            <div className="mm-name">{m.name}</div>

                            <div className="mm-role">
                                {m.type === "owner" ? (
                                    <span className="mm-pill">[OWNER]</span>
                                ) : (
                                    <button type="button" className="mm-role-btn" onClick={() => openRoleModal(m)}>
                                        [{m.role}] ▼
                                    </button>
                                )}
                            </div>

                            <div className="mm-status">
                                <span className="mm-pill">[{m.status}]</span>
                            </div>

                            <div className="mm-action">
                                {m.type === "owner" && <span className="mm-disabled">[비활성화]</span>}

                                {m.type === "admin" && (
                                    <button
                                        type="button"
                                        className="mm-link"
                                        onClick={() => {
                                            setActionLabel("추방");
                                            setActionModalOpen(true);
                                        }}
                                    >
                                        [추방]
                                    </button>
                                )}

                                {m.type === "me" && (
                                    <button
                                        type="button"
                                        className="mm-link"
                                        onClick={() => {
                                            setActionLabel("나가기");
                                            setActionModalOpen(true);
                                        }}
                                    >
                                        [나가기]
                                    </button>
                                )}

                                {m.type === "invited" && (
                                    <button
                                        type="button"
                                        className="mm-link"
                                        onClick={() => {
                                            setActionLabel("초대취소");
                                            setActionModalOpen(true);
                                        }}
                                    >
                                        [초대취소]
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <RoleChangeModal
                open={roleModalOpen && !!target}
                targetName={target?.name ?? ""}
                value={selectedRole}
                onChange={setSelectedRole}
                onConfirm={applyRoleChange}
                onCancel={closeRoleModal}
            />

            <ConfirmModal
                open={confirmOpen}
                message="역할이 변경되었습니다."
                onClose={() => setConfirmOpen(false)}
            />

            <MemberActionModal
                open={actionModalOpen}
                actionLabel={actionLabel}
                onConfirm={onConfirmAction}
                onCancel={() => setActionModalOpen(false)}
            />

            <ConfirmModal
                open={actionDoneOpen}
                message="수행되었습니다."
                onClose={() => setActionDoneOpen(false)}
            />

        </>
    );
}

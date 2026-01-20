import React from "react";
import "./PermissionMiniGrid.css";

const ROLES = ["OWNER", "ADMIN", "MEMBER"];

const PERMISSIONS = [
    { key: "project_manage", label: "프로젝트 수정/삭제" },
    { key: "member_manage", label: "멤버 초대/추방/역할변경" },
    { key: "task_manage", label: "업무 생성/수정/삭제" },
    { key: "github_link", label: "GitHub 연동/해제" },
];

// ✅ 데모 기본값 (그림 느낌)
const DEFAULT_MATRIX = {
    project_manage: { OWNER: true, ADMIN: true, MEMBER: false },
    member_manage:  { OWNER: true, ADMIN: true, MEMBER: false },
    task_manage:    { OWNER: true, ADMIN: true, MEMBER: true },
    github_link:    { OWNER: true, ADMIN: false, MEMBER: false },
};

export default function PermissionMiniGrid({ onCancel }) {
    const [matrix, setMatrix] = React.useState(DEFAULT_MATRIX);
    const [open, setOpen] = React.useState(false);

    const toggle = (permKey, role) => {
        if (role === "OWNER") return;
        setMatrix((prev) => ({
            ...prev,
            [permKey]: {
                ...prev[permKey],
                [role]: !prev[permKey][role],
            },
        }));
    };

    const onSave = () => {
        // TODO: 실제 API 붙일 땐 여기서 요청
        setOpen(true);
    };

    return (
        <>
            <div className="pmg-wrap">
                <div className="pmg-card">
                    <div className="pmg-grid">
                        <div className="pmg-head pmg-left">권한 항목</div>
                        {ROLES.map((r) => (
                            <div key={r} className="pmg-head pmg-center">{r}</div>
                        ))}

                        {PERMISSIONS.map((p) => (
                            <React.Fragment key={p.key}>
                                <div className="pmg-left pmg-row-title">{p.label}</div>
                                {ROLES.map((r) => (
                                    <div key={r} className="pmg-center">
                                        <button
                                            type="button"
                                            className={`pmg-check ${matrix[p.key][r] ? "on" : "off"} ${r === "OWNER" ? "locked" : ""}`}
                                            onClick={() => toggle(p.key, r)}
                                            disabled={r === "OWNER"}
                                            aria-label={`${p.label} - ${r}`}
                                        >
                                            {matrix[p.key][r] ? "✓" : "✕"}
                                        </button>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="pmg-actions">
                        <button type="button" className="pmg-btn primary" onClick={onSave}>
                            저장
                        </button>
                        <button type="button" className="pmg-btn" onClick={onCancel}>
                            취소
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ 확인용 모달 */}
            {open && (
                <div className="pmg-modal-backdrop" onClick={() => setOpen(false)}>
                    <div className="pmg-modal" onClick={(e) => e.stopPropagation()}>
                        <p className="pmg-modal-text">권한이 설정되었습니다.</p>
                        <button className="pmg-btn primary" type="button" onClick={() => setOpen(false)}>
                            확인
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

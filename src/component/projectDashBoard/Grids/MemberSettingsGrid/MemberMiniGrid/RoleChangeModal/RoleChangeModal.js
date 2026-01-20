import React from "react";

export default function RoleChangeModal({
                                            open,
                                            targetName,
                                            value,
                                            onChange,
                                            onConfirm,
                                            onCancel,
                                        }) {
    if (!open) return null;

    return (
        <div className="mm-modal-backdrop" onClick={onCancel}>
            <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-title">[역할 변경]</div>

                <div className="mm-modal-body">
                    <div>
                        대상 : <b>{targetName}</b>
                    </div>

                    <div className="mm-modal-role">
                        역할 :
                        <label className="mm-radio">
                            <input
                                type="radio"
                                name="role"
                                value="ADMIN"
                                checked={value === "ADMIN"}
                                onChange={() => onChange("ADMIN")}
                            />
                            ADMIN
                        </label>

                        <label className="mm-radio">
                            <input
                                type="radio"
                                name="role"
                                value="MEMBER"
                                checked={value === "MEMBER"}
                                onChange={() => onChange("MEMBER")}
                            />
                            MEMBER
                        </label>
                    </div>
                </div>

                <div className="mm-modal-actions">
                    <button type="button" className="mm-modal-btn" onClick={onConfirm}>
                        네
                    </button>
                    <button type="button" className="mm-modal-btn" onClick={onCancel}>
                        아니요
                    </button>
                </div>
            </div>
        </div>
    );
}

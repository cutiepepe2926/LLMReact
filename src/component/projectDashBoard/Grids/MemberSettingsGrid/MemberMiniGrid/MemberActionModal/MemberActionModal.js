import React from "react";

export default function MemberActionModal({ open, actionLabel, onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="mm-modal-backdrop" onClick={onCancel}>
            <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-title">멤버 작업 미니 팝업</div>

                <div className="mm-modal-body">
                    <div>
                        정말 <b>{actionLabel}</b> 하시겠습니까?
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

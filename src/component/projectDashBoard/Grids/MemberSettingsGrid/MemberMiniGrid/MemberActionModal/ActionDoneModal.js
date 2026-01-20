import React from "react";

export default function ActionDoneModal({ open, message, onClose }) {
    if (!open) return null;

    return (
        <div className="mm-modal-backdrop" onClick={onClose}>
            <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-title">알림</div>
                <div className="mm-modal-body">{message}</div>
                <div className="mm-modal-actions">
                    <button type="button" className="mm-modal-btn" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

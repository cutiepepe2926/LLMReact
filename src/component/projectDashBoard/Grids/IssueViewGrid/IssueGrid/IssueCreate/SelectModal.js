import React from "react";
import "./SelectModal.css";

export default function SelectModal({
                                        title,
                                        options,
                                        value,
                                        onChange,
                                        onClose,
                                    }) {
    const handleOverlay = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handlePick = (v) => {
        onChange(v);
    };

    return (
        <div className="select-modal-overlay" onMouseDown={handleOverlay}>
            <div className="select-modal" role="dialog" aria-modal="true">
                {/* 헤더 */}
                <div className="select-modal-header">
                    <h3 className="select-modal-title">{title}</h3>
                    <button type="button" className="select-modal-x" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* 옵션 */}
                <div className="select-modal-body">
                    {options.map((opt) => {
                        const checked = value === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                className={`select-option ${checked ? "active" : ""}`}
                                onClick={() => handlePick(opt.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="select-option-checkbox"
                                />
                                <span className="select-option-label">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 푸터 */}
                <div className="select-modal-footer">
                    <button type="button" className="select-modal-close" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

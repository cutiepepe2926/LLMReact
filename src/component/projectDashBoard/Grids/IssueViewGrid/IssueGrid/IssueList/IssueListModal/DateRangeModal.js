// modal/DateRangeModal.js
import React, { useEffect, useState } from "react";
import "./DateRangeModal.css";

export default function DateRangeModal({
                                           open,
                                           title,
                                           startDate,
                                           endDate,
                                           onClose,
                                           onApply,
                                           onClear,
                                       }) {
    const [s, setS] = useState(startDate || "");
    const [e, setE] = useState(endDate || "");

    useEffect(() => {
        if (open) {
            setS(startDate || "");
            setE(endDate || "");
        }
    }, [open, startDate, endDate]);

    if (!open) return null;

    return (
        <div className="drm-overlay" onMouseDown={onClose}>
            <div className="drm-modal" onMouseDown={(ev) => ev.stopPropagation()}>
                <div className="drm-head">
                    <h3 className="drm-title">{title}</h3>
                </div>

                <div className="drm-body">
                    <div className="drm-row">
                        <label className="drm-label">시작</label>
                        <input className="drm-input" type="date" value={s} onChange={(ev) => setS(ev.target.value)} />
                    </div>

                    <div className="drm-row">
                        <label className="drm-label">종료</label>
                        <input className="drm-input" type="date" value={e} onChange={(ev) => setE(ev.target.value)} />
                    </div>

                    <div className="drm-hint">비워두면 전체 기간으로 동작합니다.</div>
                </div>

                <div className="drm-actions">
                    <button className="drm-btn gray" onClick={onClear}>초기화</button>
                    <button className="drm-btn" onClick={onClose}>취소</button>
                    <button
                        className="drm-btn primary"
                        onClick={() => onApply({ startDate: s, endDate: e })}
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}

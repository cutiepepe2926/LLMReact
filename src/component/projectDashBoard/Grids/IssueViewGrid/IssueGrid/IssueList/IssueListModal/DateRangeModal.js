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
                                           isSingle = false,
                                            minDate = null,
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
                    {/* [수정] 단일 모드(isSingle)가 아닐 때만 시작일 입력창 표시 */}
                    {!isSingle && (
                        <div className="drm-row">
                            <label className="drm-label">시작</label>
                            <input
                                className="drm-input"
                                type="date"
                                value={s}
                                onChange={(ev) => setS(ev.target.value)}
                                min={minDate} // 최소 날짜 적용
                            />
                        </div>
                    )}

                    <div className="drm-row">
                        {/* [수정] 단일 모드면 라벨을 '날짜'나 '마감일'로, 아니면 '종료'로 표시 */}
                        <label className="drm-label">{isSingle ? "날짜" : "종료"}</label>
                        <input
                            className="drm-input"
                            type="date"
                            value={e}
                            onChange={(ev) => setE(ev.target.value)}
                            min={minDate} // [핵심] 오늘 이전 날짜 선택 방지
                        />
                    </div>

                    {/* 단일 모드일 때는 전체 기간 힌트 숨김 */}
                    {!isSingle && <div className="drm-hint">비워두면 전체 기간으로 동작합니다.</div>}
                </div>

                <div className="drm-actions">
                    <button className="drm-btn gray" onClick={onClear}>초기화</button>
                    <button className="drm-btn" onClick={onClose}>취소</button>
                    <button
                        className="drm-btn primary"
                        // 단일 모드여도 endDate(e)에 값을 담아 보내므로 기존 로직 호환됨
                        onClick={() => onApply({ startDate: s, endDate: e })}
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}

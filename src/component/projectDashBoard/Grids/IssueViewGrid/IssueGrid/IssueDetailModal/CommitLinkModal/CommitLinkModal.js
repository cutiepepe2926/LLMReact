// CommitLinkModal.js
import React from "react";
import "./CommitLinkModal.css";

export default function CommitLinkModal({ open, onClose, issue }) {
    if (!open) return null;

    return (
        <div
            className="commit-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="commit-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="commit-modal-head">
                    <b>커밋 연결</b>
                    <button type="button" className="commit-x" onClick={onClose}>×</button>
                </div>

                <div className="commit-modal-body">
                    <p>
                        이슈 <b>#{issue?.id}</b> 에 커밋을 연결하는 임시 모달입니다.
                    </p>
                    <p>여기에 나중에 커밋 검색/선택 UI 잊지말기</p>
                </div>

                <div className="commit-modal-footer">
                    <button type="button" className="commit-close" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

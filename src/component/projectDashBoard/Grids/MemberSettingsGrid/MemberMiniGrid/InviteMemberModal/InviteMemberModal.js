import React from "react";

export default function InviteMemberModal({ open, onClose, onInvite }) {
    const [keyword, setKeyword] = React.useState("");

    React.useEffect(() => {
        if (open) setKeyword("");
    }, [open]);

    if (!open) return null;

    return (
        <div className="mm-modal-backdrop" onClick={onClose}>
            <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mm-modal-title">멤버 초대</div>

                <div className="mm-modal-body">
                    <div style={{ fontWeight: 800 }}>초대할 사용자(아이디/이름)</div>
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="예) user123"
                        style={{
                            width: "100%",
                            border: "1px solid rgba(0,0,0,0.12)",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            outline: "none",
                        }}
                    />
                </div>

                <div className="mm-modal-actions">
                    <button
                        type="button"
                        className="mm-modal-btn"
                        onClick={() => onInvite(keyword)}
                        disabled={!keyword.trim()}
                        style={{ opacity: keyword.trim() ? 1 : 0.5 }}
                    >
                        초대
                    </button>
                    <button type="button" className="mm-modal-btn" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

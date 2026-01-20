// SelectModal.js
export default function SelectModal({ open, title, options, value, onChange, onClose }) {
    if (!open) return null;

    return (
        <div
            className="select-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose(); // 바깥 클릭 닫기
            }}
        >
            <div className="select-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="select-modal-header">
                    <h3 className="select-modal-title">{title}</h3>
                    <button type="button" className="select-modal-x" onClick={onClose}>×</button>
                </div>

                <div className="select-modal-body">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`select-option ${value === opt.value ? "active" : ""}`}
                            onClick={() => onChange(opt.value)}
                        >
                            <input
                                className="select-option-checkbox"
                                type="checkbox"
                                readOnly
                                checked={value === opt.value}
                            />
                            <span className="select-option-label">{opt.label}</span>
                        </button>
                    ))}
                </div>

                <div className="select-modal-footer">
                    <button type="button" className="select-modal-close" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}

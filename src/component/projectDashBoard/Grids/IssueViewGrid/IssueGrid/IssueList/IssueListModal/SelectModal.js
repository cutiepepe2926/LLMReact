export default function SelectModal({ open, title, options, value, onChange, onClose }) {
    if (!open) return null;

    return (
        <div
            className="select-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose(); // ✅ 바깥 클릭만 닫기
            }}
        >
            <div className="select-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="select-head">
                    <h3>{title}</h3>
                    <button type="button" className="select-x" onClick={onClose}>×</button>
                </div>

                <div className="select-body">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`select-option ${value === opt.value ? "active" : ""}`}
                            onClick={() => onChange(opt.value)}
                        >
                            <input type="checkbox" readOnly checked={value === opt.value} />
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>

                <div className="select-actions">
                    <button type="button" className="select-close" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}

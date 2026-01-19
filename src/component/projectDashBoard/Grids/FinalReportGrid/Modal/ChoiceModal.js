import React from "react";

export default function ChoiceModal({ open, title, mode, options, value, onChange, onClose }) {
    if (!open) return null;

    const isMulti = mode === "multi";

    const toggle = (opt) => {
        if (isMulti) {
            const next = value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt];
            onChange(next);
        } else {
            onChange(opt);
        }
    };

    return (
        <div className="fr-modal-overlay" onClick={onClose} role="presentation">
            <div className="fr-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="fr-modal-header">
                    <b>{title}</b>
                    <button type="button" className="fr-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="fr-modal-body">
                    <div className="fr-check-list">
                        {options.map((opt) => {
                            const checked = isMulti ? value.includes(opt) : value === opt;
                            return (
                                <label key={opt} className="fr-check-item">
                                    <input
                                        type={isMulti ? "checkbox" : "radio"}
                                        name={isMulti ? undefined : "fr-radio-group"}
                                        checked={checked}
                                        onChange={() => toggle(opt)}
                                    />
                                    <span>{opt}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="fr-modal-footer">
                    <button type="button" className="fr-modal-ok" onClick={onClose}>
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}

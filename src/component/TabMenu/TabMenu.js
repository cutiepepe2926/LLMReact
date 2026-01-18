import React from "react";
import "./TabMenu.css";

export default function TabMenu({ tabs, activeKey, onChange }) {
    return (
        <nav className="tab-menu">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    className={`tab-btn ${activeKey === t.key ? "active" : ""}`}
                    onClick={() => onChange(t.key)}
                >
                    {t.label}
                </button>
            ))}
        </nav>
    );
}

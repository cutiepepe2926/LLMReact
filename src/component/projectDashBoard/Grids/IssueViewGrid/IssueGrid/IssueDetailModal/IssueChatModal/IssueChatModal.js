// IssueChatModal/IssueChatModal.js
import React, { useEffect, useRef, useState } from "react";
import "./IssueChatModal.css";

export default function IssueChatModal({ open, onClose, issue }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const endRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        // 첫 진입 시 안내 메시지 (원치 않으면 지워도 됨)
        setMessages((prev) =>
            prev.length
                ? prev
                : [
                    {
                        id: 1,
                        sender: "system",
                        body: `이슈 #${issue?.id} 채팅입니다. (임시 UI)`,
                        at: new Date().toLocaleTimeString(),
                    },
                ]
        );
    }, [open, issue?.id]);

    useEffect(() => {
        if (!open) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [open, messages]);

    if (!open) return null;

    const send = () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: "me",
                body: trimmed,
                at: new Date().toLocaleTimeString(),
            },
        ]);
        setText("");
    };

    return (
        <div
            className="issue-chat-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="issue-chat-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="issue-chat-head">
                    <div className="issue-chat-title">
                        이슈 채팅 <span className="issue-chat-sub">#{issue?.id}</span>
                    </div>
                    <button type="button" className="issue-chat-x" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="issue-chat-body">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`chat-row ${m.sender === "me" ? "me" : m.sender === "system" ? "system" : "other"}`}
                        >
                            <div className="chat-bubble">
                                <div className="chat-text">{m.body}</div>
                                <div className="chat-time">{m.at}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>

                <div className="issue-chat-input">
                    <input
                        className="chat-input"
                        value={text}
                        placeholder="메시지 입력..."
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                    />
                    <button type="button" className="chat-send" onClick={send}>
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}

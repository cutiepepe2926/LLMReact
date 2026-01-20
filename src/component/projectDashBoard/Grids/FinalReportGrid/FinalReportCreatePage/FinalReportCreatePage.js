// src/component/finalReportCreatePage/FinalReportCreatePage.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FinalReportCreatePage.css";

export default function FinalReportCreatePage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [mode, setMode] = React.useState("editor"); // editor | preview
    const [content, setContent] = React.useState(
        `# 최종 보고서\n\n- 프로젝트: ${state?.projectName ?? ""}\n- 템플릿: ${state?.template ?? ""}\n- 섹션: ${(state?.sections ?? []).join(", ")}\n- 소스: ${(state?.sources ?? []).join(", ")}\n\n여기에 보고서가 생성되고, 수정할 수 있어요.\n`
    );

    const [history, setHistory] = React.useState([content]);
    const [historyIdx, setHistoryIdx] = React.useState(0);

    const apply = () => {
        const next = [...history.slice(0, historyIdx + 1), content];
        setHistory(next);
        setHistoryIdx(next.length - 1);
    };

    const undo = () => {
        if (historyIdx <= 0) return;
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setContent(history[idx]);
    };

    // ---- chat (더미) ----
    const [messages, setMessages] = React.useState([
        { role: "assistant", text: "최종 보고서를 생성 중이에요..." },
    ]);
    const [input, setInput] = React.useState("");

    const send = () => {
        const text = input.trim();
        if (!text) return;

        setMessages((prev) => [
            ...prev,
            { role: "user", text },
            { role: "assistant", text: "확인했어요. (여기에 AI 응답 연결)" },
        ]);
        setInput("");
    };

    const save = () => {
        // TODO: PUT /final-reports/{reportId}/working 같은 API 붙이면 됨
        alert("저장(샘플) - API 연결 전");
    };

    return (
        <div className="frc-wrap">
            <header className="frc-header">
                <h2 className="frc-title">최종 보고서</h2>
                <button className="frc-close" type="button" onClick={() => navigate(-1)}>
                    ✕
                </button>
            </header>

            <div className="frc-grid">
                {/* LEFT */}
                <section className="frc-left">
                    <div className="frc-left-body">
                        {mode === "editor" ? (
                            <textarea
                                className="frc-editor"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        ) : (
                            <div className="frc-preview">
                                {content.split("\n").map((line, i) => (
                                    <div key={i}>{line || "\u00A0"}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="frc-left-actions">
                        <button type="button" className="frc-btn" onClick={apply}>적용</button>
                        <button type="button" className="frc-btn" onClick={undo}>되돌리기</button>
                        <button
                            type="button"
                            className="frc-btn"
                            onClick={() => setMode((m) => (m === "editor" ? "preview" : "editor"))}
                        >
                            {mode === "editor" ? "미리보기" : "에디터"}
                        </button>
                        <button type="button" className="frc-btn primary" onClick={save}>저장</button>
                    </div>
                </section>

                {/* RIGHT */}
                <section className="frc-right">
                    <div className="frc-chat">
                        <div className="frc-chat-list">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`frc-bubble ${m.role === "user" ? "user" : "assistant"}`}
                                >
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <div className="frc-chat-input">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="메시지를 입력하세요"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") send();
                                }}
                            />
                            <button type="button" onClick={send}>↥</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// src/component/projectDashBoard/Grids/FinalReportGrid/FinalReportCreatePage/FinalReportCreatePage.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../../../utils/api";
import "./FinalReportCreatePage.css";

export default function FinalReportCreatePage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // 데이터 추출
    const { projectId, template, sections, finalReportId, mode } = state || {};

    // --- State ---
    const [content, setContent] = useState("리포트를 불러오는 중입니다...");
    const [loading, setLoading] = useState(false);
    
    // 채팅 관련 State 복원
    const [messages, setMessages] = useState([
        { role: "assistant", text: "안녕하세요! 생성된 리포트에서 수정하고 싶은 부분이 있다면 말씀해주세요." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // --- Helper ---
    const mapTemplateToCode = (name) => {
        if (name === "포트폴리오 형식") return "PORTFOLIO";
        if (name === "기술문서 형식") return "TECHNICAL_DOC";
        return "PROJECT_REPORT"; 
    };

    // 스크롤 자동 이동
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- API: 리포트 조회/생성 ---
    useEffect(() => {
        if (!projectId) {
            alert("잘못된 접근입니다.");
            navigate(-1);
            return;
        }

        const fetchReport = async () => {
            setLoading(true);
            try {
                // [Case 1] 기존 리포트 열람 모드
                if (mode === "VIEW" || finalReportId) {
                    const res = await api.get(`/api/projects/${projectId}/final-reports`);
                    if (res && res.content) {
                        setContent(res.content);
                    }
                } 
                // [Case 2] 신규 생성 모드 (AI 호출)
                else {
                    const requestBody = {
                        reportType: mapTemplateToCode(template),
                        selectedSections: sections || [] 
                    };
                    
                    const res = await api.post(`/api/projects/${projectId}/final-reports`, requestBody);
                    setContent(res.content);
                }
            } catch (error) {
                console.error("리포트 로드 실패:", error);
                setContent("# 오류 발생\n리포트를 생성하거나 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [projectId, template, sections, finalReportId, mode, navigate]);

    // --- Handler: 채팅 전송 ---
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // TODO: 실제 백엔드 채팅 API 연결 필요 (현재는 더미 응답)
        // const res = await api.post(..., { message: input, currentContent: content });
        
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                text: "현재는 리포트 생성 기능만 지원하며, 대화형 수정 기능은 준비 중입니다. 에디터에서 직접 수정해 주세요!" 
            }]);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // --- Handler: 저장 (임시) ---
    const handleSave = () => {
        alert("저장 기능이 수행됩니다. (구현 필요)");
        // api.put(...) 호출 로직 추가 가능
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader"></div>
                <p>AI가 프로젝트 리포트를 작성 중입니다...</p>
                <p className="sub-text">(약 30초 소요)</p>
            </div>
        );
    }

    return (
        <div className="final-report-create-container">
            {/* Header */}
            <div className="frc-header">
                <h2>{mode === "VIEW" ? "최종 리포트" : "AI 리포트 생성 결과"}</h2>
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => navigate(-1)}>나가기</button>
                    <button className="frc-btn primary" onClick={handleSave}>저장</button>
                </div>
            </div>

            {/* Body: Left(Editor) + Right(Chat) */}
            <div className="frc-body">
                {/* Left Side: Markdown Editor */}
                <section className="frc-left">
                    <div className="editor-wrapper">
                        <textarea 
                            className="report-editor" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="리포트 내용이 여기에 표시됩니다."
                        />
                    </div>
                </section>

                {/* Right Side: Chatbot */}
                <section className="frc-right">
                    <div className="frc-chat-container">
                        <div className="frc-chat-header">
                            AI Assistant
                        </div>
                        <div className="frc-chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-bubble ${msg.role}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="frc-chat-input-area">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="AI에게 수정을 요청해보세요..."
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
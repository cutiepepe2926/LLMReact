import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../../../utils/api"; 
import "./FinalReportCreatePage.css";
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

export default function FinalReportCreatePage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // [수정] state에서 title도 받아옴
    const { projectId, template, sections, finalReportId, mode, title: initialTitle } = state || {};

    // [수정] 넘어온 title이 있으면 그것을 초기값으로 사용, 없으면 "제목 없음"
    const [title, setTitle] = useState(initialTitle || "제목 없음");
    const [content, setContent] = useState(""); 
    const [loading, setLoading] = useState(true); 
    
    const editorRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "안녕하세요! 리포트 내용을 수정하거나 필요한 내용을 말씀해주세요." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const mapTemplateToCode = (name) => {
        if (name === "포트폴리오 형식") return "PORTFOLIO";
        if (name === "기술문서 형식") return "TECHNICAL_DOC";
        return "PROJECT_REPORT"; 
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                let reportContent = "";
                let reportTitle = "";

                if (projectId) {
                    // 1. 기존 리포트 조회
                    if (mode === "VIEW" || finalReportId) {
                        const res = await api.get(`/api/projects/${projectId}/final-reports`);
                        // [보완] 리스트(배열)에서 내 리포트 찾기
                        const data = Array.isArray(res) 
                            ? res.find(r => r.finalReportId === finalReportId) 
                            : res;

                        if (data) {
                            reportContent = data.content || "";
                            reportTitle = data.title || initialTitle || "제목 없음";
                        }
                    } 
                    // 2. 신규 리포트 생성 (AI)
                    else {
                        const requestBody = {
                            reportType: mapTemplateToCode(template),
                            selectedSections: sections || [] 
                        };
                        const res = await api.post(`/api/projects/${projectId}/final-reports`, requestBody);
                        reportContent = res.content;
                        reportTitle = res.title || "AI 리포트 생성 결과";
                    }
                } else {
                    reportContent = "# 테스트 리포트\n\n내용";
                    reportTitle = "테스트 리포트";
                }

                setContent(reportContent);
                // API에서 가져온 제목이 유효하면 업데이트, 아니면 기존 유지
                if (reportTitle) setTitle(reportTitle);

            } catch (error) {
                console.error("리포트 로드 실패:", error);
                setContent("# 오류 발생\n데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [projectId, template, sections, finalReportId, mode, navigate, initialTitle]);

    const onChangeEditor = () => {
        if (editorRef.current) {
            setContent(editorRef.current.getInstance().getMarkdown());
        }
    };

    const handleSave = async () => {
        const contentToSave = editorRef.current ? editorRef.current.getInstance().getMarkdown() : content;
        console.log("저장할 제목:", title);
        console.log("저장할 내용:", contentToSave);
        
        try {
            // [TODO] 실제 저장 API 연동 (PUT/POST)
            // await api.put(`/api/projects/${projectId}/final-reports/${finalReportId}`, { ... });
            alert(`[저장 완료]\n제목: ${title}`);
        } catch (e) {
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", text: "네, 내용을 수정해드리겠습니다." }]);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loader"></div>
                <p>리포트를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="final-report-create-container">
            <div className="frc-header">
                <input 
                    type="text" 
                    className="frc-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="리포트 제목을 입력하세요"
                />
                
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => navigate(-1)}>나가기</button>
                    <button className="frc-btn primary" onClick={handleSave}>저장</button>
                </div>
            </div>

            <div className="frc-body">
                <section className="frc-left">
                    <div className="editor-wrapper">
                        <Editor
                            ref={editorRef}
                            initialValue={content} 
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg"
                            useCommandShortcut={true}
                            onChange={onChangeEditor}
                            language="ko-KR"
                        />
                    </div>
                </section>

                <section className="frc-right">
                    <div className="frc-chat-container">
                        <div className="frc-chat-header">AI Assistant</div>
                        <div className="frc-chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-bubble ${msg.role}`}>{msg.text}</div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="frc-chat-input-area">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="AI에게 요청하세요..."
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
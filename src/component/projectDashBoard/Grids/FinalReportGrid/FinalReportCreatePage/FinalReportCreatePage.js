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
    
    // 이전 페이지에서 넘어온 데이터
    const { projectId, template, sections, finalReportId, mode } = state || {};

    // --- State ---
    const [content, setContent] = useState(""); 
    const [loading, setLoading] = useState(true); // 로딩 상태 관리
    
    const editorRef = useRef(null);
    
    // 채팅 관련 State (기존 유지)
    const [messages, setMessages] = useState([
        { role: "assistant", text: "안녕하세요! 리포트 내용을 수정하거나 필요한 내용을 말씀해주세요." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // --- Helper ---
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

    // --- API: 리포트 데이터 가져오기 ---
    useEffect(() => {
        // 프로젝트 ID가 없으면 예외처리 (필요 시 주석 해제)
        // if (!projectId) { alert("잘못된 접근입니다."); navigate(-1); return; }

        const fetchReport = async () => {
            setLoading(true); // 로딩 시작
            try {
                let reportContent = "";

                if (projectId) {
                    // 1. 기존 리포트 조회
                    if (mode === "VIEW" || finalReportId) {
                        const res = await api.get(`/api/projects/${projectId}/final-reports`);
                        if (res && res.content) reportContent = res.content;
                    } 
                    // 2. 신규 리포트 생성 (AI)
                    else {
                        const requestBody = {
                            reportType: mapTemplateToCode(template),
                            selectedSections: sections || [] 
                        };
                        const res = await api.post(`/api/projects/${projectId}/final-reports`, requestBody);
                        reportContent = res.content;
                    }
                } else {
                    // 테스트용 더미 데이터 (백엔드 연결 전 테스트용)
                    reportContent = "# 테스트 리포트\n\n- 항목 1\n- 항목 2\n\n**마크다운**으로 편집 가능합니다.";
                }

                // 데이터를 State에만 저장합니다. (에디터에 직접 주입 X)
                setContent(reportContent);

            } catch (error) {
                console.error("리포트 로드 실패:", error);
                setContent("# 오류 발생\n데이터를 불러오는데 실패했습니다.");
            } finally {
                // 로딩 종료 -> 이때 화면이 다시 그려지며 에디터가 나타납니다.
                setLoading(false);
            }
        };

        fetchReport();
    }, [projectId, template, sections, finalReportId, mode, navigate]);

    // --- Handler: 에디터 변경 감지 ---
    const onChangeEditor = () => {
        if (editorRef.current) {
            // 마크다운 모드 내용 가져오기
            const markdown = editorRef.current.getInstance().getMarkdown();
            setContent(markdown);
        }
    };

    // --- Handler: 저장 ---
    const handleSave = async () => {
        // 현재 에디터에 있는 내용 (마크다운)
        const contentToSave = editorRef.current ? editorRef.current.getInstance().getMarkdown() : content;
        console.log("저장될 내용:", contentToSave);
        
        // TODO: 백엔드 저장 로직 구현
        alert("저장되었습니다! (콘솔 확인)");
    };

    // --- Handler: 채팅 (기존 유지) ---
    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", text: "직접 에디터에서 내용을 수정해보세요!" }]);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 로딩 중일 때 표시할 화면
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
            {/* 헤더 */}
            <div className="frc-header">
                <h2>{mode === "VIEW" ? "최종 리포트" : "AI 리포트 생성 결과"}</h2>
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => navigate(-1)}>나가기</button>
                    <button className="frc-btn primary" onClick={handleSave}>저장</button>
                </div>
            </div>

            {/* 본문 */}
            <div className="frc-body">
                {/* 좌측: 에디터 */}
                <section className="frc-left">
                    <div className="editor-wrapper">
                        {/* loading이 false가 된 후에만 Editor가 렌더링됩니다.
                            이 시점에는 content에 이미 API 데이터가 들어있으므로
                            initialValue가 정상적으로 작동합니다.
                        */}
                        <Editor
                            ref={editorRef}
                            initialValue={content} 
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg" /* 블로그 요청: 마크다운 모드로 시작 */
                            useCommandShortcut={true}
                            onChange={onChangeEditor}
                            language="ko-KR"
                            toolbarItems={[
                                ['heading', 'bold', 'italic', 'strike'],
                                ['hr', 'quote'],
                                ['ul', 'ol', 'task', 'indent', 'outdent'],
                                ['table', 'image', 'link'],
                                ['code', 'codeblock']
                            ]}
                        />
                    </div>
                </section>

                {/* 우측: 챗봇 */}
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
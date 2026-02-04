import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../../../utils/api"; 
import "./FinalReportCreatePage.css";

// [변경 1] React Wrapper 대신 Core Library 직접 import
import Editor from '@toast-ui/editor'; 
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

// 툴바 설정 상수
const TOOLBAR_ITEMS = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'image', 'link'],
    ['code', 'codeblock']
];

export default function FinalReportCreatePage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    const { projectId, template, sections, finalReportId, mode, title: initialTitle } = state || {};

    const [currentReportId, setCurrentReportId] = useState(finalReportId || null);
    const [title, setTitle] = useState(initialTitle || "제목 없음");
    
    // 에디터 초기값 관리 (초기 로딩 이후엔 사용 안 함)
    const [initialContent, setInitialContent] = useState(""); 
    const [loading, setLoading] = useState(true); 
    
    // [변경 2] 에디터 인스턴스와 DOM 컨테이너를 위한 Ref 분리
    const editorRef = useRef(null); // 에디터 인스턴스 (getMarkdown 등을 위해 사용)
    const containerRef = useRef(null); // 에디터가 그려질 div 엘리먼트

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

    // 1. 데이터 로드
    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                let reportContent = "";
                let reportTitle = "";
                let fetchedId = null;

                if (projectId) {
                    if (mode === "VIEW" || finalReportId) {
                        const res = await api.get(`/api/projects/${projectId}/final-reports`);
                        const data = Array.isArray(res) 
                            ? res.find(r => r.finalReportId === finalReportId) 
                            : res;

                        if (data) {
                            reportContent = data.content || "";
                            reportTitle = data.title || initialTitle || "제목 없음";
                            fetchedId = data.finalReportId;
                        }
                    } 
                    else {
                        const requestBody = {
                            reportType: mapTemplateToCode(template),
                            selectedSections: sections || [] 
                        };
                        const res = await api.post(`/api/projects/${projectId}/final-reports`, requestBody);
                        
                        reportContent = res.content || "";
                        reportTitle = res.title || "AI 리포트 생성 결과";
                        fetchedId = res.finalReportId; 
                    }
                } else {
                    reportContent = "# 테스트 리포트\n\n내용";
                    reportTitle = "테스트 리포트";
                }

                setInitialContent(reportContent || " "); 
                if (reportTitle) setTitle(reportTitle);
                if (fetchedId) setCurrentReportId(fetchedId); 

            } catch (error) {
                console.error("리포트 로드 실패:", error);
                setInitialContent("# 오류 발생\n데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [projectId, template, sections, finalReportId, mode, navigate, initialTitle]);


    // [핵심 변경 3] 에디터 수동 초기화 (데이터 로딩 완료 후 실행)
    useEffect(() => {
        if (loading) return; // 로딩 중엔 생성 안 함
        if (!containerRef.current) return; // DOM 없으면 중단

        // 이미 인스턴스가 있다면 파괴 (재진입 시 안전장치)
        if (editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
        }

        // 에디터 인스턴스 생성
        const editorInstance = new Editor({
            el: containerRef.current, // ref로 잡은 div에 주입
            initialValue: initialContent,
            previewStyle: 'vertical', // 이제 vertical 모드도 안전하게 사용 가능!
            height: '100%',
            initialEditType: 'wysiwyg',
            hideModeSwitch: true,
            useCommandShortcut: true,
            language: 'ko-KR',
            toolbarItems: TOOLBAR_ITEMS
        });

        editorRef.current = editorInstance;

        // Cleanup: 컴포넌트 언마운트 시 에디터 제거
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [loading, initialContent]); // loading이 끝나고 initialContent가 세팅되면 1회 실행


    const handleSave = async () => {
        // [변경 4] 인스턴스에서 직접 내용 가져오기
        const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;
        
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        try {
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/final-reports/${currentReportId}`, {
                    title: title,
                    content: contentToSave
                });
                alert("성공적으로 저장되었습니다.");
            } else {
                alert("오류: 리포트 ID를 찾을 수 없습니다.");
            }
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleSaveAs = async () => {
        const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;

        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        if(!window.confirm(`'${title}'(으)로 새로 저장하시겠습니까?`)) return;

        try {
            const res = await api.post(`/api/projects/${projectId}/final-reports/save-as`, {
                title: title,
                content: contentToSave
            });

            if (res && res.finalReportId) {
                setCurrentReportId(res.finalReportId);
                alert(`[새 파일 저장 완료]\n이제부터 '${res.title}' 파일을 편집합니다.`);
            }
        } catch (e) {
            console.error("다른 이름으로 저장 실패:", e);
            const errorMessage = e.response?.data?.message || e.message || "저장 중 오류가 발생했습니다.";
            alert(errorMessage);
        }
    };

    // ... (sendMessage, handleKeyDown 등 채팅 로직은 그대로 유지)
    const sendMessage = async () => {
        if (!input.trim()) return;
        
        // 1. 에디터 인스턴스 확인
        const editorInstance = editorRef.current;
        if (!editorInstance) {
            alert("에디터가 로드되지 않았습니다.");
            return;
        }

        // 2. 텍스트 추출 로직
        const selectedText = editorInstance.getSelectedText(); // 드래그한 텍스트
        const allText = editorInstance.getMarkdown();          // 전체 텍스트
        
        let contextText = "";
        let isSelection = false;

        if (selectedText && selectedText.trim().length > 0) {
            // Case A: 사용자가 특정 부분을 드래그함
            contextText = selectedText;
            isSelection = true;
        } else {
            // Case B: 선택 안 함 -> 전체 텍스트 전송 (토큰 절약을 위한 압축 로직은 여기에 추가 가능)
            contextText = allText;
            isSelection = false;
        }

        // 3. UI에 내 말풍선 즉시 표시
        const userMsg = { 
            role: "user", 
            text: input,
            hasContext: isSelection // (선택: UI에 '부분 참조' 아이콘 등을 띄울 때 사용 가능)
        };
        setMessages(prev => [...prev, userMsg]);
        setInput(""); // 입력창 초기화

        // 4. 백엔드로 전송할 데이터 구성
        const requestPayload = {
            message: input,        // 사용자 질문 (예: "이거 좀 더 공손하게 바꿔줘")
            context: contextText,  // AI가 참고할 텍스트 (선택 영역 or 전체)
            isSelection: isSelection, // 백엔드에서 범위를 알 수 있게 플래그 전송
            projectId: projectId   // (필요 시) 프로젝트 정보
        };

        try {
            // 5. 실제 API 호출 (예시)
            // const response = await api.post(`/api/projects/${projectId}/final-reports/ai-chat`, requestPayload);
            
            // [테스트용 가짜 응답] - 나중엔 response.data.reply 등으로 교체
            setTimeout(() => {
                const mockReply = isSelection 
                    ? `선택하신 "${contextText.substring(0, 10)}..." 부분에 대한 수정 제안입니다.` 
                    : "전체 문서를 바탕으로 답변 드립니다.";
                
                setMessages(prev => [...prev, { role: "assistant", text: mockReply }]);
            }, 800);

        } catch (error) {
            console.error("AI 요청 실패:", error);
            setMessages(prev => [...prev, { role: "assistant", text: "오류가 발생했습니다. 다시 시도해주세요." }]);
        }
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
                    <button className="frc-btn secondary save-as" onClick={handleSaveAs}>다른 이름으로 저장</button>
                    <button className="frc-btn primary" onClick={handleSave}>저장</button>
                </div>
            </div>

            <div className="frc-body">
                <section className="frc-left">
                    <div className="editor-wrapper">
                        {/* [변경 5] React Component 대신 순수 div 컨테이너 사용 */}
                        <div ref={containerRef} style={{ height: '100%' }} />
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
                            {/* 컨텍스트 상태 표시 (선택사항) */}
                            <div className="context-indicator">
                                {editorRef.current?.getSelectedText() ? (
                                    <span className="badge-select">선택 영역 참조 중</span>
                                ) : (
                                    <span className="badge-all">전체 문서 참조 중</span>
                                )}
                            </div>
                            
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    editorRef.current?.getSelectedText() 
                                    ? "선택한 내용을 어떻게 수정할까요?" 
                                    : "전체 문서에 대해 질문하거나 수정할 부분을 드래그하세요."
                                }
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
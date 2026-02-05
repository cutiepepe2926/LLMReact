import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../../../utils/api"; 
import "./FinalReportCreatePage.css";

import Editor from '@toast-ui/editor'; 
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

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
    
    const [initialContent, setInitialContent] = useState(""); 
    const [loading, setLoading] = useState(true); 
    
    // 에디터 및 DOM Refs
    const editorRef = useRef(null); 
    const containerRef = useRef(null); 

    // [핵심] 하이라이트 및 선택 영역 관리
    const [highlightStyle, setHighlightStyle] = useState(null); // 하이라이트 div 스타일 (좌표)
    const lastRangeRef = useRef(null); // 마지막 선택 영역(Range 객체) 저장
    const [hasSelection, setHasSelection] = useState(false); // UI 배지 표시용 상태

    // 채팅 관련
    const [messages, setMessages] = useState([
        { role: "assistant", text: "안녕하세요! 수정하고 싶은 부분을 드래그하면 더 정확한 피드백을 드릴 수 있습니다." }
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
                        const data = Array.isArray(res) ? res.find(r => r.finalReportId === finalReportId) : res;
                        if (data) {
                            reportContent = data.content || "";
                            reportTitle = data.title || initialTitle || "제목 없음";
                            fetchedId = data.finalReportId;
                        }
                    } else {
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

    // 2. 에디터 초기화 및 이벤트 바인딩
    useEffect(() => {
        if (loading) return; 
        if (!containerRef.current) return; 

        if (editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
        }

        // [변경] events 옵션 제거 (v3 호환성 문제 해결)
        const editorInstance = new Editor({
            el: containerRef.current,
            initialValue: initialContent,
            previewStyle: 'vertical',
            height: '100%',
            initialEditType: 'wysiwyg',
            hideModeSwitch: true,
            useCommandShortcut: true,
            language: 'ko-KR',
            toolbarItems: TOOLBAR_ITEMS
        });

        editorRef.current = editorInstance;

        // [핵심 변경] DOM 요소 직접 접근하여 이벤트 바인딩
        // v3에서는 getSquire 대신 getEditorElements() 사용
        const { wwEditor } = editorInstance.getEditorElements(); // WYSIWYG DOM Element

        const saveRange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // 텍스트가 실제로 선택되었을 때만 저장
                if (!range.collapsed && range.toString().trim().length > 0) {
                    lastRangeRef.current = range.cloneRange();
                    setHasSelection(true);
                } else {
                    lastRangeRef.current = null;
                    setHasSelection(false);
                }
            }
        };

        // DOM 이벤트 리스너 등록
        if (wwEditor) {
            wwEditor.addEventListener('mouseup', saveRange);
            wwEditor.addEventListener('keyup', saveRange);
            
            // 포커스 시 하이라이트 UI 제거
            wwEditor.addEventListener('focus', () => {
                setHighlightStyle(null);
            });
            
            // 스크롤 시 하이라이트 제거 (캡처링으로 확실하게 잡기)
            wwEditor.addEventListener('scroll', () => {
                setHighlightStyle(null);
            }, { capture: true });
        }

        return () => {
            // Cleanup: 이벤트 제거 및 에디터 파괴
            if (wwEditor) {
                wwEditor.removeEventListener('mouseup', saveRange);
                wwEditor.removeEventListener('keyup', saveRange);
            }
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [loading, initialContent]);

    // [핵심] 채팅창 포커스 시 가상 하이라이트 켜기
    const handleChatFocus = () => {
        const range = lastRangeRef.current;
        if (range) {
            // 선택된 영역의 화면상 좌표 계산
            const rect = range.getBoundingClientRect();
            
            if (rect.width > 0) {
                setHighlightStyle({
                    top: rect.top,    // fixed 포지션이므로 viewport 기준 좌표 그대로 사용
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        }
    };

    const handleSave = async () => {
        const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;
        if (!title.trim()) { alert("제목을 입력해주세요."); return; }
        try {
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/final-reports/${currentReportId}`, { title, content: contentToSave });
                alert("성공적으로 저장되었습니다.");
            } else { alert("오류: 리포트 ID를 찾을 수 없습니다."); }
        } catch (e) { alert("저장 중 오류가 발생했습니다."); }
    };

    const handleSaveAs = async () => {
        const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;
        if (!title.trim()) { alert("제목을 입력해주세요."); return; }
        if(!window.confirm(`'${title}'(으)로 새로 저장하시겠습니까?`)) return;
        try {
            const res = await api.post(`/api/projects/${projectId}/final-reports/save-as`, { title, content: contentToSave });
            if (res && res.finalReportId) {
                setCurrentReportId(res.finalReportId);
                alert(`[새 파일 저장 완료]\n이제부터 '${res.title}' 파일을 편집합니다.`);
            }
        } catch (e) { alert(e.response?.data?.message || "저장 중 오류가 발생했습니다."); }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const editorInstance = editorRef.current;
        if (!editorInstance) { alert("에디터가 로드되지 않았습니다."); return; }

        // [핵심] 전송할 컨텍스트 결정 (저장해둔 Range가 있으면 우선 사용)
        let contextText = "";
        let isSelection = false;

        if (lastRangeRef.current && lastRangeRef.current.toString().trim().length > 0) {
            contextText = lastRangeRef.current.toString();
            isSelection = true;
        } else {
            contextText = editorInstance.getMarkdown();
            isSelection = false;
        }

        // UI에 표시
        const userMsg = { role: "user", text: input, hasContext: isSelection };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        const requestPayload = {
            message: input,
            context: contextText,
            isSelection: isSelection,
            projectId: projectId
        };

        try {
            // API 호출 시뮬레이션
            setTimeout(() => {
                const mockReply = isSelection 
                    ? `선택하신 "${contextText.substring(0, 15)}..." 부분에 대해 수정해드릴게요.` 
                    : "전체 문서를 바탕으로 답변 드립니다.";
                setMessages(prev => [...prev, { role: "assistant", text: mockReply }]);
            }, 800);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", text: "오류가 발생했습니다." }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) return <div className="loading-overlay"><div className="loader"></div><p>로딩 중...</p></div>;

    return (
        <div className="final-report-create-container">
            {/* 가상 하이라이트 오버레이 (fixed position) */}
            {highlightStyle && (
                <div 
                    className="virtual-highlight"
                    style={{
                        top: highlightStyle.top,
                        left: highlightStyle.left,
                        width: highlightStyle.width,
                        height: highlightStyle.height
                    }}
                />
            )}

            <div className="frc-header">
                <input type="text" className="frc-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="리포트 제목" />
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => navigate(-1)}>나가기</button>
                    <button className="frc-btn secondary save-as" onClick={handleSaveAs}>다른 이름으로 저장</button>
                    <button className="frc-btn primary" onClick={handleSave}>저장</button>
                </div>
            </div>

            <div className="frc-body">
                <section className="frc-left">
                    <div className="editor-wrapper">
                        <div ref={containerRef} style={{ height: '100%' }} />
                    </div>
                </section>
                
                <section className="frc-right">
                    <div className="frc-chat-container">
                        <div className="frc-chat-header">AI Assistant</div>
                        <div className="frc-chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-bubble ${msg.role}`}>
                                    {/* 문맥 아이콘 표시 */}
                                    {msg.role === 'user' && (
                                        <div className="msg-context-icon">
                                            {msg.hasContext ? '✂️ 부분 참조' : '📄 전체 참조'}
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="frc-chat-input-area">
                            {/* [변경] 컨텍스트 상태 배지 (입력창 위) */}
                            <div className={`context-badge ${hasSelection ? 'active' : ''}`}>
                                {hasSelection 
                                    ? "✂️ 수정할 부분을 참조 중입니다." 
                                    : "📄 전체 문서를 참조 중입니다. (드래그하여 부분 선택 가능)"
                                }
                            </div>
                            
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={handleChatFocus} // [핵심] 포커스 시 하이라이트 켜기
                                placeholder={hasSelection ? "선택한 내용을 어떻게 수정할까요?" : "AI에게 요청하세요..."}
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
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
    
    const editorRef = useRef(null); 
    const containerRef = useRef(null); 

    const highlightRef = useRef(null);
    const rafRef = useRef(null);

    // [상태 관리] 하이라이트 스타일 및 로직 제어
    const [highlightStyle, setHighlightStyle] = useState(null);
    const lastRangeRef = useRef(null); // 선택 영역(Range) 저장
    const isHighlightingRef = useRef(false); // 현재 하이라이트가 켜져 있는지 추적 (스크롤 최적화용)
    const [hasSelection, setHasSelection] = useState(false); // UI 배지용 상태

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

    const HIGHLIGHT_PADDING = 6;

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

        // Toast UI v3 DOM 접근
        const { wwEditor } = editorInstance.getEditorElements(); 
        const scrollContainer = wwEditor ? wwEditor.parentElement : null;

        const saveRange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!range.collapsed && range.toString().trim().length > 0) {
                    lastRangeRef.current = range.cloneRange();
                    setHasSelection(true);
                } else {
                    lastRangeRef.current = null;
                    setHasSelection(false);
                }
            }
        };

        const clearHighlight = () => {
            setHighlightStyle(null);
            isHighlightingRef.current = false;
        };

        //좌표 제한(Clamping)이 적용된 위치 업데이트 함수
        const updateHighlightPosition = () => {
            // 조건 체크: 하이라이트 모드가 아니거나, DOM 요소들이 없으면 중단
            if (!isHighlightingRef.current || !lastRangeRef.current || !scrollContainer || !highlightRef.current) {
                return;
            }

            // 이전 프레임 요청 취소 (중복 실행 방지)
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            // 다음 브라우저 리페인트 시점에 실행
            rafRef.current = requestAnimationFrame(() => {
                // 이 시점에 컴포넌트가 언마운트 되었거나 하이라이트가 꺼졌으면 중단
                if (!highlightRef.current) return;

                const range = lastRangeRef.current;
                const textRect = range.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();

                // 좌표 클램핑 (Clamping) 계산
                const visibleTop = Math.max(textRect.top, containerRect.top);
                const visibleBottom = Math.min(textRect.bottom, containerRect.bottom);
                const visibleHeight = visibleBottom - visibleTop;

                // DOM 스타일 직접 수정 (React State 건너뜀 -> 즉각 반응)
                const el = highlightRef.current;

                if (visibleHeight > 0 && textRect.width > 0) {
                    el.style.display = 'block'; 
                    
                    // 여백(PADDING)을 적용하여 박스 확장
                    // 위/왼쪽은 빼주고(-), 너비/높이는 양쪽 여백만큼 더해줌(+)
                    el.style.top = `${visibleTop - HIGHLIGHT_PADDING}px`;
                    el.style.left = `${textRect.left - HIGHLIGHT_PADDING}px`;
                    el.style.width = `${textRect.width + (HIGHLIGHT_PADDING * 2)}px`;
                    
                    // 높이는 클램핑된 높이에 여백을 더함
                    el.style.height = `${visibleHeight + (HIGHLIGHT_PADDING * 2)}px`;
                } else {
                    // 범위를 벗어났을 때
                    el.style.display = 'none'; 
                }
            });
        };

        if (wwEditor && scrollContainer) {
            wwEditor.addEventListener('mouseup', saveRange);
            wwEditor.addEventListener('keyup', saveRange);
            
            wwEditor.addEventListener('focus', clearHighlight);
            wwEditor.addEventListener('mousedown', clearHighlight);
            wwEditor.addEventListener('keydown', clearHighlight);
            
            // [중요] 스크롤 이벤트는 'scrollContainer'에 걸어야 가장 정확함
            // 하지만 ToastUI 구조상 wwEditor에서 버블링되는 스크롤을 잡거나 
            // 직접 scrollContainer에 리스너를 붙여야 함. capture: true로 잡는 것이 안전.
            scrollContainer.addEventListener('scroll', updateHighlightPosition, { capture: true });
            
            // 윈도우 리사이즈 시에도 위치가 틀어질 수 있으므로 추가하면 좋음
            window.addEventListener('resize', updateHighlightPosition);
        }

        return () => {
            if (wwEditor && scrollContainer) {
                wwEditor.removeEventListener('mouseup', saveRange);
                wwEditor.removeEventListener('keyup', saveRange);
                wwEditor.removeEventListener('focus', clearHighlight);
                wwEditor.removeEventListener('mousedown', clearHighlight);
                wwEditor.removeEventListener('keydown', clearHighlight);
                
                scrollContainer.removeEventListener('scroll', updateHighlightPosition, { capture: true });
                window.removeEventListener('resize', updateHighlightPosition);
            }
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [loading, initialContent]);

    // 3. 채팅창 포커스 핸들러 (하이라이트 켜기)
    const handleChatFocus = () => {
        const range = lastRangeRef.current;
        if (range) {
             const rect = range.getBoundingClientRect();
             if (rect.width > 0) {
                 isHighlightingRef.current = true;
                 
                 setHighlightStyle({
                     top: rect.top - HIGHLIGHT_PADDING,
                     left: rect.left - HIGHLIGHT_PADDING,
                     width: rect.width + (HIGHLIGHT_PADDING * 2),
                     height: rect.height + (HIGHLIGHT_PADDING * 2)
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
        if (!editorInstance) {
            alert("에디터가 로드되지 않았습니다.");
            return;
        }

        let contextText = "";
        let isSelection = false;

        if (lastRangeRef.current && lastRangeRef.current.toString().trim().length > 0) {
            contextText = lastRangeRef.current.toString();
            isSelection = true;
        } else {
            contextText = editorInstance.getMarkdown();
            isSelection = false;
        }

        const userMsg = { 
            role: "user", 
            text: input,
            hasContext: isSelection 
        };
        setMessages(prev => [...prev, userMsg]);
        setInput(""); // 입력창 초기화

        const requestPayload = {
            message: userMsg.text,
            context: contextText,
            isSelection: isSelection,
            reportType: "FINAL" 
        };

        try {
            const response = await api.post(`/api/projects/${projectId}/reports/chat`, requestPayload);
            
            if (response && response.reply) {
                setMessages(prev => [...prev, { role: "assistant", text: response.reply }]);
            } else {
                 const replyText = response.data?.reply || response.reply || "응답을 받을 수 없습니다.";
                 setMessages(prev => [...prev, { role: "assistant", text: replyText }]);
            }

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

    if (loading) return <div className="loading-overlay"><div className="loader"></div><p>로딩 중...</p></div>;

    return (
        <div className="final-report-create-container">
            {/* 가상 하이라이트 오버레이 */}
            {highlightStyle && (
                <div
                    ref={highlightRef}
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
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={handleChatFocus}
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
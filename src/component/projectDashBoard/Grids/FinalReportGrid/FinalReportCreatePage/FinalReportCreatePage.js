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

    const [isAiThinking, setIsAiThinking] = useState(false);
    const [currentReportId, setCurrentReportId] = useState(finalReportId || null);
    const [title, setTitle] = useState(initialTitle || "제목 없음");
    const [initialContent, setInitialContent] = useState(""); 
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false); 
    
    const editorRef = useRef(null); 
    const containerRef = useRef(null); 

    const highlightRef = useRef(null);
    const rafRef = useRef(null);

    const lastEditorSelectionRef = useRef(null);

    // [상태 관리] 하이라이트 스타일 및 로직 제어
    const [highlightStyle, setHighlightStyle] = useState(null);
    const lastRangeRef = useRef(null); // 선택 영역(Range) 저장
    const isHighlightingRef = useRef(false); // 현재 하이라이트가 켜져 있는지 추적 (스크롤 최적화용)
    const [hasSelection, setHasSelection] = useState(false); // UI 배지용 상태

    const [messages, setMessages] = useState([
        { role: "assistant", text: "안녕하세요! 수정하고 싶은 부분을 드래그하면\n 더 정확한 피드백을 드릴 수 있습니다." }
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
            previewStyle: 'vertical', // 미리보기 스타일 (유지)
            height: '100%',
            
            // [수정] 초기 모드를 'markdown'으로 변경합니다.
            initialEditType: 'markdown', 
            
            // [옵션] 사용자가 위지윅으로 바꾸지 못하게 하려면 true 유지, 아니면 false로 변경
            hideModeSwitch: true, 
            
            useCommandShortcut: true,
            language: 'ko-KR',
            toolbarItems: TOOLBAR_ITEMS
        });

        editorRef.current = editorInstance;

        // Toast UI v3 DOM 접근
        const { mdEditor } = editorInstance.getEditorElements();
        const scrollContainer = mdEditor ? mdEditor.parentElement : null;

        const saveRange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!range.collapsed && range.toString().trim().length > 0) {
                    lastRangeRef.current = range.cloneRange();

                    if (editorInstance) {
                        lastEditorSelectionRef.current = editorInstance.getSelection();
                    }

                    setHasSelection(true);
                } else {
                    lastRangeRef.current = null;
                    lastEditorSelectionRef.current = null;
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

        if (mdEditor && scrollContainer) {
            mdEditor.addEventListener('mouseup', saveRange);
            mdEditor.addEventListener('keyup', saveRange);
            
            mdEditor.addEventListener('focus', clearHighlight);
            mdEditor.addEventListener('mousedown', clearHighlight);
            mdEditor.addEventListener('keydown', clearHighlight);
            
            scrollContainer.addEventListener('scroll', updateHighlightPosition, { capture: true });
            window.addEventListener('resize', updateHighlightPosition);
        }

        return () => {
            if (mdEditor && scrollContainer) {
                mdEditor.removeEventListener('mouseup', saveRange);
                mdEditor.removeEventListener('keyup', saveRange);
                mdEditor.removeEventListener('focus', clearHighlight);
                mdEditor.removeEventListener('mousedown', clearHighlight);
                mdEditor.removeEventListener('keydown', clearHighlight);
                
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

    // eslint-disable-next-line
    const handleSave = async () => {
        // 1. 이미 저장 중이면 중복 실행 방지
        if (isSaving) return;

        const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;
        if (!title.trim()) { alert("제목을 입력해주세요."); return; }
        
        // 2. 저장 시작 (로딩 ON)
        setIsSaving(true);

        try {
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/final-reports/${currentReportId}`, { title, content: contentToSave });
                
                // 3. 저장 성공 (로딩 OFF, 성공 ON)
                setIsSaving(false);
                setSaveSuccess(true);

                // 4. 5초 뒤에 원래 버튼(저장)으로 복귀
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 5000);

            } else { 
                alert("오류: 리포트 ID를 찾을 수 없습니다."); 
                setIsSaving(false);
            }
        } catch (e) { 
            alert("저장 중 오류가 발생했습니다."); 
            setIsSaving(false); // 실패 시 로딩 끄기
        }
    };

    useEffect(() => {
        const editorInstance = editorRef.current;
        if (!editorInstance) return;

        const handleShortcut = (e) => {
            // Ctrl+S 또는 Cmd+S 감지
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault(); 
                e.stopPropagation(); 
                handleSave();
            }
        };

        const { mdEditor, wwEditor } = editorInstance.getEditorElements();
        
        if (mdEditor) mdEditor.addEventListener('keydown', handleShortcut, true);
        if (wwEditor) wwEditor.addEventListener('keydown', handleShortcut, true);

        return () => {
            if (mdEditor) mdEditor.removeEventListener('keydown', handleShortcut, true);
            if (wwEditor) wwEditor.removeEventListener('keydown', handleShortcut, true);
        };
    }, [handleSave]);

    const handleSaveAs = async () => {
        // 1. 제목 입력 확인
        if (!title.trim()) { 
            alert("제목을 입력해주세요."); 
            return; 
        }

        try {
            // [추가 로직] 중복 제목 체크 시작
            // 2. 현재 프로젝트의 최종 리포트 목록 조회
            const listRes = await api.get(`/api/projects/${projectId}/final-reports`);
            
            // API 응답 형태에 따라 배열 추출 (axios response 구조 대응)
            const reportList = Array.isArray(listRes) ? listRes : (listRes.data || []);

            // 3. 현재 입력된 제목(title)과 똑같은 제목이 있는지 검사
            const isDuplicate = reportList.some(report => report.title.trim() === title.trim());

            if (isDuplicate) {
                alert("이미 동일한 이름의 리포트가 존재합니다.\n다른 이름으로 저장해주세요.");
                return; // 저장 중단
            }
            // [추가 로직] 중복 제목 체크 끝


            // 4. 중복이 없으면 저장 진행 여부 확인
            const contentToSave = editorRef.current ? editorRef.current.getMarkdown() : initialContent;
            
            if(!window.confirm(`'${title}'(으)로 새로 저장하시겠습니까?`)) return;

            // 5. '다른 이름으로 저장' API 호출
            const res = await api.post(`/api/projects/${projectId}/final-reports/save-as`, { 
                title, 
                content: contentToSave 
            });

            if (res && res.finalReportId) {
                setCurrentReportId(res.finalReportId);
                alert(`[새 파일 저장 완료]\n이제부터 '${res.title}' 파일을 편집합니다.`);
            }

        } catch (e) { 
            console.error(e);
            alert(e.response?.data?.message || "저장 중 오류가 발생했습니다."); 
        }
    };
    
    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const editorInstance = editorRef.current;
        if (!editorInstance) {
            alert("에디터가 로드되지 않았습니다.");
            return;
        }

        // 1. [좌표 복구] 채팅창 클릭으로 인해 풀린 선택 영역을 다시 선택합니다.
        if (hasSelection && lastEditorSelectionRef.current) {
            try {
                editorInstance.setSelection(
                    lastEditorSelectionRef.current[0], 
                    lastEditorSelectionRef.current[1]
                );
            } catch (e) {
                console.warn("선택 영역 복구 실패:", e);
            }
        }

        let contextText = "";
        let isSelection = false;
        let currentSelectionRange = null;

        const selectedMarkdown = editorInstance.getSelectedText();
        
        if (selectedMarkdown && selectedMarkdown.trim().length > 0) {
            contextText = selectedMarkdown; 
            isSelection = true;
            // 현재(복구된) 좌표를 메시지 객체에 저장 (나중에 '적용' 버튼 클릭 시 사용)
            currentSelectionRange = editorInstance.getSelection(); 
        } else {
            // 선택 안 했으면 전체 문서 가져오기
            contextText = editorInstance.getMarkdown();
            isSelection = false;
        }

        const userMsg = { 
            role: "user", 
            text: input,
            hasContext: isSelection,
            selection: currentSelectionRange // [추가] 메시지에 좌표 정보 포함
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput(""); 
        setIsAiThinking(true);

        const requestPayload = {
            message: userMsg.text,
            context: contextText, // 이제 줄바꿈과 MD 문법이 포함됨
            isSelection: isSelection,
            reportType: "FINAL" 
        };

        try {
            const response = await api.post(`/api/projects/${projectId}/reports/chat`, requestPayload);
            
            let replyText = "응답을 받을 수 없습니다.";
            if (response && response.reply) {
                replyText = response.reply;
            } else if (response.data && response.data.reply) {
                replyText = response.data.reply;
            }
            
            setMessages(prev => [...prev, { 
                role: "assistant", 
                text: replyText,
                hasContext: isSelection,
                selection: currentSelectionRange // [추가] 응답 메시지에도 좌표 전달
            }]);

        } catch (error) {
            console.error("AI 요청 실패:", error);
            setMessages(prev => [...prev, { role: "assistant", text: "오류가 발생했습니다." }]);
        } finally {
            setIsAiThinking(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("클립보드에 복사되었습니다");
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

    // [수정] selection(좌표) 인자 추가
    const handleApply = (text, hasContext, selection, index) => {
        const editor = editorRef.current;
        if (!editor) {
            alert("에디터를 찾을 수 없습니다.");
            return;
        }

        try {
            // Case A: 전체 문서 모드일 때
            if (!hasContext) {
                 editor.setMarkdown(text);
            }
            // Case B: 부분 선택 모드일 때
            else if (hasContext && selection) {
                editor.focus();
                editor.setSelection(selection[0], selection[1]);
                editor.insertText(text);
            }

            // 해당 메시지의 'isApplied' 상태를 true로 변경
            setMessages(prev => prev.map((msg, i) => 
                i === index ? { ...msg, isApplied: true } : msg
            ));

        } catch (e) {
            console.error("에디터 적용 실패:", e);
            alert("적용 중 오류가 발생했습니다.");
        }
    };

    const handleExit = () => {
        if (projectId) {
            // 명시적으로 대시보드의 'finalReport' 탭으로 이동
            navigate(`/project/${projectId}/dashboard`, {
                state: { initialTab: 'finalReport' }
            });
        } else {
            // projectId가 없는 예외적인 경우 그냥 뒤로가기
            navigate(-1);
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
                    <button className="frc-btn secondary" onClick={handleExit}>나가기</button>
                    <button className="frc-btn secondary save-as" onClick={handleSaveAs}>다른 이름으로 저장</button>
                    <button 
                        className={`frc-btn primary ${saveSuccess ? 'success-btn' : ''}`} // 성공 시 초록색 등으로 스타일 변경 가능
                        onClick={handleSave}
                        disabled={isSaving} // 저장 중 클릭 불가
                        style={{ minWidth: '80px', transition: 'all 0.3s' }} // 버튼 너비 고정 (글자 바뀔 때 덜컹거림 방지)
                    >
                        {isSaving ? (
                            // 저장 중: 로딩 스피너 (CSS로 회전 애니메이션 적용 필요)
                            <span className="loading-spinner"></span> 
                        ) : saveSuccess ? (
                            // 저장 완료: 체크 표시
                            <>✔</>
                        ) : (
                            // 기본 상태
                            "저장"
                        )}
                    </button>
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
                            {messages.map((msg, idx) => {
                                // [수정 2] 현재 메시지가 '가장 최신 메시지'인지 확인
                                const isLastMessage = idx === messages.length - 1;

                                return (
                                    <div key={idx} className={`chat-bubble ${msg.role}`}>
                                        {msg.role === 'user' && (
                                            <div className="msg-context-icon">
                                                {msg.hasContext ? '부분 참조' : '전체 참조'}
                                            </div>
                                        )}
                                        {msg.text}

                                        {msg.role === 'assistant' && idx !== 0 && (
                                            <div className="msg-actions">
                                                <button className="action-btn copy" onClick={() => handleCopy(msg.text)}>
                                                    복사
                                                </button>
                                                
                                                {/* [수정 3] 최신 메시지일 때만 버튼 노출 & 적용된 경우 비활성화 */}
                                                {isLastMessage && (
                                                    <button 
                                                        className={`action-btn apply ${msg.isApplied ? 'applied' : ''}`}
                                                        // index를 함께 전달
                                                        onClick={() => handleApply(msg.text, msg.hasContext, msg.selection, idx)}
                                                        disabled={msg.isApplied} // 이미 적용했으면 버튼 비활성화
                                                    >
                                                        {msg.isApplied ? "적용 완료" : "에디터에 적용"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {isAiThinking && (
                                <div className="chat-bubble assistant loading">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            )}

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
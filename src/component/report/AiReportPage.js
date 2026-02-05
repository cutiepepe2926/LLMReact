import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api'; 
import ProjectHeader from '../projectHeader/ProjectHeader';
import './AiReportPage.css'; 

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

export default function AiReportPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. 프로젝트 정보 관리 (초기값은 location.state, 없으면 API 로딩 예정)
    const [projectData, setProjectData] = useState(location.state?.projectData || null);

    // 2. 뷰 모드 및 기타 상태
    const [view, setView] = useState(location.state?.mode === 'create' ? 'editor' : 'list');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyReports, setDailyReports] = useState([]); 
    const dateInputRef = useRef(null);

    const [currentReportId, setCurrentReportId] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // 에디터 Refs
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const highlightRef = useRef(null);
    const rafRef = useRef(null);
    const lastRangeRef = useRef(null);
    const lastEditorSelectionRef = useRef(null);
    const isHighlightingRef = useRef(false);
    const [highlightStyle, setHighlightStyle] = useState(null);
    const [hasSelection, setHasSelection] = useState(false);

    const [messages, setMessages] = useState([
        { role: "assistant", text: "오늘의 업무 내용을 작성해보세요.\nGit 커밋 내역을 불러와 초안을 만들 수도 있습니다." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // =========================================================
    // [중요] 프로젝트 정보가 없으면 API로 다시 불러오기 (새로고침/직접접속 대비)
    // =========================================================
    useEffect(() => {
        if (!projectId) return;
        
        // 이미 데이터가 있고 projectId가 일치하면 스킵
        if (projectData && String(projectData.projectId) === String(projectId)) return;

        const fetchProjectInfo = async () => {
            try {
                const res = await api.get(`/api/projects/${projectId}`);
                setProjectData(res.data || res); // 응답 구조에 맞춰 조정
            } catch (e) {
                console.error("프로젝트 정보 조회 실패:", e);
            }
        };
        fetchProjectInfo();
    }, [projectId, projectData]);


    // =========================================================
    // 목록 조회 (List View)
    // =========================================================
    const fetchDailyReports = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await api.get(`/api/projects/${projectId}/daily-reports?date=${selectedDate}`);
            setDailyReports(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error("일일 리포트 목록 조회 실패:", e);
            setDailyReports([]); 
        }
    }, [projectId, selectedDate]);

    useEffect(() => {
        if (view === 'list') {
            fetchDailyReports();
        }
    }, [view, selectedDate, fetchDailyReports]);

    // =========================================================
    // 에디터 데이터 로드 (Editor View)
    // =========================================================
    useEffect(() => {
        if (view !== 'editor') return;
        const loadEditorData = async () => {
            if (currentReportId) {
                try {
                    const res = await api.get(`/api/projects/${projectId}/daily-reports/${currentReportId}`);
                    setEditorContent(res.content || "");
                } catch (e) { console.error(e); }
            } else {
                setEditorContent("# 오늘의 업무\n\n(우측 상단의 'Git 분석' 버튼을 눌러보세요!)");
            }
        };
        loadEditorData();
    }, [view, currentReportId, projectId]);

    // =========================================================
    // 에디터 생성 및 하이라이트 (Toast UI)
    // =========================================================
    useEffect(() => {
        if (view !== 'editor' || !containerRef.current) return;
        if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; }

        const editorInstance = new Editor({
            el: containerRef.current,
            initialValue: editorContent,
            previewStyle: 'vertical',
            height: '100%',
            initialEditType: 'markdown',
            hideModeSwitch: true,
            useCommandShortcut: true,
            language: 'ko-KR',
            toolbarItems: TOOLBAR_ITEMS
        });
        editorRef.current = editorInstance;

        // 하이라이트 로직 (이전 코드와 동일, 생략 없이 유지)
        const { mdEditor } = editorInstance.getEditorElements();
        const scrollContainer = mdEditor ? mdEditor.parentElement : null;
        const HIGHLIGHT_PADDING = 6;

        const saveRange = () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!range.collapsed && range.toString().trim().length > 0) {
                    lastRangeRef.current = range.cloneRange();
                    if (editorInstance) lastEditorSelectionRef.current = editorInstance.getSelection();
                    setHasSelection(true);
                } else {
                    lastRangeRef.current = null;
                    lastEditorSelectionRef.current = null;
                    setHasSelection(false);
                }
            }
        };
        const clearHighlight = () => { setHighlightStyle(null); isHighlightingRef.current = false; };
        const updateHighlightPosition = () => {
            if (!isHighlightingRef.current || !lastRangeRef.current || !scrollContainer || !highlightRef.current) return;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                if (!highlightRef.current) return;
                const range = lastRangeRef.current;
                const textRect = range.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                const visibleTop = Math.max(textRect.top, containerRect.top);
                const visibleBottom = Math.min(textRect.bottom, containerRect.bottom);
                const visibleHeight = visibleBottom - visibleTop;
                const el = highlightRef.current;
                if (visibleHeight > 0 && textRect.width > 0) {
                    el.style.display = 'block';
                    el.style.top = `${visibleTop - HIGHLIGHT_PADDING}px`;
                    el.style.left = `${textRect.left - HIGHLIGHT_PADDING}px`;
                    el.style.width = `${textRect.width + (HIGHLIGHT_PADDING * 2)}px`;
                    el.style.height = `${visibleHeight + (HIGHLIGHT_PADDING * 2)}px`;
                } else { el.style.display = 'none'; }
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
            if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; }
        };
    }, [view, editorContent]);

    // =========================================================
    // 기능 함수 (Git 분석, 저장, 채팅)
    // =========================================================
    const handleGitAnalysis = async () => {
        if (!window.confirm("Git 커밋 내역을 분석하여 리포트 내용을 덮어씌우시겠습니까?")) return;
        setIsAiThinking(true);
        try {
            const res = await api.post(`/api/projects/${projectId}/daily-reports/analyze`, { date: selectedDate });
            const analysisResult = res.content || res.data?.content || "# 분석된 내용\n\n결과 없음";
            if (editorRef.current) editorRef.current.setMarkdown(analysisResult);
            setMessages(prev => [...prev, { role: "assistant", text: "Git 커밋 분석이 완료되었습니다." }]);
        } catch (e) {
            console.error("Git 분석 실패", e);
            // 백엔드가 아직 준비 안 됐을 때를 위한 Fallback (임시 메시지)
            alert("서버 연결 실패: 백엔드에 /analyze 엔드포인트가 없습니다.\n(임시로 에디터에 더미 데이터를 넣습니다)");
            if (editorRef.current) editorRef.current.setMarkdown("# (임시) Git 분석 결과\n- 백엔드 연결 필요\n- 프론트엔드 테스트 중");
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const content = editorRef.current ? editorRef.current.getMarkdown() : "";
        try {
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/daily-reports/${currentReportId}`, { content });
            } else {
                await api.post(`/api/projects/${projectId}/daily-reports`, { date: selectedDate, content });
            }
            alert("저장되었습니다.");
            setView('list'); 
        } catch (e) { console.error(e); alert("저장 실패"); } 
        finally { setIsSaving(false); }
    };

    const handleChatFocus = () => {
        const range = lastRangeRef.current;
        if (range && range.getBoundingClientRect().width > 0) {
            isHighlightingRef.current = true;
            const rect = range.getBoundingClientRect();
            setHighlightStyle({ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 });
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const editorInstance = editorRef.current;
        if (hasSelection && lastEditorSelectionRef.current) {
            try { editorInstance.setSelection(lastEditorSelectionRef.current[0], lastEditorSelectionRef.current[1]); } catch(e){}
        }
        let contextText = "", isSelection = false, currentSelectionRange = null;
        const selectedMarkdown = editorInstance?.getSelectedText();
        if (selectedMarkdown && selectedMarkdown.trim().length > 0) {
            contextText = selectedMarkdown; isSelection = true; currentSelectionRange = editorInstance.getSelection();
        } else { contextText = editorInstance?.getMarkdown(); }

        const userMsg = { role: "user", text: input, hasContext: isSelection, selection: currentSelectionRange };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsAiThinking(true);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

        try {
            const res = await api.post(`/api/projects/${projectId}/reports/chat`, {
                message: userMsg.text, context: contextText, isSelection, reportType: "DAILY"
            });
            const reply = res.reply || res.data?.reply || "응답 오류";
            setMessages(prev => [...prev, { role: "assistant", text: reply, hasContext: isSelection, selection: currentSelectionRange }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", text: "오류가 발생했습니다." }]);
        } finally {
            setIsAiThinking(false);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    };

    const handleApply = (text, hasContext, selection, index) => {
        const editor = editorRef.current;
        if (!editor) return;
        if (!hasContext) editor.setMarkdown(text);
        else if (hasContext && selection) {
            editor.focus(); editor.setSelection(selection[0], selection[1]); editor.insertText(text);
        }
        setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isApplied: true } : msg));
    };

    // =========================================================
    // 렌더링 (View 1: List)
    // =========================================================
    if (view === 'list') {
        return (
            <div className="ai-report-container fade-in">
                <div className="ai-header-wrapper">
                    {/* [수정] showAiButton={false} 전달하여 버튼 제거 */}
                    {/* [수정] projectData가 로드되면 전달, 없으면 Loading */}
                    {projectData ? (
                        <ProjectHeader project={projectData} showAiButton={false} />
                    ) : (
                        <div className="header-loading">프로젝트 정보 로딩 중...</div>
                    )}
                    <button className="close-btn-overlay" onClick={() => navigate(-1)} title="나가기">✕</button>
                </div>

                <div className="date-nav-section">
                    <button className="nav-arrow" onClick={() => {
                        const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}>«</button>
                    
                    <div className="date-display" onClick={() => dateInputRef.current?.showPicker()}>
                        <h2>{selectedDate}</h2>
                        <span className="calendar-icon">📅</span>
                    </div>
                    <input 
                        type="date" ref={dateInputRef} className="hidden-date-input"
                        value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    />

                    <button className="nav-arrow" onClick={() => {
                        const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}>»</button>
                </div>

                <div className="report-list-grid">
                    <div className="report-card create-card" onClick={() => {
                        setCurrentReportId(null); setEditorContent(""); setView('editor');
                    }}>
                        <div className="create-icon">+</div>
                        <p>오늘의 리포트 작성하기</p>
                    </div>

                    {dailyReports.map(report => (
                        <div key={report.id} className={`report-card ${report.isMe ? 'my-card' : ''}`}
                            onClick={() => {
                                if (report.isMe) { setCurrentReportId(report.id); setView('editor'); }
                                else { alert("다른 사람의 리포트는 읽기 전용입니다."); }
                            }}
                        >
                            <div className="card-top">
                                <span className="writer-name">{report.writer} {report.isMe && "(나)"}</span>
                                <span className={`status-badge ${report.status}`}>{report.status}</span>
                            </div>
                            <div className="card-summary">{report.summary || "내용 없음"}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // =========================================================
    // 렌더링 (View 2: Editor)
    // =========================================================
    return (
        <div className="final-report-create-container">
            {highlightStyle && (
                <div ref={highlightRef} className="virtual-highlight"
                    style={{ top: highlightStyle.top, left: highlightStyle.left, width: highlightStyle.width, height: highlightStyle.height }}
                />
            )}

            <div className="frc-header">
                <div className="frc-title-area">
                    <span className="date-badge">{selectedDate}</span>
                    <span className="page-title">일일 리포트 작성</span>
                </div>
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => setView('list')}>목록으로</button>
                    <button className="frc-btn secondary magic-btn" onClick={handleGitAnalysis}>Git 분석</button>
                    <button className="frc-btn primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "저장 중..." : "저장"}
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
                                const isLastMessage = idx === messages.length - 1;
                                return (
                                    <div key={idx} className={`chat-bubble ${msg.role}`}>
                                        {msg.role === 'user' && msg.hasContext && <div className="msg-context-icon">부분 참조</div>}
                                        {msg.text}
                                        {msg.role === 'assistant' && idx !== 0 && (
                                            <div className="msg-actions">
                                                {isLastMessage && (
                                                    <button 
                                                        className={`action-btn apply ${msg.isApplied ? 'applied' : ''}`}
                                                        onClick={() => handleApply(msg.text, msg.hasContext, msg.selection, idx)}
                                                        disabled={msg.isApplied}
                                                    >
                                                        {msg.isApplied ? "적용 완료" : "에디터에 적용"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {isAiThinking && <div className="chat-bubble assistant loading">...</div>}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="frc-chat-input-area">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onFocus={handleChatFocus}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                placeholder={hasSelection ? "선택한 내용을 어떻게 수정할까요?" : "질문을 입력하세요..."}
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
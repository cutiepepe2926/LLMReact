import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api'; 
import ProjectHeader from '../projectHeader/ProjectHeader';
import './AiReportPage.css'; 

import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

const TOOLBAR_ITEMS = [['heading', 'bold', 'italic', 'strike'], ['hr', 'quote'], ['ul', 'ol', 'task', 'indent', 'outdent'], ['table', 'image', 'link'], ['code', 'codeblock']];

export default function AiReportPage() {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. projectId 결정 (URL 파라미터가 없으면 state에서 가져옴)
    const projectId = params.projectId || location.state?.projectData?.projectId;

    // 1-1. 상태 정의
    const today = new Date().toISOString().split('T')[0];
    const [projectData, setProjectData] = useState(location.state?.projectData || null);
    const [view, setView] = useState(location.state?.mode === 'create' ? 'editor' : 'list');
    const [selectedDate, setSelectedDate] = useState(today);
    const [dailyReports, setDailyReports] = useState([]); 
    const [currentReportId, setCurrentReportId] = useState(null);
    
    // 에디터 및 리포트 데이터 상태
    const [editorContent, setEditorContent] = useState("");
    const [summary, setSummary] = useState("");         
    const [commitCount, setCommitCount] = useState(0);   

    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false); 
    
    const dateInputRef = useRef(null);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const highlightRef = useRef(null);
    const lastSelectionRef = useRef(null);
    const lastRangeRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [hasSelection, setHasSelection] = useState(false);
    const [messages, setMessages] = useState([{ role: "assistant", text: "오늘 수행한 업무를 작성해주세요.", isNotification: true }]);
    const [input, setInput] = useState("");

    // 2. 기본 정보 조회
    const [myInfo, setMyInfo] = useState(null);
    useEffect(() => {
        const fetchEssential = async () => {
            if (!projectId) return;
            try {
                const [proj, user] = await Promise.all([
                    api.get(`/api/projects/${projectId}`),
                    api.get(`/api/user/info`)
                ]);
                setProjectData(proj);
                setMyInfo(user);
            } catch (e) { console.error("기본 정보 로드 실패:", e); }
        };
        fetchEssential();
    }, [projectId]);

    // 3. 리포트 목록 조회
    const fetchDailyReports = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await api.get(`/api/projects/${projectId}/daily-reports?date=${selectedDate}`);
            setDailyReports(Array.isArray(res) ? res : []);
        } catch (e) { setDailyReports([]); }
    }, [projectId, selectedDate]);

    // 목록 뷰거나 날짜가 바뀌면 리포트 다시 조회
    useEffect(() => { if (view === 'list') fetchDailyReports(); }, [view, selectedDate, fetchDailyReports]);

    // 4. 에디터 데이터 로드
    useEffect(() => {
        if (view !== 'editor' || !projectId) return;
        const loadEditorData = async () => {
            if (currentReportId) {
                // [기존 리포트 수정]
                try {
                    const res = await api.get(`/api/projects/${projectId}/${currentReportId}`);
                    setEditorContent(res.content || "");
                    setSummary(res.summary || "");           
                    setCommitCount(res.commitCount || 0);    
                    setIsReadOnly(res.status === 'PUBLISHED'); 
                } catch (e) { console.error(e); }
            } else {
                // [새 리포트 작성]
                setEditorContent("# 오늘의 업무\n\n(우측 상단의 'Git 분석' 버튼을 눌러보세요!)");
                setSummary("");
                setCommitCount(0);
                setIsReadOnly(false);
            }
        };
        loadEditorData();
    }, [view, currentReportId, projectId]);

    // 5. 에디터 생성 로직
    useEffect(() => {
        if (view !== 'editor' || !containerRef.current) return;
        const targetEl = containerRef.current;
        targetEl.innerHTML = ''; 

        const editorInstance = new Editor({
            el: targetEl,
            initialValue: editorContent,
            previewStyle: 'tab',
            height: '100%',
            initialEditType: 'markdown',
            hideModeSwitch: true,
            language: 'ko-KR',
            toolbarItems: isReadOnly ? [] : TOOLBAR_ITEMS, 
            viewer: isReadOnly 
        });
        
        editorRef.current = editorInstance;

        // 하이라이트 로직
        const updateHighlight = () => {
            const range = lastRangeRef.current;
            const highlightEl = highlightRef.current;
            if (!range || !highlightEl || isReadOnly) return;
            const rect = range.getBoundingClientRect();
            const containerRect = targetEl.getBoundingClientRect();
            const isOutside = (rect.bottom < containerRect.top + 45 || rect.top > containerRect.bottom);
            if (isOutside) { highlightEl.style.display = 'none'; } 
            else {
                highlightEl.style.display = 'block';
                highlightEl.style.top = `${rect.top}px`;
                highlightEl.style.left = `${rect.left}px`;
                highlightEl.style.width = `${rect.width}px`;
                highlightEl.style.height = `${rect.height}px`;
            }
        };

        const handleSelectionChange = () => {
            if (isReadOnly) return;
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!range.collapsed && targetEl.contains(range.commonAncestorContainer)) {
                    lastRangeRef.current = range.cloneRange();
                    lastSelectionRef.current = editorInstance.getSelection();
                    setHasSelection(true);
                    updateHighlight();
                } else if (range.collapsed) {
                    setHasSelection(false);
                    if (highlightRef.current) highlightRef.current.style.display = 'none';
                }
            }
        };

        const mdEditorEl = editorInstance.getEditorElements().mdEditor;
        if (mdEditorEl) {
            mdEditorEl.addEventListener('mouseup', handleSelectionChange);
            mdEditorEl.addEventListener('scroll', updateHighlight, { capture: true });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current = null;
            }
            targetEl.innerHTML = '';
        };
    }, [view, editorContent, isReadOnly]);

    // 6. Git 분석 핸들러 (UI 피드백 및 projectId 검사)
    const handleGitAnalysis = async () => {
        if (isAiThinking || isReadOnly) return;
        
        // projectId가 유효한지 확인
        if (!projectId) {
            alert("프로젝트 정보를 찾을 수 없습니다. 다시 시도해주세요.");
            return;
        }

        setIsAiThinking(true);
        setMessages(prev => [...prev, { role: "assistant", text: "🔍 Git 이력과 완료된 업무를 분석하고 있습니다. 잠시만 기다려주세요...", isNotification: true }]);
        
        try {
            console.log("Analyzing for Project ID:", projectId); // 디버깅용
            const res = await api.post(`/api/projects/${projectId}/daily-reports/analyze`, { date: selectedDate });
            
            if (res && typeof res === 'object') {
                if (editorRef.current) editorRef.current.setMarkdown(res.content || "");
                setSummary(res.summary || "");
                setCommitCount(res.commitCount || 0);
                setMessages(prev => [...prev, { role: "assistant", text: `✅ 분석이 완료되었습니다. (커밋 ${res.commitCount || 0}건 반영)`, isNotification: true }]);
            } else {
                if (editorRef.current) editorRef.current.setMarkdown(res || "");
            }
        } catch (e) { 
            console.error(e);
            alert("분석 실패: " + (e.message || "오류가 발생했습니다."));
            setMessages(prev => [...prev, { role: "assistant", text: "❌ 분석 중 오류가 발생했습니다.", isNotification: true }]);
        } finally { 
            setIsAiThinking(false); 
        }
    };

    // 7. 리포트 저장 핸들러
    const handleSave = async () => {
        if (isSaving || isAiThinking || isReadOnly) return;
        if (!projectId) return;
        
        setIsSaving(true);
        const content = editorRef.current.getMarkdown();
        
        let finalSummary = summary;
        if (!finalSummary || finalSummary.trim() === "") {
            const plainText = content.replace(/[#*`\[\]]/g, '').replace(/\n/g, ' ').trim();
            finalSummary = plainText.substring(0, 100) + (plainText.length > 100 ? "..." : "");
        }

        const saveData = { 
            reportDate: selectedDate, 
            content, 
            title: `${selectedDate} 리포트`,
            summary: finalSummary,
            commitCount: commitCount
        };

        try {
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/daily-reports/${currentReportId}`, saveData);
            } else {
                await api.post(`/api/projects/${projectId}/daily-reports`, saveData);
            }
            
            alert("저장되었습니다.");
            await fetchDailyReports(); 
            setView('list'); 

        } catch (e) { alert("저장 실패"); } 
        finally { setIsSaving(false); }
    };

    // 8. 메시지 전송 핸들러
    const sendMessage = async () => {
        if (!input.trim() || isAiThinking || isReadOnly) return;
        if (!projectId) return;

        const savedSelection = lastSelectionRef.current;
        let contextText = editorRef.current.getMarkdown();
        let isSelection = false;

        if (hasSelection && savedSelection) {
            isSelection = true;
            editorRef.current.setSelection(savedSelection[0], savedSelection[1]);
            contextText = editorRef.current.getSelectedText();
        }

        const userMsg = { role: "user", text: input, hasContext: isSelection, selection: isSelection ? savedSelection : null };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsAiThinking(true);
        setHasSelection(false);
        if (highlightRef.current) highlightRef.current.style.display = 'none';

        try {
            const res = await api.post(`/api/projects/${projectId}/reports/chat`, { message: userMsg.text, context: contextText, isSelection, reportType: "DAILY" });
            setMessages(prev => [...prev, { role: "assistant", text: res.reply || res.data?.reply }]);
        } catch (e) { setMessages(prev => [...prev, { role: "assistant", text: "오류 발생" }]); } 
        finally { setIsAiThinking(false); }
    };

    // 9. 에디터 적용 핸들러
    const handleApply = (text, hasContext, selection, idx) => {
        if (!editorRef.current || isReadOnly) return;
        if (hasContext && selection) {
            editorRef.current.setSelection(selection[0], selection[1]);
            setTimeout(() => { 
                editorRef.current.replaceSelection(text);
                setHasSelection(false);
                if (highlightRef.current) highlightRef.current.style.display = 'none';
            }, 10);
        } else {
            editorRef.current.insertText(text);
        }
        setMessages(prev => prev.map((msg, i) => i === idx ? { ...msg, isApplied: true } : msg));
    };

    const hasMyReport = dailyReports.some(r => String(r.userId) === String(myInfo?.userId));
    const showCreateButton = (selectedDate === today) && !hasMyReport;

    const getDisplayRole = (report) => {
        if (report.role) return report.role; 
        return 'MEMBER';
    };

    // 10. 목록 뷰 렌더링
    if (view === 'list') {
        return (
            <div className="ai-report-container fade-in">
                <div className="ai-header-wrapper">
                    {projectData ? <ProjectHeader project={projectData} showAiButton={false} /> : null}
                    <button className="close-btn-overlay" onClick={() => navigate(-1)}>✕</button>
                </div>
                <div className="date-nav-section">
                    <button className="nav-arrow" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }}>«</button>
                    <div className="date-display" onClick={() => dateInputRef.current?.showPicker()}><h2>{selectedDate}</h2><span>📅</span></div>
                    <input type="date" ref={dateInputRef} className="hidden-date-input" max={today} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <button className="nav-arrow" disabled={selectedDate >= today} onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }}>»</button>
                </div>
                <div className="report-list-grid">
                    {showCreateButton && (
                        <div className="report-card create-card" onClick={() => { setCurrentReportId(null); setView('editor'); }}>
                            <div className="create-icon">+</div><p>오늘의 리포트 작성하기</p>
                        </div>
                    )}
                    {dailyReports.map(report => {
                        const isMyReport = String(report.userId) === String(myInfo?.userId);
                        
                        return (
                            <div key={report.reportId} className={`report-card ${isMyReport ? 'my-report' : ''}`} onClick={() => { setCurrentReportId(report.reportId); setView('editor'); }}>
                                <div className="card-top">
                                    <span className="writer-info">
                                        <strong>{report.writerName}</strong> | <small>{getDisplayRole(report)}</small>
                                    </span>
                                    <span className={`status-badge ${report.status}`}>{report.status === 'PUBLISHED' ? '작성 완료' : '작성 중'}</span>
                                </div>
                                <div className="card-mid">
                                    <p className="commit-info">커밋: <strong>{report.commitCount !== undefined ? report.commitCount : 0}건</strong></p>
                                    <p className="card-summary">{report.summary || "주요 작업 내용이 없습니다."}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 11. 에디터 뷰 렌더링
    return (
        <div className="final-report-create-container">
            <div className="frc-header">
                <div className="frc-title-area"><span>{selectedDate}</span><span className="page-title">일일 리포트 작성</span></div>
                <div className="frc-header-actions">
                    <button className="frc-btn secondary" onClick={() => setView('list')}>목록으로</button>
                    {!isReadOnly && (
                        <>
                            <button className={`frc-btn secondary magic-btn ${isAiThinking ? 'loading' : ''}`} onClick={handleGitAnalysis} disabled={isAiThinking}>
                                {isAiThinking ? "🤖 분석 중..." : "Git 분석"}
                            </button>
                            <button className="frc-btn primary" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "저장 중..." : "저장"}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="frc-body">
                <section className="frc-left">
                    <div className="editor-wrapper" style={{ height: '100%', position: 'relative' }}>
                        <div ref={highlightRef} className="virtual-highlight" style={{ display: 'none' }} />
                        <div style={{ height: '100%' }}><div ref={containerRef} style={{ height: '100%' }} /></div>
                    </div>
                </section>
                <section className="frc-right">
                    <div className="frc-chat-container">
                        <div className="frc-chat-header">AI Assistant {isReadOnly && "(읽기 전용)"}</div>
                        <div className="frc-chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={`msg-${idx}`} className={`chat-bubble ${msg.role}`}>
                                    {msg.hasContext && <div className="msg-context-icon">부분 참조</div>}
                                    <div>{msg.text}</div>
                                    {!isReadOnly && idx === messages.length - 1 && !msg.isNotification && msg.role === 'assistant' && (
                                        <div className="msg-actions">
                                            <button className={`action-btn apply ${msg.isApplied ? 'applied' : ''}`} onClick={() => handleApply(msg.text, msg.hasContext, msg.selection, idx)} disabled={msg.isApplied}>적용</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {!isReadOnly && (
                            <div className="frc-chat-input-wrapper">
                                {hasSelection && <div className="reference-indicator">🎯 선택된 텍스트 참조 중</div>}
                                <div className="input-row">
                                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="질문 입력..." disabled={isAiThinking} />
                                    <button onClick={sendMessage} disabled={isAiThinking || !input.trim()}>전송</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
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
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. 상태 정의
    const today = new Date().toISOString().split('T')[0];
    const [projectData, setProjectData] = useState(location.state?.projectData || null);
    const [view, setView] = useState(location.state?.mode === 'create' ? 'editor' : 'list');
    const [selectedDate, setSelectedDate] = useState(today);
    const [dailyReports, setDailyReports] = useState([]); 
    const [currentReportId, setCurrentReportId] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false); // 마감된 리포트 체크
    
    const dateInputRef = useRef(null);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const highlightRef = useRef(null);
    const lastSelectionRef = useRef(null);
    const lastRangeRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [hasSelection, setHasSelection] = useState(false);
    const [messages, setMessages] = useState([{ role: "assistant", text: "업무 내용을 작성하고 '발행'하면 마감됩니다.", isNotification: true }]);
    const [input, setInput] = useState("");

    // 2. 프로젝트 정보 및 내 정보 조회
    const [myInfo, setMyInfo] = useState(null);
    useEffect(() => {
        const fetchEssential = async () => {
            try {
                const [proj, user] = await Promise.all([
                    api.get(`/api/projects/${projectId}`),
                    api.get(`/api/user/info`)
                ]);
                setProjectData(proj);
                setMyInfo(user);
            } catch (e) { console.error(e); }
        };
        fetchEssential();
    }, [projectId]);

    // 3. 리포트 목록 조회
    const fetchDailyReports = useCallback(async () => {
        try {
            const res = await api.get(`/api/projects/${projectId}/daily-reports?date=${selectedDate}`);
            setDailyReports(Array.isArray(res) ? res : []);
        } catch (e) { setDailyReports([]); }
    }, [projectId, selectedDate]);

    useEffect(() => { if (view === 'list') fetchDailyReports(); }, [view, selectedDate, fetchDailyReports]);

    // 4. 에디터 데이터 로드 및 마감 상태 확인
    useEffect(() => {
        if (view !== 'editor') return;
        const loadEditorData = async () => {
            if (currentReportId) {
                try {
                    const res = await api.get(`/api/projects/${projectId}/${currentReportId}`);
                    setEditorContent(res.content || "");
                    setIsReadOnly(res.status === 'PUBLISHED'); // 발행 상태면 읽기 전용
                } catch (e) { console.error(e); }
            } else {
                setEditorContent("# 오늘의 업무\n\n(우측 상단의 'Git 분석' 버튼을 눌러보세요!)");
                setIsReadOnly(false);
            }
        };
        loadEditorData();
    }, [view, currentReportId, projectId]);

    // 5. 에디터 생성 로직 (방어 코드 포함)
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
            toolbarItems: isReadOnly ? [] : TOOLBAR_ITEMS, // 마감 시 툴바 제거
            viewer: isReadOnly // 마감 시 뷰어 모드
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
                try { editorRef.current.destroy(); editorRef.current = null; } catch (e) {}
            }
            targetEl.innerHTML = '';
        };
    }, [view, editorContent, isReadOnly]);

    // 6. Git 분석 핸들러
    const handleGitAnalysis = async () => {
        if (isAiThinking || isReadOnly) return;
        setIsAiThinking(true);
        try {
            const res = await api.post(`/api/projects/${projectId}/daily-reports/analyze`, { date: selectedDate });
            if (editorRef.current) editorRef.current.setMarkdown(res.content || "");
        } catch (e) { alert("분석 실패"); } 
        finally { setIsAiThinking(false); }
    };

    // 7. 리포트 저장(임시) 및 발행(마감) 핸들러
    const handleSave = async (isPublish = false) => {
        if (isSaving || isAiThinking || isReadOnly) return;
        if (isPublish && !window.confirm("발행 후에는 수정할 수 없습니다. 정말 마감하시겠습니까?")) return;

        setIsSaving(true);
        const content = editorRef.current.getMarkdown();
        const saveData = { reportDate: selectedDate, content, title: `${selectedDate} 리포트` };

        try {
            let reportId = currentReportId;
            if (currentReportId) {
                await api.put(`/api/projects/${projectId}/daily-reports/${currentReportId}`, saveData);
            } else {
                const res = await api.post(`/api/projects/${projectId}/daily-reports`, saveData);
                reportId = res.reportId || res.data?.reportId;
            }

            // [마감 처리] 발행 버튼 클릭 시
            if (isPublish && reportId) {
                await api.patch(`/api/projects/${projectId}/daily-reports/${reportId}/publish`);
            }

            alert(isPublish ? "발행 완료되었습니다." : "임시 저장되었습니다.");
            setView('list'); 
        } catch (e) { alert("처리 실패"); } 
        finally { setIsSaving(false); }
    };

    // 8. 메시지 전송 핸들러 (동일)
    const sendMessage = async () => {
        if (!input.trim() || isAiThinking || isReadOnly) return;
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

    // 9. 에디터 적용 핸들러 (동일)
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

    // [로직] 내 리포트가 있는지 확인
    const hasMyReport = dailyReports.some(r => r.userId === myInfo?.userId);

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
                    {/* [수정] 내 리포트가 없을 때만 작성 카드 노출 */}
                    {!hasMyReport && (
                        <div className="report-card create-card" onClick={() => { setCurrentReportId(null); setView('editor'); }}>
                            <div className="create-icon">+</div><p>오늘의 리포트 작성하기</p>
                        </div>
                    )}
                    {dailyReports.map(report => (
                        <div key={report.reportId} className={`report-card ${report.userId === myInfo?.userId ? 'my-report' : ''}`} onClick={() => { setCurrentReportId(report.reportId); setView('editor'); }}>
                            <div className="card-top">
                                <span className="writer-info">
                                    <strong>{report.writerName}</strong> | <small>{report.role || 'MEMBER'}</small>
                                </span>
                                <span className={`status-badge ${report.status}`}>{report.status === 'PUBLISHED' ? '작성 완료' : 'AI 초안'}</span>
                            </div>
                            <div className="card-mid">
                                <p className="commit-info">커밋: <strong>{report.commitCount || 0}건</strong></p>
                                <p className="card-summary">{report.summary || "주요 작업: 없음"}</p>
                            </div>
                        </div>
                    ))}
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
                            <button className="frc-btn secondary magic-btn" onClick={handleGitAnalysis} disabled={isAiThinking}>Git 분석</button>
                            <button className="frc-btn secondary" onClick={() => handleSave(false)} disabled={isSaving}>임시 저장</button>
                            <button className="frc-btn primary" onClick={() => handleSave(true)} disabled={isSaving}>발행</button>
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
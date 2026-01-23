import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiReportPage.css';
import ProjectHeader from "../projectHeader/ProjectHeader";

const AiReportPage = () => {
  const [view, setView] = useState('list');
  const navigate = useNavigate();

  // 날짜 상태
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 채팅 관련 상태
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: '리포트 초안입니다. 수정할 내용이 있다면 말씀해주세요.' }
  ]);
  const chatEndRef = useRef(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (view === 'editor') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  // 목업 데이터
  const members = [
    { id: 1, name: '홍길동', role: 'OWNER', status: 'AI_DRAFT', commits: 5, summary: '로그인 기능 보완, CSS 수정', isMe: true },
    { id: 2, name: '김철수', role: 'MANAGER', status: 'COMPLETED', commits: 5, summary: 'DB 스키마 설계', isMe: false },
    { id: 3, name: '이영희', role: 'MEMBER', status: 'NO_ACTIVITY', commits: 0, summary: '없음', isMe: false },
  ];

  const renderBadge = (status) => {
    switch (status) {
        case 'AI_DRAFT': return <span className="badge badge-blue">AI 초안</span>;
        case 'COMPLETED': return <span className="badge badge-green">작성 완료</span>;
        case 'NO_ACTIVITY': return <span className="badge badge-gray">활동 없음</span>;
        default: return null;
      }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { id: Date.now(), type: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: '반영했습니다.' }]);
    }, 1000);
  };

  // 날짜 변경 핸들러
  const dateInputRef = useRef(null);
  const handleDateClick = () => {
    // 버튼 클릭 시 숨겨진 input 창 열기
    dateInputRef.current?.showPicker();
  };

  // 공통 헤더 렌더링
  const renderHeader = (isDetailView = false) => (
    <div className="header-wrapper">
      <ProjectHeader 
        title="프로젝트 제목입니다"
        dDay={10}
        periodText="기간: 2026.01.01 ~ 2026.02.02"
      />
      {/* 닫기 버튼 */}
      <button 
        className="close-btn-overlay" 
        onClick={() => isDetailView ? setView('list') : navigate(-1)} 
        title="닫기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );

  // --- [1] 목록 화면 ---
  if (view === 'list') {
    return (
      <div className="report-container fade-in">
        {renderHeader(false)}

        <div className="date-nav">
          <button className="nav-arrow">«</button>
          <h2>{selectedDate}</h2>
          <button className="nav-arrow">»</button>
          
          {/* [복구] 원래 버튼 디자인 + 기능 연결 */}
          <button className="calendar-btn" onClick={handleDateClick}>
            📅 {selectedDate} ▾
          </button>
          <input 
            type="date" 
            ref={dateInputRef}
            className="hidden-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="card-grid">
          {members.map((m) => (
            <div 
              key={m.id} 
              className={`member-card ${m.status === 'NONE' ? 'empty' : ''}`}
              onClick={() => {
                if (m.isMe && m.status === 'AI_DRAFT') setView('editor');
                else if (m.status === 'COMPLETED') setView('read');
              }}
            >
              <div className="card-top">
                <span className="name">{m.name} {m.isMe && '(나)'}</span>
                <span className="role">{m.role}</span>
              </div>
              {m.status !== 'NONE' && (
                <div className="card-content">
                  <div className="info-row">상태: {renderBadge(m.status)}</div>
                  <div className="info-row">커밋: <b>{m.commits}건</b></div>
                  <div className="info-row summary">주요 작업: {m.summary}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- [2] 작성 화면 ---
  if (view === 'editor') {
    return (
      <div className="report-container fade-in">
        {renderHeader(true)}

        <div className="split-view">
          <div className="panel left-panel">
            <div className="panel-header-row">
                <h3>{selectedDate} 리포트 초안</h3>
                <button className="btn-regenerate" onClick={() => setIsRegenerating(true)}>
                    {isRegenerating ? '분석 중...' : 'Git 다시 분석'}
                </button>
            </div>
            <div className="editor-box">
              <h4>상세 분석 및 요약</h4>
              <textarea defaultValue={`금일 프론트엔드 로그인 기능 구현...`} />
              
              <h4>활동 내역 타임라인</h4>
              <ul className="timeline">
                <li><span className="time">10:00</span> [Commit] feat: 로그인 UI</li>
                <li><span className="time blue">12:00</span> [Task Done] 로그인 구현</li>
              </ul>
              
              <h4>완료 업무 리스트</h4>
              <div className="todo-check">
                <input type="checkbox" checked readOnly /> <span>로그인 화면 구현</span>
              </div>
            </div>
          </div>

          <div className="panel right-panel">
            <h3>AI 수정 요청</h3>
            <div className="chat-area">
              {messages.map((msg) => (
                <div key={msg.id} className={`bubble ${msg.type}`}>{msg.text}</div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-wrapper">
              <input 
                className="chat-input-field" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="수정 요청..."
              />
              <button className="chat-send-btn" onClick={handleSendMessage}>➤</button>
            </div>
            <div className="button-group">
                <button className="btn-temp-save">임시 저장</button>
                <button className="btn-publish" onClick={() => setView('list')}>발행</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- [3] 읽기 화면 ---
  if (view === 'read') {
    return (
      <div className="report-container fade-in">
        {renderHeader(true)}
        <div className="split-view">
          <div className="panel left-panel">
            <div className="panel-header-row">
                <h3>{selectedDate} 리포트</h3>
                <span className="badge badge-green">발행됨</span>
            </div>
            <div className="editor-box">
              <h4>상세 분석 및 요약</h4>
              <div className="read-content">
                금일 프론트엔드 작업을 완료했습니다.
              </div>
              <h4>완료 업무 리스트</h4>
              <div className="todo-check">
                <input type="checkbox" checked readOnly /> <span>로그인 화면 구현</span>
              </div>
            </div>
          </div>
          <div className="panel right-panel">
            <h3>리포트 정보</h3>
            <div className="info-meta">
                <p><b>작성자:</b> 홍길동</p>
                <p><b>발행 일시:</b> {selectedDate} 18:00</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default AiReportPage;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiReportPage.css';
import ProjectHeader from "../projectHeader/ProjectHeader";

const AiReportPage = () => {
  const [view, setView] = useState('list');
  const navigate = useNavigate();

  // 채팅 관련 상태
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: '초안을 작성했습니다. 수정할 내용이 있다면 알려주세요!' }
  ]);
  const chatEndRef = useRef(null);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    if (view === 'editor') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const members = [
    { id: 1, name: '홍길동', role: 'OWNER', status: 'AI_DRAFT', commits: 5, summary: '로그인 기능 보완, CSS 수정', isMe: true },
    { id: 2, name: '김철수', role: 'MANAGER', status: 'COMPLETED', commits: 5, summary: 'DB 스키마 설계', isMe: false },
    { id: 3, name: '이영희', role: 'MEMBER', status: 'NO_ACTIVITY', commits: 0, summary: '없음', isMe: false },
    { id: 4, name: '박민수', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
    { id: 5, name: '최유리', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
    { id: 6, name: '정수철', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
  ];

  const renderBadge = (status) => {
    switch (status) {
        case 'AI_DRAFT': return <span className="badge badge-blue">AI 초안</span>;
        case 'COMPLETED': return <span className="badge badge-green">작성 완료</span>;
        case 'NO_ACTIVITY': return <span className="badge badge-gray">활동 없음</span>;
        default: return null;
      }
  };

  const renderHeader = (isDetailView = false) => (
    <div className="header-wrapper">
      <ProjectHeader 
        title="프로젝트 제목입니다"
        dDay={10}
        periodText="기간: 2026.01.01 ~ 2026.02.02"
      />

      <button 
        className="close-btn-overlay" 
        onClick={() => isDetailView ? setView('list') : navigate(-1)} 
        aria-label="닫기"
        title={isDetailView ? "목록으로 돌아가기" : "나가기"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // 사용자 메시지 추가
    const newMsg = { id: Date.now(), type: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // AI 응답 시뮬레이션 (1초 후)
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, type: 'ai', text: '요청하신 내용을 반영하여 리포트를 수정했습니다.' }
      ]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // --- 목록 화면 ---
  if (view === 'list') {
    return (
      <div className="report-container fade-in">
        {renderHeader(false)}

        <div className="date-nav">
          <button className="nav-arrow">«</button>
          <h2>2026.01.15</h2>
          <button className="nav-arrow">»</button>
          <button className="calendar-btn">📅 2026.01.15 ▾</button>
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

  // --- 작성 화면 ---
  if (view === 'editor') {
    return (
      <div className="report-container fade-in">
        {renderHeader(true)}

        <div className="split-view">
          <div className="panel left-panel">
            <h3>2026.01.15 리포트 초안</h3>
            <div className="editor-box">
              <h4>상세 분석 및 요약</h4>
              <textarea 
                defaultValue={`금일 프론트엔드 로그인 기능 구현에 집중하여 총 3건의 커밋을 수행했습니다. 로그아웃 기능에 중점을 두어 작업했습니다.`} 
              />
              <h4>활동 내역 타임라인</h4>
              <ul className="timeline">
                <li><span className="time">10:00</span> [Commit] feat: 로그인 폼 UI 구현</li>
                <li><span className="time blue">12:00</span> [Task Done] 로그인 화면 구현</li>
              </ul>
              <h4>완료 업무 리스트</h4>
              <div className="todo-check">
                <input type="checkbox" checked readOnly /> 로그인 화면 구현
              </div>
            </div>
          </div>

          <div className="panel right-panel">
            <h3>AI 수정 요청하기</h3>
            <div className="chat-area">
              {messages.map((msg) => (
                <div key={msg.id} className={`bubble ${msg.type}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input 
                placeholder="요청 사항 입력..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSendMessage}>전송</button>
            </div>
            <button className="save-btn" onClick={() => setView('list')}>저장하기</button>
          </div>
        </div>
      </div>
    );
  }

  // --- 읽기 화면 ---
  if (view === 'read') {
    return (
      <div className="report-container fade-in">
        {renderHeader(true)}

        <div className="split-view">
          <div className="panel left-panel">
            <h3>2026.01.14 리포트</h3>
            <div className="editor-box">
              <h4>상세 분석 및 요약</h4>
              <textarea 
                readOnly
                value={`금일 프론트엔드 로그인 기능 구현에 집중하여 총 3건의 커밋을 수행했습니다.\n로그아웃 기능에 중점을 두어 작업했습니다.\n예정된 업무 1건을 기한 내에 성공적으로 완료했습니다.`} 
              />
              
              <h4>활동 내역 타임라인</h4>
              <ul className="timeline">
                <li><span className="time">10:00</span> [Commit] feat: 로그인 폼 UI 구현 (+3 file)</li>
                <li><span className="time">11:00</span> [Commit] feat: 로그인 폼 UI 구현 (+3 file)</li>
                <li><span className="time blue">12:00</span> [Task Done] feat: 로그인 폼 UI 구현 (+3 file)</li>
              </ul>

              <h4>완료 업무 리스트</h4>
              <div className="todo-check">
                <input type="checkbox" checked readOnly /> 로그인 화면 구현
              </div>
            </div>
          </div>

          <div className="panel right-panel">
            <h3>리포트 정보</h3>
            <div style={{marginTop: '15px', color: '#4b5563', fontSize: '0.95rem'}}>
                <p style={{marginBottom: '10px'}}><b>작성자:</b> 홍길동</p>
                <p><b>발행 일시:</b> 2026.01.01 12:00:00</p>
            </div>

            <hr style={{margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />

            <h3>활동 로그</h3>
            <ul style={{
                listStyle: 'none', 
                padding: 0, 
                marginTop: '15px', 
                color: '#374151', 
                fontSize: '0.9rem', 
                lineHeight: '1.8'
            }}>
                <li>• [12:00] 홍길동님의 리포트 초안이 발행되었습니다.</li>
                <li>• [12:30] AI가 수정 요청(...)을 반영했습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
};

export default AiReportPage;
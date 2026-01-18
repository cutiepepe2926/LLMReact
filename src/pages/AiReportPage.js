import React, { useState } from 'react';
import './AiReportPage.css';

const AiReportPage = ({ onBack }) => {
  // view 상태: 'list'(목록), 'editor'(작성), 'read'(읽기)
  const [view, setView] = useState('list');

  // 목업 데이터 (피그마 이미지 기반)
  const members = [
    { id: 1, name: '홍길동', role: 'OWNER', status: 'AI_DRAFT', commits: 5, summary: '로그인 기능 보완, CSS 수정', isMe: true },
    { id: 2, name: '김철수', role: 'MANAGER', status: 'COMPLETED', commits: 5, summary: 'DB 스키마 설계', isMe: false },
    { id: 3, name: '이영희', role: 'MEMBER', status: 'NO_ACTIVITY', commits: 0, summary: '없음', isMe: false },
    { id: 4, name: '박민수', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
    { id: 5, name: '최유리', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
    { id: 6, name: '정수철', role: 'MEMBER', status: 'NONE', commits: 0, summary: '', isMe: false },
  ];

  // 상태 뱃지 렌더링
  const renderBadge = (status) => {
    switch (status) {
      case 'AI_DRAFT': return <span className="badge badge-blue">AI 초안</span>;
      case 'COMPLETED': return <span className="badge badge-green">작성 완료</span>;
      case 'NO_ACTIVITY': return <span className="badge badge-gray">활동 없음</span>;
      default: return null;
    }
  };

  // --- 1. 메인 리스트 화면 ---
  if (view === 'list') {
    return (
      <div className="report-container fade-in">
        {/* 상단 헤더 (타이머 포함) */}
        <header className="report-header">
          <div>
            <div className="title-row">
              <h1>프로젝트 제목입니다</h1>
              <span className="d-day">D - 10</span>
            </div>
            <p className="period">기간: 2026.01.01 ~ 2026.02.02</p>
          </div>
          <div className="header-right">
             {/* 타이머 */}
            <button className="close-btn" onClick={onBack}>대시보드로 돌아가기</button>
          </div>
        </header>

        {/* 날짜 네비게이션 */}
        <div className="date-nav">
          <button className="nav-arrow">«</button>
          <h2>2026.01.15</h2>
          <button className="nav-arrow">»</button>
          <button className="calendar-btn">📅 2026.01.15 ▾</button>
        </div>

        {/* 멤버 카드 그리드 */}
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

  // --- 2. 작성 화면 ---
  if (view === 'editor') {
    return (
      <div className="report-container fade-in">
        <header className="report-header">
           {/* 헤더 동일 */}
          <div>
            <div className="title-row"><h1>프로젝트 제목입니다</h1><span className="d-day">D - 10</span></div>
            <p className="period">기간: 2026.01.01 ~ 2026.02.02</p>
          </div>
          <div className="header-right">
            <button className="close-btn" onClick={() => setView('list')}>목록으로</button>
          </div>
        </header>

        <div className="split-view">
          {/* 좌측: 리포트 에디터 */}
          <div className="panel left-panel">
            <h3>2026.01.15 리포트 초안</h3>
            <div className="editor-box">
              <h4>상세 분석 및 요약</h4>
              <textarea 
                defaultValue={`금일 프론트엔드 로그인 기능 구현에 집중하여 총 3건의 커밋을 수행했습니다. 로그아웃 기능에 중점을 두어 작업했습니다. 예정된 업무 1건을 기한 내에 성공적으로 완료했습니다.`} 
              />
              <h4>활동 내역 타임라인</h4>
              <ul className="timeline">
                <li><span className="time">10:00</span> [Commit] feat: 로그인 폼 UI 구현 (+3 file)</li>
                <li><span className="time">11:00</span> [Commit] fix: 유효성 검사 수정 (+1 file)</li>
                <li><span className="time blue">12:00</span> [Task Done] 로그인 화면 구현</li>
              </ul>
              <h4>완료 업무 리스트</h4>
              <div className="todo-check">
                <input type="checkbox" checked readOnly /> 로그인 화면 구현
              </div>
            </div>
          </div>

          {/* 우측: AI 채팅 */}
          <div className="panel right-panel">
            <h3>AI 수정 요청하기</h3>
            <div className="chat-area">
              <div className="bubble ai">초안을 작성했습니다. 수정할 내용이 있다면 알려주세요!</div>
              <div className="bubble user">~~부분 수정해줘</div>
            </div>
            <div className="chat-input">
              <input placeholder="AI에게 요청할 내용을 입력하세요..." />
              <button>전송</button>
            </div>
            <button className="save-btn" onClick={() => setView('list')}>저장하기</button>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. 읽기 전용 화면 ---
  if (view === 'read') {
    return (
      <div className="report-container fade-in">
         {/* 헤더 생략 (위와 동일) */}
         <header className="report-header">
            <div><div className="title-row"><h1>프로젝트 제목입니다</h1><span className="d-day">D - 10</span></div></div>
            <button className="close-btn" onClick={() => setView('list')}>닫기</button>
         </header>

         <div className="split-view">
            <div className="panel left-panel">
              <h3>2026.01.14 리포트</h3>
              <div className="read-box">
                <h4>상세 분석 및 요약</h4>
                <p>금일 프론트엔드 로그인 기능 구현에 집중하여 총 3건의 커밋을 수행했습니다...</p>
                {/* 내용 생략 */}
              </div>
            </div>
            <div className="panel right-panel info-panel">
              <h3>리포트 정보</h3>
              <p><b>작성자:</b> 김철수</p>
              <p><b>발행 일시:</b> 2026.01.14 18:00</p>
              <hr/>
              <h4>활동 로그</h4>
              <ul>
                <li>[12:00] 리포트 초안 발행</li>
                <li>[18:00] 김철수님 발행 완료</li>
              </ul>
            </div>
         </div>
      </div>
    );
  }
};

export default AiReportPage;
import React from 'react';
import TopNav from "./component/TopNav/TopNav";
import ProjectHeader from "./component/ProjectHeader/ProjectHeader";
import TabMenu from "./component/TabMenu/TabMenu";
import './App.css';

function App() {

  const TABS = [
    { key: "dashboard", label: "대시보드" },
    { key: "task", label: "업무" },
    { key: "report", label: "AI 리포트" },
    { key: "final_report", label: "최종 리포트" },
    { key: "member", label: "멤버"},
  ];

  const [activeTab, setActiveTab] = React.useState("project");


  return (
      <div className="dashboard-container">
        {/* 1. 상단 네비게이션 */}
        <TopNav></TopNav>

        {/* 2. 프로젝트 헤더 */}
        <ProjectHeader
            title="프로젝트 제목입니다"
            dDay={10}
            periodText="기간: 2026.01.01 ~ 2026.02.02"
            onClickAiReport={() => console.log("AI 리포트 클릭")}
        />


        {/* 3. 탭 메뉴 */}
        <TabMenu tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

        {/* 4. 대시보드 메인 그리드 */}
        <main className="dashboard-grid">

          {/* 왼쪽 섹션 */}
          <div className="column">
            <div className="card work-progress-card">
              <span>진행중인 업무</span>
              <span style={{fontSize: '1.2rem'}}>10/50</span>
            </div>
            <div className="card status-chart-card">
              <h3 style={{margin: 0}}>프로젝트 현황</h3>
              <div className="chart-placeholder">
                일별 멤버 커밋 수<br/>원형 그래프
              </div>
            </div>
          </div>

          {/* 중앙 섹션 */}
          <div className="column">
            <div className="stat-grid">
              <div className="card stat-box">
                <div style={{fontSize: '0.9rem', marginBottom: '8px'}}>오픈 이슈</div>
                <div style={{fontWeight: 'bold'}}>3건</div>
              </div>
              <div className="card stat-box">
                <div style={{fontSize: '0.9rem', marginBottom: '8px'}}>오늘 커밋</div>
                <div style={{fontWeight: 'bold'}}>5건</div>
              </div>
            </div>
            <div className="card">
              <h3 style={{margin: 0}}>최근 활동 로그</h3>
              <div className="activity-list">
                <div className="log-item"><div className="user-avatar"></div> user1 commit: commit</div>
                <div className="log-item"><div className="user-avatar" style={{backgroundColor: '#e91e63'}}></div> user2 aaaaa</div>
                <div className="log-item"><div className="user-avatar" style={{backgroundColor: '#00bcd4'}}></div> user3 bbbbb</div>
                <div className="log-item"><div className="user-avatar"></div> user1 ccccc</div>
              </div>
            </div>
          </div>

          {/* 오른쪽 섹션 */}
          <div className="card">
            <h3 style={{margin: 0}}>나의 할 일</h3>
            <ul className="todo-list">
              <li className="todo-item">
                <input type="checkbox" defaultChecked />
                <span>문서 작성</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 1</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 2</span>
              </li>
              <li className="todo-item">
                <input type="checkbox" />
                <span>업무 3</span>
              </li>
            </ul>
          </div>

        </main>
      </div>
  );
}
export default App;

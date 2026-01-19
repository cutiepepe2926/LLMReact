import React, { useState } from 'react';
import TopNav from "./component/shared/TopNav";
import ProjectListPage from "./component/project/ProjectListPage";       // 1. 목록 화면
import ProjectDashboardPage from "./component/dashboard/ProjectDashboardPage"; // 2. 상세 대시보드 화면
import AiReportPage from "./component/report/AiReportPage";             // 3. AI 리포트 화면
import './App.css';

function App() {

  const [view, setView] = useState('list');

  return (
      <div className="dashboard-container">
        {/* 1. 상단 네비게이션 (공통 영역 유지) */}
        <TopNav />

        {/* 2. 화면 전환 로직 */}
        
        {/* CASE 1: 프로젝트 목록 화면 */}
        {view === 'list' && (
          <ProjectListPage 
            onEnterDashboard={() => setView('dashboard')} 
          />
        )}

        {/* CASE 2: 프로젝트 상세 대시보드 화면 */}
        {view === 'dashboard' && (
          <ProjectDashboardPage 
            onBack={() => setView('list')}           // 목록으로 돌아가기
            onEnterReport={() => setView('report')}  // AI 리포트로 진입
          />
        )}

        {/* CASE 3: AI 리포트 화면 */}
        {view === 'report' && (
          <AiReportPage 
            onBack={() => setView('dashboard')}      // 상세 대시보드로 돌아가기
          />
        )}

      </div>
  );
}

export default App;
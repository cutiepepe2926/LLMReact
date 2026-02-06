import { Route, Routes } from "react-router-dom";
import './App.css';
import Login from "./component/Login/Login";
import Signup from "./component/SignUp/SignUp"
import ProjectList from "./component/project/ProjectListPage";
import ProjectDashBoard from "./component/projectDashBoard/ProjectDashBoard";
import AiReport from "./component/report/AiReportPage";
import FinalReportCreatePage
    from "./component/projectDashBoard/Grids/FinalReportGrid/FinalReportCreatePage/FinalReportCreatePage";
import MyPage from "./component/myPage/MyPage";
import ModProfile from "./component/modProfile/ModProfile";
import MainLayout from "./layout/MainLayout";
import LandingPage from "./component/LandingPage/LandingPage";
import AuthHandler from "./auth/AuthHandler"; // [추가] 경로가 맞는지 확인해주세요!

function App() {

  return(
    <Routes>
      {/* 1. 공개 라우트: 로그인 없이 접속 가능 */}
        <Route path={'/'} element={<LandingPage />} />
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/signup'} element={<Signup/>}/>

      {/* 2. 보호된 라우트: 로그인이 있어야만 접근 가능 */}
      {/* 가장 바깥에서 AuthHandler가 토큰을 검사합니다. */}
      <Route element={<AuthHandler />}>
          {/* 검사가 통과되면 MainLayout(상단바, 사이드바 등)이 그려집니다. */}
          <Route element={<MainLayout />}>
            {/* 그 안에 실제 페이지 내용이 들어갑니다. */}
            <Route path={'/myPage'} element={<MyPage/>}/>
            <Route path={'/modProfile'} element={<ModProfile/>}/>
            <Route path={'/projectList'} element={<ProjectList/>}/>
            <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
            <Route path={'/project/:projectId/dashboard'} element={<ProjectDashBoard/>}/>
            <Route path={'/aiReport'} element={<AiReport/>}/>
            <Route path={'/final-report/create'} element={<FinalReportCreatePage/>}/>
          </Route>
      </Route>
    </Routes>
  );
}
export default App;
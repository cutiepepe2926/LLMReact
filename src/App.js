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
import AuthHandler from "./auth/AuthHandler";

function App() {

  return(
    <Routes>
      {/* 1. 공개 라우트: 로그인 없이 접속 가능 */}
        <Route path={'/'} element={<LandingPage />} />
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/signup'} element={<Signup/>}/>

      {/* 2. 보호된 라우트: 로그인이 있어야만 접근 가능 */}
      <Route element={<AuthHandler />}>
          <Route element={<MainLayout />}>
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
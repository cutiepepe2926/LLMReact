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

function App() {

  return(
    <Routes>
        <Route path={'/'} element={<LandingPage />} />
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/signup'} element={<Signup/>}/>
      <Route element={<MainLayout />}>
        <Route path={'/myPage'} element={<MyPage/>}/>
        <Route path={'/modProfile'} element={<ModProfile/>}/>
        <Route path={'/projectList'} element={<ProjectList/>}/>
        <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
        <Route path={'/project/:projectId/dashboard'} element={<ProjectDashBoard/>}/>
        <Route path={'/projects/:projectId/daily-reports'} element={<AiReport/>}/>
        <Route path={'/final-report/create'} element={<FinalReportCreatePage/>}/>
      </Route>
    </Routes>
  );
}
export default App;

import { Route, Routes } from "react-router-dom";
import './App.css';
import Login from "./component/login/Login";
import MainLayout from "./layout/MainLayout";
import ProjectList from "./component/project/ProjectListPage";
import ProjectDashBoard from "./component/projectDashBoard/ProjectDashBoard";
import AiReport from "./component/report/AiReportPage";
import FinalReportCreatePage
    from "./component/projectDashBoard/Grids/FinalReportGrid/FinalReportCreatePage/FinalReportCreatePage";


function App() {

  return(
    <Routes>
      <Route path={'/login'} element={<Login/>}/>
      <Route element={<MainLayout />}>
         <Route path={'/projectList'} element={<ProjectList/>}/>
         <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
         <Route path={'/aiReport'} element={<AiReport/>}/>
          <Route path={'/final-report/create'} element={<FinalReportCreatePage/>}/>
      </Route>
    </Routes>
  );
}
export default App;

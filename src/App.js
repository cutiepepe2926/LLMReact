import { Route, Routes } from "react-router-dom";
import './App.css';
import Login from "./component/login/Login";
import ProjectList from "./component/project/ProjectListPage";
import ProjectDashBoard from "./component/projectDashBoard/ProjectDashBoard";
import AiReport from "./component/report/AiReportPage";
import MainLayout from "./layout/MainLayout";

function App() {
  return(
    <Routes>
      <Route path={'/login'} element={<Login/>}/>
      <Route element={<MainLayout />}>
         <Route path={'/projectList'} element={<ProjectList/>}/>
         <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
         <Route path={'/aiReport'} element={<AiReport/>}/>
      </Route>
    </Routes>
  );
}
export default App;
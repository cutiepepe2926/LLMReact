import {Route, Routes} from "react-router-dom";
import TopNav from "./layout/TopNav";
import './App.css';
import Login from "./component/login/Login";
import ProjectList from "./component/project/ProjectListPage";
import ProjectDashBoard from "./component/projectDashBoard/ProjectDashBoard";
import AiReport from "./component/report/AiReportPage";
import FinalReportCreatePage
    from "./component/projectDashBoard/Grids/FinalReportGrid/FinalReportCreatePage/FinalReportCreatePage";

function App() {

  return(
    <Routes>
      <Route element={<TopNav/>}>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/projectList'} element={<ProjectList/>}/>
        <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
        <Route path={'/aiReport'} element={<AiReport/>}/>
        <Route path={'/final-report/create'} element={<FinalReportCreatePage/>}/>
      </Route>
    </Routes>
  );
}
export default App;

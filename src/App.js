import {Route, Routes} from "react-router-dom";
import TopNav from "./layout/TopNav";
import './App.css';
import Login from "./component/Login/Login";
import ProjectList from "./component/project/ProjectListPage";
import ProjectDetail from "./component/ProjectDetail/ProjectDetail";
import AiReport from "./component/report/AiReportPage";

function App() {

  return(
    <Routes>
      <Route element={<TopNav/>}>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/projectList'} element={<ProjectList/>}/>
        <Route path={'/projectDetail'} element={<ProjectDetail/>}/>
        <Route path={'/aiReport'} element={<AiReport/>}/>
      </Route>
    </Routes>
  );
}
export default App;

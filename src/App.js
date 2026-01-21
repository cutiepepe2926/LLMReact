import {Route, Routes} from "react-router-dom";
import TopNav from "./layout/TopNav";
import './App.css';
import Login from "./component/Login/Login";
import Signup from "./component/SignUp/SignUp"
import ProjectList from "./component/project/ProjectListPage";
import ProjectDashBoard from "./component/projectDashBoard/ProjectDashBoard";
import AiReport from "./component/report/AiReportPage";
import MyPage from "./component/myPage/MyPage";
import ModProfile from "./component/modProfile/ModProfile";

function App() {

  return(
    <Routes>
      <Route element={<TopNav/>}>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/projectList'} element={<ProjectList/>}/>
        <Route path={'/projectDetail'} element={<ProjectDashBoard/>}/>
        <Route path={'/aiReport'} element={<AiReport/>}/>
        <Route path={'/myPage'} element={<MyPage/>}/>
        <Route path={'/modProfile'} element={<ModProfile/>}/>
          <Route path={'/signup'} element={<Signup/>}/>
      </Route>
    </Routes>
  );
}
export default App;

import {Route, Routes} from "react-router-dom";
import TopNav from "./layout/TopNav";
import './App.css';
import Login from "./component/Login/Login";
import ProjectDetail from "./component/ProjectDetail/ProjectDetail";


function App() {

  return(
    <Routes>
      <Route element={<TopNav/>}>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/projectDetail'} element={<ProjectDetail/>}/>
      </Route>
    </Routes>
  );
}
export default App;

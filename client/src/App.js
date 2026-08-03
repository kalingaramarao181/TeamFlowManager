import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
// import ProjectDetails from "./Components/ProjectDetails";
// import IssueDetails from "./component/IssueDetails";
import Dashboard from "./Pages/Dashboard";
import TeamFlowHome from "./Pages/Home";
import Secure from "./component/Secure";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
          {/* <Route path="/issues/:issueId" element={<IssueDetails />} /> */}
          {/* <Route path="/project/:projectId" element={<ProjectDetails />} /> */}
          <Route element={<Secure />} >
            <Route path="/dashboard/*" element={<Dashboard/>} />
          </Route>
          <Route path="/" element={<TeamFlowHome/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

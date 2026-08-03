import IssuesForm from "./IssuesForm";
import StatusForm from "./StatusForm";
import ProjectForm from "./projectsForm";
import TeamsForm from "./TeamsForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import PasswordUpdate from "./PasswordUpdateForm";
import ProjectDocument from "./ProjectDocument";
import UploadReport from "./UploadReport";

const FormView = ({ openForm, setOpenForm, currentUserId, projectId, issueId,  updateProjectData, updateIssueData}) => {
  // const [form, setForm] = useState({})
  // console.log();

  

  const renderForms = () => {
    if (openForm === "issues") {
      return <IssuesForm />;
    } else if (openForm === "status") {
      return <StatusForm />;
    } else if (openForm === "issue") {
      return <IssuesForm setOpenForm={setOpenForm} issueId={issueId} updateIssueData={updateIssueData} />;
    } else if (openForm === "projects") {
      return <ProjectForm setOpenForm={setOpenForm} projectId={projectId} updateProjectData={updateProjectData} />;
    } else if (openForm === "teams") {
      return <TeamsForm />;
    } else if (openForm === "signin") {
      return <LoginForm />;
    } else if (openForm === "register") {
      return <RegisterForm />;
    } else if (openForm === "password") {
      return <PasswordUpdate />;
    } else if (openForm === "projectDocument") {
      return <ProjectDocument setOpenForm={setOpenForm} projectId={projectId}  currentUserId={currentUserId}/>;
    } else if (openForm === "reports") {
      return <UploadReport setOpenForm={setOpenForm} projectId={projectId} currentUserId={currentUserId} />;
    }
  }

  return (
    <>
      {openForm && (
        <div className="tf-form-popup-overlay">
          <div className="tf-form-popup">
            <div className="tf-form-popup-header">
              <button className="tfm-close-button" onClick={() => setOpenForm(null)}>
                X
              </button>
            </div>
            {renderForms()}
          </div>
        </div>
      )}
    </>
  );
};

export default FormView;

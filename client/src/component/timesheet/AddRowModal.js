import { useEffect, useMemo, useState } from "react";
import { getProjects, getRecentProjectsWithTasks } from "../../api/projectsApi";
import { getUserDataFromCookies } from "../../utils/cookiesData";

const AddRowModal = ({ closeModal, addNewRow }) => {
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [projectId, setProjectId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workedOn, setWorkedOn] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await getRecentProjectsWithTasks(user.id);
        const recent = response.data.projects || [];
        setTasks(response.data.tasks || []);
        if (recent.length) setProjects(recent);
        else {
          const all = await getProjects();
          setProjects(all.map((project) => ({
            projectId: project.id,
            projectName: project.projectName,
            projectKey: project.projectKey,
          })));
        }
      } catch {
        setError("Project suggestions could not be loaded.");
      }
    };
    loadOptions();
  }, [user.id]);

  const filteredTasks = tasks.filter((task) => String(task.projectId) === String(projectId));
  const add = () => {
    if (!projectId || !taskName.trim() || !workedOn.trim()) {
      setError("Select a project and task, then describe your work.");
      return;
    }
    const project = projects.find((item) => String(item.projectId) === String(projectId));
    addNewRow({
      project_id: Number(projectId),
      project_name: project?.projectName,
      project_key: project?.projectKey,
      task_name: taskName.trim(),
      worked_on: workedOn.trim(),
      mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
    });
    closeModal();
  };

  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="timesheet-entry-title">
    <div className="modal-box"><h3 id="timesheet-entry-title">Add work entry</h3>
      {error && <div className="timesheet-notice error">{error}</div>}
      <label htmlFor="timesheet-project">Project</label>
      <select id="timesheet-project" value={projectId} onChange={(event) => { setProjectId(event.target.value); setTaskName(""); }}>
        <option value="">Select project</option>
        {projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.projectName} ({project.projectKey})</option>)}
      </select>
      <label htmlFor="timesheet-task">Task</label>
      <select id="timesheet-task" value={taskName} onChange={(event) => setTaskName(event.target.value)} disabled={!projectId}>
        <option value="">{projectId ? "Select task" : "Select project first"}</option>
        {filteredTasks.map((task, index) => <option key={`${task.taskName}-${index}`} value={task.taskName}>{task.taskName}</option>)}
        {projectId && !filteredTasks.length && <option value="General project work">General project work</option>}
      </select>
      <label htmlFor="timesheet-work">Work description</label>
      <textarea id="timesheet-work" placeholder="Briefly describe the completed work" value={workedOn} onChange={(event) => setWorkedOn(event.target.value)} />
      <div className="modal-actions"><button className="secondary" onClick={closeModal}>Cancel</button><button className="primary" onClick={add}>Add entry</button></div>
    </div>
  </div>;
};

export default AddRowModal;

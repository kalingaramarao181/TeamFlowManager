import { useEffect, useMemo, useState } from "react";
import { getProjects, getRecentProjectsWithTasks } from "../../api/projectsApi";
import { getUserDataFromCookies } from "../../utils/cookiesData";

const labels = {
  project: { name: "Project", task: "Task", placeholder: "Briefly describe the completed work" },
  leave: { name: "Leave", task: "Leave type", placeholder: "Add leave details or a note" },
  training: { name: "Training", task: "Training name", placeholder: "Briefly describe the training or learning outcome" },
};

const AddRowModal = ({ closeModal, addNewRow }) => {
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [entryType, setEntryType] = useState("project");
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
    if ((entryType === "project" && !projectId) || !taskName.trim() || !workedOn.trim()) {
      setError(entryType === "project"
        ? "Select a project and task, then describe your work."
        : "Enter the " + labels[entryType].task.toLowerCase() + " and a description.");
      return;
    }
    const project = projects.find((item) => String(item.projectId) === String(projectId));
    addNewRow({
      entry_type: entryType,
      project_id: entryType === "project" ? Number(projectId) : null,
      project_name: entryType === "project" ? project?.projectName : labels[entryType].name,
      project_key: entryType === "project" ? project?.projectKey : "",
      task_name: taskName.trim(),
      worked_on: workedOn.trim(),
      mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
    });
    closeModal();
  };

  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="timesheet-entry-title">
    <div className="modal-box"><h3 id="timesheet-entry-title">Add time entry</h3>
      {error && <div className="timesheet-notice error">{error}</div>}
      <label htmlFor="timesheet-entry-type">Entry type</label>
      <select id="timesheet-entry-type" value={entryType} onChange={(event) => {
        setEntryType(event.target.value); setProjectId(""); setTaskName(""); setError("");
      }}>
        <option value="project">Project</option>
        <option value="leave">Leave</option>
        <option value="training">Training</option>
      </select>
      {entryType === "project" ? <>
        <label htmlFor="timesheet-project">Project</label>
        <select id="timesheet-project" value={projectId} onChange={(event) => { setProjectId(event.target.value); setTaskName(""); }}>
          <option value="">Select project</option>
          {projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.projectName} ({project.projectKey})</option>)}
        </select>
        <label htmlFor="timesheet-task">Task</label>
        <select id="timesheet-task" value={taskName} onChange={(event) => setTaskName(event.target.value)} disabled={!projectId}>
          <option value="">{projectId ? "Select task" : "Select project first"}</option>
          {filteredTasks.map((task, index) => <option key={task.taskName + "-" + index} value={task.taskName}>{task.taskName}</option>)}
          {projectId && !filteredTasks.length && <option value="General project work">General project work</option>}
        </select>
      </> : <>
        <label htmlFor="timesheet-task">{labels[entryType].task}</label>
        <input id="timesheet-task" value={taskName} onChange={(event) => setTaskName(event.target.value)}
          placeholder={entryType === "leave" ? "e.g. Annual leave, Sick leave" : "e.g. Security awareness training"} />
      </>}
      <label htmlFor="timesheet-work">Description</label>
      <textarea id="timesheet-work" placeholder={labels[entryType].placeholder} value={workedOn} onChange={(event) => setWorkedOn(event.target.value)} />
      <div className="modal-actions"><button className="secondary" onClick={closeModal}>Cancel</button><button className="primary" onClick={add}>Add entry</button></div>
    </div>
  </div>;
};

export default AddRowModal;

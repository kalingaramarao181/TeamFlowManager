import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getProjectOverview, createProjectTask, createProjectSubtask, sendProjectChat, saveGithubConfig, getGithubConfig } from "../api/teamApi";
import { getUsers } from "../api/usersApi";
import { getUserDataFromCookies } from "../utils/cookiesData";

const ProjectWorkspacePanel = ({ projectId }) => {
  const user = useMemo(() => getUserDataFromCookies(), []);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({ summary: "", status: "To Do", priority: "Medium", assignee: "" });
  const [chatMessage, setChatMessage] = useState("");
  const [githubForm, setGithubForm] = useState({ repo_url: "", repo_name: "" });

  const loadOverview = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectOverview, userList, repoData] = await Promise.all([
        getProjectOverview(projectId),
        getUsers(),
        getGithubConfig(projectId),
      ]);
      setOverview(projectOverview);
      setUsers(userList || []);
      setGithubForm(repoData || { repo_url: "", repo_name: "" });
    } catch (error) {
      console.error("Project overview failed:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadOverview();
    }
  }, [projectId, loadOverview]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!taskForm.summary.trim()) return;

    await createProjectTask(projectId, {
      summary: taskForm.summary,
      status: taskForm.status,
      priority: taskForm.priority,
      assignee: taskForm.assignee || null,
      description: "Task created from project workspace",
      issueType: "task",
    });

    setTaskForm({ summary: "", status: "To Do", priority: "Medium", assignee: "" });
    loadOverview();
  };

  const handleCreateSubtask = async (taskId, name) => {
    if (!name || !name.trim()) return;
    await createProjectSubtask(projectId, taskId, {
      subtask_name: name,
      assignee_id: user?.id || null,
      status: "pending",
      percentage: 0,
    });
    loadOverview();
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    await sendProjectChat(projectId, user?.id, chatMessage);
    setChatMessage("");
    loadOverview();
  };

  const handleGithubSubmit = async (event) => {
    event.preventDefault();
    if (!githubForm.repo_url) return;
    await saveGithubConfig(projectId, githubForm);
    loadOverview();
  };

  if (loading) return <div className="project-panel"><p>Loading project workspace...</p></div>;
  if (!overview) return <div className="project-panel"><p>No workspace data available.</p></div>;

  const { project, tasks = [], teams = [], status = [], chat = [], progress = {} } = overview;

  return (
    <div className="project-workspace-grid">
      <div className="project-panel">
        <h2>Project workspace</h2>
        <div className="project-overview-grid">
          <div className="project-stat-card"><strong>{progress.totalTasks || 0}</strong><span>Total tasks</span></div>
          <div className="project-stat-card"><strong>{progress.completed || 0}</strong><span>Completed</span></div>
          <div className="project-stat-card"><strong>{progress.percentage || 0}%</strong><span>Completion</span></div>
          <div className="project-stat-card"><strong>{teams.length}</strong><span>Teams</span></div>
        </div>
      </div>

      <div className="project-panel">
        <h3>Quick task</h3>
        <form onSubmit={handleCreateTask} className="project-task-form">
          <input value={taskForm.summary} onChange={(event) => setTaskForm({ ...taskForm, summary: event.target.value })} placeholder="Task summary" />
          <div className="project-task-form-row">
            <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <select value={taskForm.assignee} onChange={(event) => setTaskForm({ ...taskForm, assignee: event.target.value })}>
            <option value="">Unassigned</option>
            {users.map((member) => (<option key={member.userId} value={member.userId}>{member.userName}</option>))}
          </select>
          <button type="submit">Create task</button>
        </form>
      </div>

      <div className="project-panel">
        <h3>Teams</h3>
        <div className="project-team-list">
          {teams.length ? teams.map((team) => (
            <div key={team.id} className="project-team-item">
              <strong>{team.team_name}</strong>
              <small>{(team.team_members || []).join(", ") || "No members"}</small>
              {team.team_lead ? <span>Lead: {team.team_lead}</span> : <span>Lead: not assigned</span>}
            </div>
          )) : <p>No teams for this project yet.</p>}
        </div>
      </div>

      <div className="project-panel">
        <h3>Daily work status</h3>
        <div className="project-status-list">
          {status.length ? status.map((entry) => (
            <div key={entry.id} className="project-status-item">
              <strong>{entry.user_name || "User"}</strong>
              <span>{entry.module_name || "Work"}</span>
              <small>{entry.working_on || entry.worked_on || "No details"}</small>
              <em>{entry.status || "In progress"}</em>
            </div>
          )) : <p>No work status recorded.</p>}
        </div>
      </div>

      <div className="project-panel">
        <h3>GitHub integration</h3>
        <form onSubmit={handleGithubSubmit} className="project-github-form">
          <input value={githubForm.repo_url || ""} onChange={(event) => setGithubForm({ ...githubForm, repo_url: event.target.value })} placeholder="https://github.com/org/repo" />
          <input value={githubForm.repo_name || ""} onChange={(event) => setGithubForm({ ...githubForm, repo_name: event.target.value })} placeholder="Repository name" />
          <button type="submit">Link repository</button>
        </form>
        {project?.github_url ? <a href={project.github_url} target="_blank" rel="noreferrer">Open GitHub repo</a> : null}
      </div>

      <div className="project-panel">
        <h3>Project chat</h3>
        <div className="project-chat-box">
          {chat.length ? chat.map((message) => (
            <div key={message.id} className="project-chat-message">
              <strong>{message.sender_name || "User"}</strong>
              <span>{message.message}</span>
            </div>
          )) : <p>No messages yet.</p>}
        </div>
        <div className="project-chat-input">
          <input value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Send project update..." />
          <button onClick={handleSendChat}>Send</button>
        </div>
      </div>

      <div className="project-panel" style={{ gridColumn: "1 / -1" }}>
        <h3>Task breakdown</h3>
        {tasks.length ? tasks.map((task) => (
          <div key={task.id} className="project-task-breakdown">
            <div className="project-task-header">
              <strong>{task.summary}</strong>
              <span>{task.status}</span>
            </div>
            <div className="project-task-meta">
              <small>{task.priority}</small>
              <small>{task.assignee_name || "Unassigned"}</small>
            </div>
            <div className="project-subtask-builder">
              <input id={`subtask-${task.id}`} placeholder="Add subtask" />
              <button onClick={() => handleCreateSubtask(task.id, document.getElementById(`subtask-${task.id}`).value)}>Add subtask</button>
            </div>
          </div>
        )) : <p>No tasks for this project yet.</p>}
      </div>
    </div>
  );
};

export default ProjectWorkspacePanel;

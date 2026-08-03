import React, { useEffect, useState } from "react";
import "./ModuleOverview.css";
import { getTodayModules } from "../api/workStatusApi"; // Update with your actual API path
import { baseUrlImg } from "../Config/env";


const colors = [
  "#FF5722", // Deep Orange
  "#03A9F4", // Light Blue
  "#8BC34A", // Light Green
  "#FFC107", // Amber
  "#9C27B0", // Purple
  "#009688", // Teal
  "#E91E63", // Pink
  "#4CAF50", // Green
  "#3F51B5", // Indigo
  "#795548", // Brown
];

const ModuleOverview = () => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getTodayModules();
        console.log(data);
        const coloredModules = data.modules.map((mod, index) => ({
          ...mod,
          color: colors[index % colors.length], 
        }));
        setModules(coloredModules);
      } catch (error) {
        console.error("Failed to load modules:", error);
      }
    };

    fetchModules();
  }, []);

  return (
    <div className="module-overview">
      {modules.map((mod, index) => (
        <div
          className="module-card"
          key={index}
          style={{ borderTopColor: mod.color }}
        >
          <h3>{mod.module_name}</h3>
          <p>
            <strong>{mod.user_name}</strong> is currently working on{" "}
            <strong>{mod.module_name}</strong>
            as part of the project <strong>{mod.project_name}</strong>. They are
            focusing on
            <em>{mod.working_on}</em> and the current status is{" "}
            <strong>{mod.status}</strong>.
          </p>
          {mod.documents && mod.documents.length > 0 && (
            <div className="tfm-documents">
              {mod.documents.map((doc, docIndex) => (
                <div className="tfm-document" key={docIndex}>
                  <img className="tfm-doc" src={`${baseUrlImg}uploads/DailyStatusReports/${doc.file_name}`} alt={`Document ${docIndex + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModuleOverview;

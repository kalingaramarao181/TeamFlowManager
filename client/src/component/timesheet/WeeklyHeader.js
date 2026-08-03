import { useEffect, useState } from "react";
import AddRowModal from "./AddRowModal";
import { getWeekRange, getWeekNumber } from "../../utils/weekUtils";

const WeeklyHeader = ({ addNewRow, onWeekChange, disabled }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const range = getWeekRange(currentDate);
  const weekNo = getWeekNumber(currentDate);

  useEffect(() => { onWeekChange(weekNo); }, [onWeekChange, weekNo]);
  const moveWeek = (offset) => setCurrentDate((value) => {
    const next = new Date(value); next.setDate(next.getDate() + offset); return next;
  });

  return <section className="weekly-header">
    <div className="week-nav"><button className="nav-btn" onClick={() => moveWeek(-7)} aria-label="Previous week">‹</button>
      <div className="week-info"><h4>{range.label}</h4><span>Week {weekNo}</span></div>
      <button className="nav-btn" onClick={() => moveWeek(7)} aria-label="Next week">›</button></div>
    <div className="week-actions"><button className="btn add-project" disabled={disabled} onClick={() => setShowModal(true)}>+ Add work entry</button></div>
    {showModal && <AddRowModal closeModal={() => setShowModal(false)} addNewRow={addNewRow} />}
  </section>;
};

export default WeeklyHeader;

// Get Monday–Sunday Range
export const getWeekRange = (date) => {
  const current = new Date(date);

  const monday = new Date(current);
  monday.setDate(current.getDate() - ((current.getDay() + 6) % 7));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const options = { month: "short", day: "numeric" };

  return {
    week_start: monday.toISOString().split("T")[0],
    week_end: sunday.toISOString().split("T")[0],

    label: `${monday.toLocaleDateString("en-US", options)} - 
            ${sunday.toLocaleDateString("en-US", options)}, 
            ${sunday.getFullYear()}`,
  };
};

// Week Number Calculation
export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);

  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

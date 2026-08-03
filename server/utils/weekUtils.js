exports.getWeekDatesFromWeekNumber = (week, year) => {
  // Week starts from Monday
  const firstDayOfYear = new Date(year, 0, 1);

  // Get Monday of week 1
  const dayOffset = (firstDayOfYear.getDay() + 6) % 7;
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() - dayOffset);

  // Monday of requested week
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);

  // Sunday of requested week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Format YYYY-MM-DD safely
  const formatDate = (date) => date.toLocaleDateString("en-CA");

  return {
    week_start: formatDate(monday),
    week_end: formatDate(sunday),
  };
};

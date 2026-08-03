exports.formatDate = (dateStr) => {
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    month: "short", // Feb
    day: "numeric", // 9
    year: "numeric", // 2026
  });
};

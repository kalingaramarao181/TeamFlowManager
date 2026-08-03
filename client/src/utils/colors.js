export const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "#FF7F7F";
      case "In Progress":
        return "#FFC107";
      case "Done":
        return "#28A745";
      default:
        return "#6C757D";
    }
  };
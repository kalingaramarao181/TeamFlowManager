export const convertDateAndTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  }; 

export const convertDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }

  export const convertTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", options);
  }
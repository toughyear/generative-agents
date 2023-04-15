export const formatDate = (date: Date) => {
  // format 2023-04-15 5:44:20 PM
  const formattedDate = date.toISOString().split("T")[0];
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  return `${formattedDate} ${formattedTime}`;
};

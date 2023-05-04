import { World } from "./types";

export const dateToString = (date: Date) => {
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

export const stringToDate = (dateString: string) => {
  const [date, time] = dateString.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute, second] = time.split(":");
  const [hour24, ampm] = hour.split(" ");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour24) + (ampm === "PM" ? 12 : 0),
    Number(minute),
    Number(second)
  );
};

export function getAllKeys(world: World): string[] {
  const keys: string[] = [];

  function traverse(obj: World) {
    for (const key in obj) {
      if (typeof obj[key] === "number") {
        keys.push(key);
      } else {
        traverse(obj[key] as World);
      }
    }
  }

  traverse(world);

  return keys;
}

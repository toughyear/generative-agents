import { Memory } from "../interface";

export interface UpdateLocalStorage {
  id: string;
  memory: Memory;
}

export const updateLocalStorageWithMemory = ({
  id,
  memory,
}: UpdateLocalStorage): Memory[] => {
  // If id of the agent is present in local storage update the memory object with the current memory
  if (localStorage.getItem(id)) {
    const memoryStream = JSON.parse(localStorage.getItem(id) as string);
    // Push the current memory in the already exisitng memory stream.
    memoryStream.push(memory);

    // Update the local storage with the new memory stream.
    localStorage.setItem(id, JSON.stringify(memoryStream));
    return memoryStream;
  } else {
    // The current id of the agent is not present in local storage we need to create a new entry
    localStorage.setItem(id, JSON.stringify([memory]));
    return [memory];
  }
};

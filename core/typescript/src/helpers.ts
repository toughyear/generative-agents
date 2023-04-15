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

/**
 * Calculates the cosine similarity between two vectors.
 * @param vectorA - The first vector (array of numbers).
 * @param vectorB - The second vector (array of numbers).
 * @returns The cosine similarity between the input vectors.
 * @throws Error if the input vectors have different lengths or zero magnitudes.
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  function dotProduct(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same length");
    }

    let sum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      sum += vectorA[i] * vectorB[i];
    }
    return sum;
  }

  function magnitude(vector: number[]): number {
    let sum = 0;
    for (const value of vector) {
      sum += Math.pow(value, 2);
    }
    return Math.sqrt(sum);
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length");
  }

  const dotProductResult = dotProduct(vectorA, vectorB);
  const magnitudeA = magnitude(vectorA);
  const magnitudeB = magnitude(vectorB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not have zero magnitude");
  }

  return dotProductResult / (magnitudeA * magnitudeB);
}

import AppError from "./ErrorHandler";

export const capitalizeFirstLetter = (str: string) => {
  if (typeof str !== "string" || str === "") {
    throw new AppError(400, "Invalid name passed");
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

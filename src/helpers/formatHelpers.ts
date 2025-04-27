export const formatDate = (data: string): Date => {
  const [day, month, year] = data.split("/").map(Number);

  const dataObeject = new Date(year, month - 1, day);

  return dataObeject;
};

export const formatValue = (value: number | string | undefined): number => {
  if (value === "-" || value === "" || value === undefined) {
    return 0;
  }

  if (typeof value === "string") {
    return parseFloat(value.replace(",", "."));
  }

  return value;
};

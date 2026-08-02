const pad = (value: number) => String(value).padStart(2, "0");

/** Returns tomorrow's date at 00:00 as a `datetime-local` compatible string. */
export const getMinStartDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate()
  )}T00:00`;
};

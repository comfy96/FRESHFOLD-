export function formatRecordDate(isoString: string): string {
  // SQLite datetime strings are stored as UTC; append Z if missing so WAT (UTC+1) converts accurately.
  const normalized = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  // Convert UTC -> West Africa Time (Africa/Lagos, UTC+1)
  const watDate = new Date(date.getTime() + 60 * 60 * 1000);
  const day = String(watDate.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[watDate.getUTCMonth()];
  const year = watDate.getUTCFullYear();
  const hours = String(watDate.getUTCHours()).padStart(2, '0');
  const minutes = String(watDate.getUTCMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} WAT`;
}

export const formatTime = (): string => {
  return new Date().toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }) + ' IST';
};

/**
 * Formats a timestamp to "dd-month-yyyy hh:mm (PM/AM)" format
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted date string (e.g., "05-Aug-2025 02:00 PM")
 */
export const formatStatusTimestamp = (timestamp: string | Date | null | undefined): string => {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  // Get day with zero padding
  const dd = date.getDate().toString().padStart(2, '0');
  
  // Get month name (short format: Jan, Feb, Mar, etc.)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  
  // Get year
  const yyyy = date.getFullYear();
  
  // Get hours and minutes in 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours || 12; // the hour '0' should be '12'
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  
  return `${dd}-${month}-${yyyy} ${hh}:${mm} ${ampm}`;
};
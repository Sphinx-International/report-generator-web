export const formatDate = (
  dateString: string | Date, 
  hideIfToday: boolean = false // Optional parameter, defaults to false
) => {
  const date = new Date(dateString);
  const today = new Date();

  // Check if the date is the current day
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

  // If hideIfToday is true and the date is today, return only the time
  if (hideIfToday && isToday) {
    return formattedTime;
  }

  const formattedDate = date.toLocaleDateString('en-GB', options);

  return `${formattedDate}, ${formattedTime}`;
};




export function calculateDaysSinceCreation(creationDate: string | Date): number {
  const currentDate: Date = new Date();
  const createdDate: Date = new Date(creationDate);

  // Calculate the time difference in milliseconds
  const timeDifference: number = currentDate.getTime() - createdDate.getTime();

  // Convert the time difference from milliseconds to days
  const daysSinceCreation: number = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysSinceCreation;
}




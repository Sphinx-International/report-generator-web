export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const formattedDate = date.toLocaleDateString('en-GB', options);
  const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

  return `${formattedDate} , ${formattedTime}`;
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




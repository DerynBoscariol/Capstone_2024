
// Format Date function
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

// Format Time function
export const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours, 10);
    const isPM = hour >= 12;
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
};
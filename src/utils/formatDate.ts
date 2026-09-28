export function formatDate(dateString: string) {
const [year, month, day] = dateString.split("-");

return `${month}/${day}/${year}`;
}
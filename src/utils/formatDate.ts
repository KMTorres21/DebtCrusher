export function formatDate(dateString: string) {
4
const [year, month, day] = dateString.split("-");
5
 
6
return `${month}/${day}/${year}`;
7
}
function parseDateString(dateString) {
    const date = dateString.split('/');
    return new Date(date[2], date[1], date[0]);
}

export function compareDates(dateString1, dateString2) {
    const date1 = parseDateString(dateString1);
    const date2 = parseDateString(dateString2);

    let res = date1 < date2 ? -1 : (date1 > date2 ? 1 : 0);
    return res;
}
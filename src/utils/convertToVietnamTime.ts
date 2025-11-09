import { toZonedTime, format } from "date-fns-tz";

export const convertToVietnamTime = (date: Date) => {
    if (isNaN(date.getTime())) {
        throw new Error("Invalid Date");
    }
    const timeZone = "Asia/Ho_Chi_Minh";
    const vietnamTime = toZonedTime(date, timeZone);
    const formattedDate = format(vietnamTime, "yyyy-MM-dd'T'HH:mm:ss");

    return formattedDate;
};
/**
 * Date helper
 */

import * as moment from 'moment-timezone';

export function dateFormat(
  date?: Date,
  format = 'YYYY-MM-DD',
  tz = 'Asia/Shanghai',
): string {
  return moment(date)
    .tz(tz)
    .format(format);
}

export function timeFormat(
  date?: Date,
  format = 'YYYY-MM-DD HH:mm:ss',
  tz = 'Asia/Shanghai',
): string {
  return moment(date)
    .tz(tz)
    .format(format);
}

export function dateParse(
  dateString?: string,
  format = 'YYYY-MM-DD',
  tz = 'Asia/Shanghai',
): Date {
  return moment.tz(dateString, format, tz).toDate();
}

export function momentParse(
  dateString?: string,
  format = 'YYYY-MM-DD',
  tz = 'Asia/Shanghai',
) {
  return moment.tz(dateString, format, tz);
}

export function momentTz(tz = 'Asia/Shanghai') {
  return moment().tz(tz);
}

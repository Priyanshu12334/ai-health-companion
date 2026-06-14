export const getTimezoneOffset = (req) => {
  if (req.headers['x-timezone-offset'] !== undefined) {
    return parseInt(req.headers['x-timezone-offset']);
  }
  if (req.query.timezoneOffset !== undefined) {
    return parseInt(req.query.timezoneOffset);
  }
  return 0;
};

export const getStartOfToday = (req) => {
  const timezoneOffset = getTimezoneOffset(req);
  const now = new Date();
  const localTime = new Date(now.getTime() - (timezoneOffset * 60000));
  localTime.setUTCHours(0, 0, 0, 0);
  return new Date(localTime.getTime() + (timezoneOffset * 60000));
};

export const toLocalDateString = (dateObj, timezoneOffset = 0) => {
  if (!dateObj) return null;
  const localTime = new Date(dateObj.getTime() - (timezoneOffset * 60000));
  return localTime.toISOString().split('T')[0];
};

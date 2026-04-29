export const MAX_SCHEDULE_YEARS_AHEAD = 50;

const INVALID_SCHEDULE_MESSAGE = "Please enter a valid scheduled date and time.";
const PAST_SCHEDULE_MESSAGE = "Scheduled date and time cannot be in the past.";
const FUTURE_SCHEDULE_MESSAGE = `Scheduled date and time must be within ${MAX_SCHEDULE_YEARS_AHEAD} years from now.`;

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function formatDatetimeLocal(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getScheduleWindow(now = new Date()) {
  return {
    min: now,
    max: addYears(now, MAX_SCHEDULE_YEARS_AHEAD),
  };
}

export function validateScheduledAtValue(
  value: string,
  options?: {
    required?: boolean;
    now?: Date;
  }
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return {
      error: options?.required ? "A scheduled campaign needs a scheduled date and time." : null,
      parsedDate: null,
    };
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      error: INVALID_SCHEDULE_MESSAGE,
      parsedDate: null,
    };
  }

  const { min, max } = getScheduleWindow(options?.now);
  if (parsedDate < min) {
    return {
      error: PAST_SCHEDULE_MESSAGE,
      parsedDate,
    };
  }

  if (parsedDate > max) {
    return {
      error: FUTURE_SCHEDULE_MESSAGE,
      parsedDate,
    };
  }

  return {
    error: null,
    parsedDate,
  };
}

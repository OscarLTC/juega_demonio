export const getMonthName = (monthIndex: number): string => {
  const months = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  return months[monthIndex];
};

export const getLastFriday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToSubtract = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - daysToSubtract);
  lastFriday.setHours(0, 0, 0, 0);
  return lastFriday;
};

export const getFridaysInMonth = (
  year: number,
  month: number,
  maxDate?: Date,
): Date[] => {
  const fridays: Date[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    if (date.getDay() === 5) {
      if (!maxDate || date <= maxDate) {
        fridays.push(new Date(date));
      }
    }
    date.setDate(date.getDate() + 1);
  }
  return fridays;
};

export const canNavigateToPreviousMonth = (
  year: number,
  month: number,
  minDate: Date,
): boolean => {
  const prevMonth = new Date(year, month - 1, 1);
  return prevMonth >= minDate;
};

export const canNavigateToNextMonth = (
  year: number,
  month: number,
  maxDate: Date,
): boolean => {
  const nextMonth = new Date(year, month + 1, 1);
  return nextMonth <= maxDate;
};

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

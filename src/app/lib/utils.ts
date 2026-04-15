const DAY_LABELS: Record<number, string> = {
  0: 'Пн', 1: 'Вт', 2: 'Ср', 3: 'Чт', 4: 'Пт', 5: 'Сб', 6: 'Вс',
};

const DAY_FULL: Record<number, string> = {
  0: 'Понедельник', 1: 'Вторник', 2: 'Среда', 3: 'Четверг',
  4: 'Пятница', 5: 'Суббота', 6: 'Воскресенье',
};

export function getDayLabel(dayId: number): string {
  return DAY_LABELS[dayId] ?? `Д${dayId}`;
}

export function getDayFull(dayId: number): string {
  return DAY_FULL[dayId] ?? `День ${dayId}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

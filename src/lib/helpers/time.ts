export function convertDateTimeToPersian(dateTime: Date): string {
  return `${new Date(dateTime).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} ساعت ${new Date(dateTime).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
export function convertDateTimeToPersianAgo(dateTime: Date): string {
  const seconds = Math.floor((new Date().getTime() - dateTime.getTime()) / 1000);
  let interval = Math.floor(seconds / (60 * 60 * 24 * 365));
  if (interval > 1) {
    return `${interval} سال پیش`;
  }
  interval = Math.floor(seconds / (60 * 60 * 24 * 30));
  if (interval > 1) {
    return `${interval} ماه پیش`;
  }
  interval = Math.floor(seconds / (60 * 60 * 24));
  if (interval > 1) {
    return `${interval} روز پیش`;
  }
  interval = Math.floor(seconds / (60 * 60));
  if (interval > 1) {
    return `${interval} ساعت پیش`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} دقیقه پیش`;
  }
  return `${Math.floor(seconds)} ثانیه پیش`;
}

export function convertSecondsToPersianDuration(seconds: number): string {
  const durations = [
    { label: 'ساعت', value: 60 * 60 },
    { label: 'دقیقه', value: 60 },
    { label: 'ثانیه', value: 1 },
  ];

  let remainingSeconds = seconds;
  const result = durations
    .map((duration) => {
      const amount = Math.floor(remainingSeconds / duration.value);
      remainingSeconds %= duration.value;
      return amount > 0 ? `${amount} ${duration.label}` : '';
    })
    .filter(Boolean)
    .join(' ');

  return result || '0 ثانیه';
}

export function convertSecondsToHHMMSS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs.toFixed(0)).padStart(2, '0')}`;
}

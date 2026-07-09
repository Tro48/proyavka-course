declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string) => void;
  }
}

const COUNTER_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

/** Цель отправляем после успешного ответа сервера, а не по клику на кнопку. */
export function reachGoal(goal: string): void {
  if (typeof window === "undefined" || !window.ym || !COUNTER_ID) return;
  window.ym(COUNTER_ID, "reachGoal", goal);
}

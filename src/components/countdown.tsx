"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { formatDayTimeMsk } from "@/lib/date";
import type { Duration } from "@/lib/duration";
import { toDuration } from "@/lib/duration";
import { useServerOffset } from "@/lib/use-server-offset";

type CountdownProps = {
  deadline: string;
  caption: string;
  /** Времени или мест почти не осталось: подсвечиваем рамкой красного фонаря. */
  urgent?: boolean;
};

export function Countdown({ deadline, caption, urgent = false }: CountdownProps) {
  const { offset, ready } = useServerOffset();

  // `null` на сервере и на первом клиентском рендере: разное содержимое здесь
  // означало бы hydration mismatch. Живое значение появляется после монтирования.
  const [left, setLeft] = useState<Duration | null>(null);

  useEffect(() => {
    // Пока смещение неизвестно, цифры не показываем: иначе человек с
    // переведёнными часами увидит чужой таймер, а потом тот дёрнется.
    if (!ready) return;

    const target = new Date(deadline).getTime();

    // Каждый тик — разница с дедлайном, а не декремент. Браузер троттлит
    // фоновую вкладку до раза в минуту, и `setLeft(l => l - 1)` отстал бы.
    const tick = () => setLeft(toDuration(target - (Date.now() + offset)));

    tick();
    const interval = setInterval(tick, 1000);

    // Возврат на вкладку пересчитывает время сразу, не дожидаясь тика.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [deadline, offset, ready]);

  return (
    <TimerLayout value={left} caption={caption} deadline={deadline} urgent={urgent} />
  );
}

const CELLS = [
  { key: "days", label: "дней" },
  { key: "hours", label: "часов" },
  { key: "minutes", label: "минут" },
  { key: "seconds", label: "секунд" },
] as const;

/** Прочерки той же ширины, что цифры. Моноширинный шрифт — не украшение. */
const PLACEHOLDER = "--";

function TimerLayout({
  value,
  caption,
  deadline,
  urgent,
}: {
  value: Duration | null;
  caption: string;
  deadline: string;
  urgent: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-mono text-paper/60 font-mono tracking-widest uppercase">
        {caption}
      </p>

      {/* Цифры скрыты от скринридера: тикающий раз в секунду счётчик он читать
          не должен. Ниже — та же информация одной понятной строкой. */}
      <div className="flex gap-2 sm:gap-3" aria-hidden="true">
        {CELLS.map((cell) => (
          <div
            key={cell.key}
            className={cn(
              "rounded-sheet flex min-w-[4.25rem] flex-col items-center gap-1 px-3 py-3 sm:min-w-[5rem]",
              urgent
                ? "bg-safelight/15 ring-safelight/50 ring-1"
                : "bg-paper/5 ring-paper/10 ring-1",
            )}
          >
            <span className="text-glow font-mono text-3xl leading-none sm:text-4xl">
              {value ? String(value[cell.key]).padStart(2, "0") : PLACEHOLDER}
            </span>
            <span className="text-paper/60 font-mono text-[0.6875rem] tracking-wide">
              {cell.label}
            </span>
          </div>
        ))}
      </div>

      <p className="sr-only">
        {caption}: {formatDayTimeMsk(deadline)}.
      </p>
    </div>
  );
}

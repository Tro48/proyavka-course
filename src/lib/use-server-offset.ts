"use client";

import { useEffect, useState } from "react";

/**
 * Смещение между часами сервера и часами браузера.
 *
 * Запрашивается один раз на всю страницу: таймер может стоять и в герое, и в
 * липкой панели, а лишний сетевой запрос ради этого не нужен.
 */
let pending: Promise<number> | null = null;

/** Сбрасывает общий кэш между тестами. В приложении не вызывается. */
export function resetServerOffsetCache(): void {
  pending = null;
}

async function fetchOffset(): Promise<number> {
  const sentAt = Date.now();
  const response = await fetch("/api/time", { cache: "no-store" });
  const receivedAt = Date.now();

  if (!response.ok) throw new Error(`/api/time ответил ${response.status}`);

  const payload: unknown = await response.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("now" in payload) ||
    typeof payload.now !== "number"
  ) {
    throw new Error("/api/time вернул неожиданный ответ");
  }

  // Ответ шёл к нам половину круга: сравнивать серверное время нужно с
  // серединой запроса, иначе смещение всегда завышено на этот пинг.
  const clientAtResponse = sentAt + (receivedAt - sentAt) / 2;
  return payload.now - clientAtResponse;
}

export type ServerOffset = {
  offset: number;
  /** Пока `false`, живое время показывать нельзя: часы клиента могут врать. */
  ready: boolean;
};

export function useServerOffset(): ServerOffset {
  const [state, setState] = useState<ServerOffset>({ offset: 0, ready: false });

  useEffect(() => {
    let alive = true;

    // Сеть упала — работаем по часам клиента. Таймер важнее точности.
    pending ??= fetchOffset().catch(() => 0);

    void pending.then((offset) => {
      if (alive) setState({ offset, ready: true });
    });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}

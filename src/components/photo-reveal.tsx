"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Проявление фотографии при появлении в вьюпорте: blur(12px) → blur(0).
 * Ровно та анимация, которая описывает предмет курса.
 *
 * Только к фотографиям. Размывать текст — значит на секунду сделать его
 * нечитаемым ради эффекта; это не то же самое, что проявка.
 */
export function PhotoReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  // При `reduce` фото просто на месте: анимация не заменяется мгновенной
  // сменой состояния, потому что заменять нечего — конечное состояние и есть
  // нормальное фото.
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ filter: "blur(12px)", opacity: 0 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

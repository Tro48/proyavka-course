/**
 * Работы выпускников. Секция свёрстана как контрольный лист: плотная сетка
 * кадров одного формата 3:2 с тонкими белыми полями и подписями моноширинным.
 *
 * Для курса по визуальному навыку работы учеников убедительнее текста отзыва.
 *
 * Плёнки только чёрно-белые: курс печатает руками на баритовой бумаге, цветную
 * C-41 в этой лаборатории не проявляют. `alt` описывает то, что на кадре
 * действительно есть, — по нему же написаны промпты в scripts/generate-photos.mjs.
 *
 * Снимки импортируются, а не задаются строкой `/images/…`. Статический импорт
 * даёт URL с хешем содержимого (`04.<hash>.webp`) и размеры кадра из самого
 * файла. Со строкой URL не менялся при перегенерации, и браузер четыре часа
 * показывал старый кадр из кеша `next/image`. При переезде на CMS сюда лягут
 * обычные строки: `next/image` принимает и то и другое.
 */
import type { StaticImageData } from "next/image";

import w01 from "@/images/works/01.webp";
import w02 from "@/images/works/02.webp";
import w03 from "@/images/works/03.webp";
import w04 from "@/images/works/04.webp";
import w05 from "@/images/works/05.webp";
import w06 from "@/images/works/06.webp";
import w07 from "@/images/works/07.webp";
import w08 from "@/images/works/08.webp";
import w09 from "@/images/works/09.webp";
import w10 from "@/images/works/10.webp";
import w11 from "@/images/works/11.webp";
import w12 from "@/images/works/12.webp";

export type Work = {
  id: string;
  src: StaticImageData;
  alt: string;
  /** Кадр в контрольном листе: «07». */
  frame: string;
  /** Подпись моноширинным: плёнка и экспопара. */
  meta: string;
  author: string;
};

export const works: readonly Work[] = [
  {
    id: "w01",
    src: w01,
    alt: "Пустой двор-колодец в утреннем тумане",
    frame: "01",
    meta: "Tri-X 400 · f/8 · 1/250",
    author: "Марина Соколова",
  },
  {
    id: "w02",
    src: w02,
    alt: "Силуэт человека в дверном проёме против света",
    frame: "04",
    meta: "HP5 Plus · f/2 · 1/60",
    author: "Дмитрий Лавров",
  },
  {
    id: "w03",
    src: w03,
    alt: "Мокрая мостовая с отражением фонаря",
    frame: "09",
    meta: "Delta 3200 · f/1.8 · 1/30",
    author: "Аня Верещагина",
  },
  {
    id: "w04",
    src: w04,
    alt: "Капли дождя на оконном стекле, за ним размытый город",
    frame: "12",
    meta: "Tri-X 400 · f/4 · 1/125",
    author: "Пётр Кузьмин",
  },
  {
    id: "w05",
    src: w05,
    alt: "Занавеска, надутая ветром в открытом окне",
    frame: "15",
    meta: "Delta 100 · f/5.6 · 1/500",
    author: "Марина Соколова",
  },
  {
    id: "w06",
    src: w06,
    alt: "Лестничный пролёт, снятый снизу вверх",
    frame: "18",
    meta: "HP5 Plus · f/11 · 1/60",
    author: "Илья Гордеев",
  },
  {
    id: "w07",
    src: w07,
    alt: "Портрет пожилого мужчины у окна",
    frame: "21",
    meta: "Tri-X 400 · f/2.8 · 1/125",
    author: "Аня Верещагина",
  },
  {
    id: "w08",
    src: w08,
    alt: "Трамвайные пути, уходящие в снегопад",
    frame: "24",
    meta: "Delta 100 · f/8 · 1/250",
    author: "Дмитрий Лавров",
  },
  {
    id: "w09",
    src: w09,
    alt: "Проявочные бачки на рабочем столе",
    frame: "27",
    meta: "Tri-X 400 · f/4 · 1/15",
    author: "Пётр Кузьмин",
  },
  {
    id: "w10",
    src: w10,
    alt: "Тень оконной рамы на пустой стене",
    frame: "30",
    meta: "Tri-X 400 · f/16 · 1/500",
    author: "Илья Гордеев",
  },
  {
    id: "w11",
    src: w11,
    alt: "Спина человека, идущего по набережной",
    frame: "33",
    meta: "HP5 Plus · f/5.6 · 1/250",
    author: "Марина Соколова",
  },
  {
    id: "w12",
    src: w12,
    alt: "Отпечаток, проступающий в кювете с проявителем",
    frame: "36",
    meta: "Delta 400 · f/2 · 1/8",
    author: "Аня Верещагина",
  },
];

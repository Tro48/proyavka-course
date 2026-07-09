/**
 * Генерация фотографий через Stable Diffusion (Forge/A1111 REST API).
 *
 *   node scripts/generate-photos.mjs                    — Forge на этой машине
 *   SD_URL=http://forge-host:7860 node scripts/…       — Forge на другой
 *   ONLY=hero …                                        — одна цель (hero | author | 1..12)
 *
 * Модель — dreamshaperXL_lightning: мало шагов, низкий CFG, DPM++ SDE + Karras.
 * Для Forge обязателен `hr_additional_modules: []`, иначе hires падает.
 *
 * Промпты написаны под alt-тексты из `src/content/works.ts`: alt обязан
 * описывать то, что на снимке действительно есть, иначе он врёт скринридеру.
 *
 * Снимки — сгенерированные, не фотографии живых людей. См. CREDITS.md.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SD_URL = process.env.SD_URL ?? "http://127.0.0.1:7860";
const ONLY = process.env.ONLY ?? "";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Не `public/`: снимки подключаются статическим импортом и проходят через
// бандлер. В `public/` они лежали бы вторым, никем не читаемым экземпляром.
const imagesDir = join(root, "src", "images");

const BUDGET_BYTES = 1.8 * 1024 * 1024;

/** Ч/б плёнка: курс печатает руками, цветную C-41 в лаборатории не проявляют. */
const MONO =
  "35mm black and white film photograph, Kodak Tri-X 400, visible film grain, " +
  "high contrast, analog, hand printed on fiber paper, natural light";

/** Тёмная комната под красным фонарём — единственное цветное место на сайте. */
const SAFELIGHT =
  "dark photography darkroom lit only by a dim red safelight, deep shadows, " +
  "moody cinematic 35mm film photograph, visible grain, analog";

const NEGATIVE_COMMON =
  "text, letters, words, typography, caption, signature, watermark, logo, ui, " +
  "border, frame, low quality, blurry, jpeg artifacts, oversaturated, cgi, " +
  "3d render, illustration, cartoon, deformed hands, extra fingers, mutated hands, " +
  "distorted face, disfigured";

const NEGATIVE_MONO = `color, colorful, saturated colors, ${NEGATIVE_COMMON}`;

/**
 * Кадры контрольного листа. Порядок и смысл — как в src/content/works.ts.
 *
 * Сид у каждого кадра свой, а не `7100 + index`: удачные сиды распределены не
 * подряд, и подобранный кадр важнее красивой нумерации.
 *
 * `avoid` — стоп-слова сверх общих. Модель читает «roll of film» как камеру,
 * «cassette» как аудиокассету, а «tongs» как столовый прибор, и `alt` в
 * works.ts начинает врать скринридеру. Стоп-слова при `cfg_scale: 2` только
 * подчищают: разворачивает кадр сам промпт, поэтому предмет описан подробно.
 *
 * Ни рук, ни надписей в кадре: гнутые пальцы и псевдотипографика — главные
 * признаки генерации. Поэтому сюжеты выбраны так, чтобы руки и текст в них
 * просто нечему было держать: не «руки с плёнкой», а капли на стекле; не
 * трамвай с маршрутным табло, а пустые рельсы; не банки с этикетками, а
 * гладкие бачки.
 */
const WORKS = [
  {
    seed: 7100,
    prompt:
      "an empty courtyard well of an old apartment block in morning fog, bare walls",
  },
  {
    seed: 7101,
    prompt:
      "silhouette of a person standing in a doorway against bright backlight, contre-jour",
  },
  {
    seed: 7102,
    prompt: "wet cobblestone pavement at night reflecting a single street lamp",
  },
  {
    seed: 7103,
    prompt:
      "close up of raindrops running down a window pane, the blurred city out of focus behind the wet glass, shallow depth of field",
    avoid: "hands, fingers, arm, person, people, numbers, digits, label",
  },
  {
    seed: 91,
    prompt:
      "a gust of wind lifts a thin white curtain, the fabric flying inward and upward into the room, open window behind it, empty room",
    avoid:
      "draped curtain, swag, tied back, still curtain, heavy drapes, closed window, person, people, face, human",
  },
  {
    seed: 7105,
    prompt: "a spiral staircase stairwell shot looking straight up from below",
  },
  {
    seed: 7106,
    prompt: "portrait of an elderly man sitting by a window, soft side light on his face",
  },
  {
    seed: 214,
    prompt:
      "low angle close up along empty snow covered tram tracks, the rails filling the foreground and curving away, heavy falling snow, everything beyond dissolving into white fog, no buildings visible",
    // Трамвай приходит с маршрутным табло, улица — с вывесками.
    avoid:
      "tram, streetcar, vehicle, destination board, sign, signage, street sign, shop sign, banner, poster, buildings, windows, hands, person, people",
  },
  {
    seed: 7108,
    prompt:
      "close up of two black cylindrical film developing tanks with their lids on, standing on a bare wooden darkroom bench, three stainless steel spiral film reels lying beside them, plain smooth matte surfaces, nothing written on them, soft side light",
    // Мензурки и термометры приходят со шкалой, банки — с этикеткой.
    avoid:
      "label, sticker, packaging, beaker, graduated cylinder, laboratory glassware, measuring scale, graduations, numbers, dial, gauge, hands, person, people",
  },
  {
    seed: 7109,
    prompt: "the shadow of a window frame cast across an empty plaster wall",
  },
  {
    seed: 7110,
    prompt: "the back of a person walking away along an empty embankment by a river",
  },
  {
    seed: 82,
    prompt:
      "a photographic print emerging in a shallow tray of developer, the wet print half submerged in the liquid, print tongs at the edge of the tray, darkroom bench",
    avoid:
      "fork, knife, spoon, cutlery, tableware, plate, dinner table, food, person, people, face, human, head, portrait, ink, black liquid, paint",
  },
];

/**
 * «Cinematic» в обучении модели — это teal-and-orange, и без поправки интерьер
 * уезжает в бирюзу с белой лампой под потолком. Основную работу делает
 * положительный промпт («bathed in deep red glow»), стоп-слова только
 * подчищают: при `cfg_scale: 2` негатив влияет слабо.
 */
const NO_WHITE_LIGHT =
  "ceiling lamp, pendant lamp, fluorescent tube, strip light, bright lamp, green, teal, " +
  "cyan, blue, blue tint, bright white light, daylight, sunlight, window, monitor, screen";

/**
 * На верёвку в проявочной модель охотно вешает ню. Отпечатки в кадре должны
 * быть пейзажами: это лендинг курса, а не галерея.
 */
const NO_PEOPLE =
  "nude, nudity, naked body, figure study, lingerie, erotic, person, people";

/**
 * Портрет по грудь: стоило дать модели стол, как автор клал на него руки —
 * со сросшимися пальцами. Кадрируем выше стола, руки держать нечем.
 */
const NO_HANDS = "hands, fingers, arms, forearms, palms, full body, waist";

/** SDXL любит стороны, кратные 64. 1216×832 ≈ 3:2, 896×1152 ≈ 3:4. */
const targets = [
  {
    name: "hero",
    file: join(imagesDir, "hero.webp"),
    prompt: `${SAFELIGHT}, wide shot of a small darkroom bathed in deep red glow: a photographic enlarger on a workbench, three developing trays side by side on the bench, wet black and white landscape prints of empty streets hanging from a wire with clothespins across the room, dark walls, single red safelight lamp on the wall`,
    negative: `${NO_PEOPLE}, ${NO_WHITE_LIGHT}, ${NEGATIVE_COMMON}`,
    seed: 34,
    base: [1216, 832],
    hires: 2,
    out: [1600, 1067],
    quality: 74,
  },
  {
    name: "author",
    file: join(imagesDir, "author.webp"),
    prompt: `${SAFELIGHT}, head and shoulders portrait of a calm bearded man in his forties looking into the lens, the tall column and lamp housing of a photographic enlarger rising beside his shoulder in the foreground, dark red room, cropped just below the collarbone`,
    negative: `${NO_HANDS}, ${NEGATIVE_COMMON}`,
    seed: 7002,
    base: [896, 1152],
    hires: 1.5,
    out: [900, 1200],
    quality: 74,
  },
  ...WORKS.map(({ prompt, seed, avoid }, index) => ({
    name: String(index + 1),
    file: join(imagesDir, "works", `${String(index + 1).padStart(2, "0")}.webp`),
    prompt: `${prompt}, ${MONO}`,
    negative: avoid ? `${avoid}, ${NEGATIVE_MONO}` : NEGATIVE_MONO,
    seed,
    base: [1216, 832],
    hires: 0,
    out: [900, 600],
    quality: 72,
  })),
];

async function txt2img(target) {
  const [width, height] = target.base;

  const payload = {
    prompt: target.prompt,
    negative_prompt: target.negative,
    seed: target.seed,
    steps: 8,
    cfg_scale: 2,
    width,
    height,
    sampler_name: "DPM++ SDE",
    scheduler: "Karras",
    send_images: true,
    save_images: false,
    ...(target.hires
      ? {
          enable_hr: true,
          hr_scale: target.hires,
          hr_upscaler: "R-ESRGAN 4x+",
          hr_second_pass_steps: 8,
          denoising_strength: 0.4,
          hr_additional_modules: [], // обязательно для Forge
        }
      : {}),
  };

  const response = await fetch(`${SD_URL}/sdapi/v1/txt2img`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — включён ли --api у Forge? (${SD_URL})`);
  }

  const data = await response.json();
  const image = data.images?.[0];
  if (!image) throw new Error("пустой ответ txt2img");

  return Buffer.from(image, "base64");
}

async function render(target) {
  const started = Date.now();
  const master = await txt2img(target);
  const [outW, outH] = target.out;

  const webp = await sharp(master)
    .resize(outW, outH, { fit: "cover", position: "attention", kernel: "lanczos3" })
    .webp({ quality: target.quality, effort: 6 })
    .toBuffer();

  await mkdir(dirname(target.file), { recursive: true });
  await writeFile(target.file, webp);

  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  console.log(
    `✓ ${target.name.padEnd(7)} ${outW}×${outH}  ${(webp.byteLength / 1024).toFixed(1)} КБ  ${seconds} с`,
  );
  return webp.byteLength;
}

const queue = ONLY ? targets.filter((t) => t.name === ONLY) : targets;
if (queue.length === 0) throw new Error(`ONLY=${ONLY}: такой цели нет`);

let total = 0;
for (const target of queue) total += await render(target);

console.log(`\nВсего: ${(total / 1024 / 1024).toFixed(2)} МБ`);

if (!ONLY && total > BUDGET_BYTES) {
  console.error(
    `Превышен бюджет веса изображений (${(BUDGET_BYTES / 1024 / 1024).toFixed(1)} МБ)`,
  );
  process.exit(1);
}

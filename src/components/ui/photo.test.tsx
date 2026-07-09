import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Photo } from "./photo";

/** Скелетон — единственный `aria-hidden` блок с пульсацией внутри обёртки. */
function skeleton(container: HTMLElement) {
  return container.querySelector(".animate-pulse");
}

function renderPhoto() {
  return render(
    <Photo
      src="/frame.webp"
      alt="Пустой двор-колодец"
      width={900}
      height={600}
      skeletonClassName="bg-graphite/25"
    />,
  );
}

describe("Photo", () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLImageElement.prototype, "complete");
  });

  it("до загрузки показывает скелетон", () => {
    const { container } = renderPhoto();

    expect(skeleton(container)).toBeInTheDocument();
  });

  // `next/image` прокидывает `onLoad` через `img.decode()`, то есть в микротаске.
  it("после загрузки скелетон убирается", async () => {
    const { container } = renderPhoto();

    fireEvent.load(screen.getByAltText("Пустой двор-колодец"));

    await waitFor(() => expect(skeleton(container)).not.toBeInTheDocument());
  });

  /**
   * Снимок из кеша дорисовывается до гидратации: события `load` уже не будет,
   * и без опроса `complete` скелетон завис бы под картинкой навсегда.
   */
  it("снимок из кеша не оставляет скелетон висеть", () => {
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });

    const { container } = renderPhoto();

    expect(skeleton(container)).not.toBeInTheDocument();
  });
});

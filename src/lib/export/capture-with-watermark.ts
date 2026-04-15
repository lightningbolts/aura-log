import { toPng } from "html-to-image";

export interface CaptureWithWatermarkOptions {
  /** CSS selector or HTMLElement */
  target: HTMLElement | string;
  fileName?: string;
  watermarkText?: string;
  pixelRatio?: number;
}

function resolveTarget(target: HTMLElement | string): HTMLElement {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error(`[captureWithWatermark] No element matching ${target}`);
    }
    return el;
  }
  return target;
}

function drawWatermark(
  source: HTMLCanvasElement,
  text: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[captureWithWatermark] Canvas 2D unsupported");
  ctx.drawImage(source, 0, 0);
  const padding = Math.round(Math.min(source.width, source.height) * 0.03);
  const fontSize = Math.max(14, Math.round(source.width * 0.022));
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = Math.max(2, fontSize * 0.08);
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const x = source.width - padding;
  const y = source.height - padding;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, fileName: string): void {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Rasterizes the DOM subtree, composites a bottom-right watermark, and
 * triggers a PNG download.
 */
export async function captureWithWatermark(
  options: CaptureWithWatermarkOptions,
): Promise<void> {
  const el = resolveTarget(options.target);
  const watermark = options.watermarkText ?? "AuraLog";
  const fileName = options.fileName ?? "auralog-share.png";
  const pixelRatio = options.pixelRatio ?? Math.min(2, window.devicePixelRatio || 1);

  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff",
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("[captureWithWatermark] Image decode failed"));
    img.src = dataUrl;
  });

  const tmp = document.createElement("canvas");
  tmp.width = img.naturalWidth;
  tmp.height = img.naturalHeight;
  const tctx = tmp.getContext("2d");
  if (!tctx) throw new Error("[captureWithWatermark] Canvas 2D unsupported");
  tctx.drawImage(img, 0, 0);

  const out = drawWatermark(tmp, watermark);
  downloadCanvas(out, fileName);
}

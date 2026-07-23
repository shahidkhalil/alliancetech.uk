export const CURSOR_SIZE = 12;
export const CURSOR_HOVER_SIZE = 44;

export const CURSOR_BLEND = "difference" as const;

export function cursorTargetFromEvent(target: EventTarget | null): "default" | "link" | "button" | "text" {
  if (!(target instanceof Element)) return "default";
  if (target.closest("button, [data-magnetic], .btn-dark, .btn-light")) return "button";
  if (target.closest("a, [role='link']")) return "link";
  if (target.closest("input, textarea, [contenteditable='true']")) return "text";
  return "default";
}

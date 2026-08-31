export function renderFeedback(message: string, type: "success" | "error" = "success"): string {
  if (type === "error") {
    return `<div class="notice error" role="alert" aria-live="assertive"><strong>Error:</strong> ${message}</div>`;
  }
  return `<div class="notice" role="status" aria-live="polite"><strong>Success:</strong> ${message}</div>`;
}

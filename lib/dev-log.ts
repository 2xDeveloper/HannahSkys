/** Log setup/infra issues for developers (terminal / Vercel logs / browser console). */
export function logDevIssue(context: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.error(`[dev] ${context}:`, detail);
  } else {
    console.error(`[dev] ${context}`);
  }
}

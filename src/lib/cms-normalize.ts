/**
 * CMS-friendly aliases on top of the lecture schema, shared by the
 * admin lecture routes:
 * `isFree` -> isPreviewable (the flag the app's free-lectures list uses),
 * `durationMin` -> durationSeconds, `order` -> sortOrder.
 */
export function normalizeLectureBody(body: any) {
  const input = { ...body };
  if (input.isPreviewable === undefined && input.isFree !== undefined) {
    input.isPreviewable = !!input.isFree;
  }
  if (input.durationSeconds === undefined && input.durationMin != null) {
    input.durationSeconds = Math.round(Number(input.durationMin) * 60) || 0;
  }
  if (input.sortOrder === undefined && input.order != null) {
    input.sortOrder = Number(input.order) || 1;
  }
  delete input.isFree;
  delete input.durationMin;
  delete input.order;
  return input;
}

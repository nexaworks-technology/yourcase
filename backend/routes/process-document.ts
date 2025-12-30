// Will run full pipeline: OCR → Event extraction → Timeline
export async function processUploadedFile(fileBuffer: Buffer) {
  return { status: "processing", text: "", events: [], timeline: [] };
}

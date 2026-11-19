import { getIsAdmin } from "~/server/better-auth/admin";
import { deleteUnusedUploadThingFile } from "~/server/articles";

// Receives sendBeacon requests from the article editor when it is closed
// with an unsaved upload. The file is only deleted if no article uses it.
export async function POST(request: Request) {
  if (!(await getIsAdmin())) {
    return new Response(null, { status: 401 });
  }

  let imageKey: unknown;
  try {
    ({ imageKey } = (await request.json()) as { imageKey?: unknown });
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof imageKey !== "string" || imageKey.trim() === "") {
    return new Response(null, { status: 400 });
  }

  const deleted = await deleteUnusedUploadThingFile(imageKey);
  return new Response(null, { status: deleted ? 204 : 409 });
}

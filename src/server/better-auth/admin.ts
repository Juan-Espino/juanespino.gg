import { env } from "~/env";
import { getSession } from "./server";

function getAdminEmails() {
  return env.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase());
}

export async function getIsAdmin() {
  const session = await getSession();

  if (!session?.user?.email) {
    return false;
  }

  return getAdminEmails().includes(session.user.email.toLowerCase());
}

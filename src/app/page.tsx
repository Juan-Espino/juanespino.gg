import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import AuthButton from "./auth-button";
import { getIsAdmin } from "~/server/better-auth/admin";
import CreateArticleForm from "./create-article-form";

export default async function Home() {
  const session = await getSession();
  const isAdmin = await getIsAdmin();
  console.log(isAdmin);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          What <span className="text-[hsl(280,100%,70%)]">Up</span> Peeps
        </h1>
        {isAdmin && <h2 className="text-3xl text-red-600">{"hello admin!"}</h2>}
        <CreateArticleForm />
        <Link
          className="rounded-full border p-2 text-blue-500"
          href={"/articles"}
        >
          GO TO ARTICLES
        </Link>
        <Link
          className="rounded-full border p-2 text-blue-500"
          href={"/edit-article"}
        >
          Edit ARTICLES
        </Link>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              {session && (
                <span>
                  Logged in as {session.user?.name} {session.user.email}
                </span>
              )}
            </p>
            <img src={session?.user?.image ?? ""} />

            {!session ? (
              <AuthButton />
            ) : (
              <form>
                <button
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                  formAction={async () => {
                    "use server";
                    await auth.api.signOut({
                      headers: await headers(),
                    });
                    redirect("/");
                  }}
                >
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

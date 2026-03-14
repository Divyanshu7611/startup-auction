import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import AdminAuctionManager from "@/components/AdminAuctionManager";

export default async function ManageAuctionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const adminSession = verifyAdminSessionToken(token);

  if (!adminSession) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:mb-6 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manage Auction</h1>
              <p className="mt-1 text-sm text-slate-600">
                Signed in as <span className="font-semibold">{adminSession.userId}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>

        <AdminAuctionManager />
      </div>
    </main>
  );
}

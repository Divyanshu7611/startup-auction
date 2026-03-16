import { redirect } from "next/navigation";

export default async function AdminEntryPage() {
  // Direct redirect to login - no session check
  redirect("/admin/login");
}

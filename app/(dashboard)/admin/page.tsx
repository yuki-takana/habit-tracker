import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import AdminDashboard from "./admin-client"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null; // Handled by middleware
  if (session.user?.email !== "abhisheaurya@gmail.com") redirect("/dashboard")

  return <AdminDashboard />
}

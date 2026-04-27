import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SettingsPageClient from "./settings-client"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect("/")

  return <SettingsPageClient />
}

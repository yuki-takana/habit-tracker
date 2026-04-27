import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import TodosPageClient from "./todos-client"

export default async function TodosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect("/")

  return <TodosPageClient />
}

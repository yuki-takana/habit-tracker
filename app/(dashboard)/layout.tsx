import DashboardSidebar from "@/components/shared/dashboard-sidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { fetchUserSubscriptionTier, getSubscriptionConfig } from "@/app/action";
import FeatureGateGuard from "@/components/shared/FeatureGateGuard";
import NotificationProvider from "@/components/NotificationProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const { plan, periodEnd } = await fetchUserSubscriptionTier();
  const config = await getSubscriptionConfig();
  const isPro = plan === "pro";
  
  return (
    <div className="flex flex-1 min-h-screen">
      <NotificationProvider />
      <DashboardSidebar isPro={isPro}/>
      <main className="flex-1 transition-all duration-300 lg:pl-[256px]">
        <DashboardHeader isPro={isPro} periodEnd={periodEnd} />
        <div className="container mx-auto px-4 py-6">
          <FeatureGateGuard config={config}>
            {children}
          </FeatureGateGuard>
        </div>
      </main>
    </div>
  );
}
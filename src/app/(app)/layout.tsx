import AppSidebar from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col pl-0 md:pl-[5rem]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

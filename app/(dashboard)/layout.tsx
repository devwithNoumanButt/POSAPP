import { UserNav } from "@/app/components/UserNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserNav />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </>
  );
} 
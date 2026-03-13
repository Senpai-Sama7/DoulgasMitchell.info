import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminSidebar user={session} />
      <div className="min-h-screen flex-1 flex flex-col lg:min-w-0">
        <AdminHeader user={session} />
        <main id="main-content" className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

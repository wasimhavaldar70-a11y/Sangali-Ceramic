'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadActions from '@/components/LeadActions';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <LeadActions />}
    </>
  );
}

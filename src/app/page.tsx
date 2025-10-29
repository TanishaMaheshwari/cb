import { getAccounts, getCategories, getTransactions, getBooks } from '@/lib/data';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { cookies } from 'next/headers';
import Header from '@/components/layout/Header';

export const dynamic = 'force-dynamic';

// src/app/page.tsx

// ... (imports)
// ... (dynamic = 'force-dynamic')

export default async function Home() {
  
  // Get the cookie store and handle it properly
  const cookieStore = await cookies();
  const activeBookId = cookieStore.get('activeBookId')?.value || 'book_default';
  
  // --- NEW ERROR HANDLING BLOCK ---
  try {
    const [initialTransactions, accounts, categories] = await Promise.all([
      getTransactions(activeBookId),
      getAccounts(activeBookId),
      getCategories(activeBookId),
    ]);

    return (
      <>
        <Header />
        <DashboardClient
          initialTransactions={initialTransactions}
          accounts={accounts}
          categories={categories}
        />
      </>
    );
  } catch (error) {
    // This will print the *actual* error causing the ECONNRESET crash.
    console.error("Dashboard Data Fetching Failed:", error);

    // Return a simple static fallback page for graceful failure.
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Data Load Error ❌</h1>
        <p>A critical error occurred while fetching dashboard data. Check the server console for details.</p>
        <p>Error details: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }
}
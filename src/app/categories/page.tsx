
import { getAccounts, getCategories, getTransactions } from '@/lib/data';
import type { Account, Transaction, Category } from '@/lib/types';
import CategoriesClient from '@/components/categories/CategoriesClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type AccountWithBalance = Account & { balance: number };
type CategoryWithDetails = Category & {
  accounts: AccountWithBalance[];
  totalBalance: number;
};

export default async function AllCategoriesPage() {
  const cookieStore = await cookies();
  const activeBookId = cookieStore.get('activeBookId')?.value || 'book_default';

  const [categories, accounts, transactions] = await Promise.all([
    getCategories(activeBookId),
    getAccounts(activeBookId),
    getTransactions(activeBookId),
  ]) as [Category[], Account[], Transaction[]];

  const categoriesWithDetails: CategoryWithDetails[] = categories.map((category: Category) => {
    const accountsInCategory = accounts.filter((acc: Account) => acc.categoryId === category.id);
    
    const accountsWithBalances = accountsInCategory.map((account: Account) => {
      const accountEntries = transactions.flatMap((t: Transaction) => t.entries).filter((e: any) => e.accountId === account.id);
      const totalDebit = accountEntries.filter((e: any) => e.type === 'debit').reduce((sum: number, e: any) => sum + e.amount, 0);
      const totalCredit = accountEntries.filter((e: any) => e.type === 'credit').reduce((sum: number, e: any) => sum + e.amount, 0);

      // Raw balance is always Debit - Credit
      const balance = totalDebit - totalCredit;

      return { ...account, balance };
    });

    const totalBalance = accountsWithBalances.reduce((sum: number, acc: AccountWithBalance) => sum + acc.balance, 0);

    return {
      ...category,
      accounts: accountsWithBalances,
      totalBalance,
    };
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <CategoriesClient 
          categories={categoriesWithDetails} 
          allCategories={categories}
      />
    </div>
  );
}

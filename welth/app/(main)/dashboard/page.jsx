import { getUserAccounts } from "@/actions/accounts";
import { getCurrentBudget } from "@/actions/budget";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "@/components/budget-progress";
import { AccountCard } from "./_components/account-card";
import { DashboardOverview } from "./_components/transaction-overview";
import { SeedButton } from "./_components/seed-button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

async function getDashboardData() {
  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => ({
    ...t,
    amount: t.amount.toNumber(),
  }));
}

const DashboardPage = async () => {
  const accounts = await getUserAccounts();
  const transactions = await getDashboardData();

  const defaultAccount = accounts?.find((a) => a.isDefault);
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="px-5 pt-24 space-y-8">

      {/* Header with Seed Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-6xl font-bold gradient-title">Dashboard</h1>
        <SeedButton />
      </div>

      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses ?? 0}
        />
      )}

      {/* Dashboard Overview - Recent Transactions + Pie Chart */}
      {accounts.length > 0 && (
        <DashboardOverview accounts={accounts} transactions={transactions} />
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full pt-5 text-muted-foreground">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
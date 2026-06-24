import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import { TransactionTable } from "../_components/transaction-table";
import { AccountChart } from "../_components/account-chart";

const AccountPage = async ({ params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) notFound();

  const { transactions, ...account } = accountData;

  return (
    <div className="px-5 pt-24 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground capitalize">
            {account.type.toLowerCase()} Account
          </p>
        </div>
        <div className="text-right pb-2">
          <div className="text-xl font-bold">
            ${account.balance.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      <AccountChart transactions={transactions} />
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default AccountPage;
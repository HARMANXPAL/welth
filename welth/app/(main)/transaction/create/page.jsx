import { getUserAccounts } from "@/actions/accounts";
import { defaultCategories } from "@/data/categories";
import { TransactionForm } from "@/components/transaction-form";

const AddTransactionPage = async () => {
  const accounts = await getUserAccounts();

  return (
    <div className="max-w-3xl mx-auto px-5 pt-24">
      <h1 className="text-5xl gradient-title font-bold mb-8">
        Add Transaction
      </h1>
      <TransactionForm accounts={accounts} categories={defaultCategories} />
    </div>
  );
};

export default AddTransactionPage;
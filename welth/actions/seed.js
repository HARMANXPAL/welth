"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { subDays } from "date-fns";

const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [50, 200] },
    { name: "education", range: [100, 300] },
    { name: "travel", range: [200, 1000] },
  ],
};

function getRandomAmount(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  return {
    category: cat.name,
    amount: getRandomAmount(cat.range[0], cat.range[1]),
  };
}

export async function seedTransactions() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!account) throw new Error("No default account found");

    const transactions = [];
    let totalBalance = account.balance.toNumber();

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const balance = type === "INCOME" ? amount : -amount;
        totalBalance += balance;

        transactions.push({
          type,
          amount,
          description: `${category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} transaction`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
        });
      }
    }

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { accountId: account.id },
      });
      await tx.transaction.createMany({ data: transactions });
      await tx.account.update({
        where: { id: account.id },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
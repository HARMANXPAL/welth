"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    const balanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      }),
      db.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const transaction = await db.transaction.findUnique({
    where: { id, userId: user.id },
  });

  if (!transaction) throw new Error("Transaction not found");
  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    const originalTransaction = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const balanceDiff = newBalanceChange - oldBalanceChange;

    const [updatedTransaction] = await db.$transaction([
      db.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      }),
      db.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceDiff } },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(updatedTransaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    const transaction = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });

    if (!transaction) throw new Error("Transaction not found");

    const balanceChange =
      transaction.type === "EXPENSE"
        ? transaction.amount.toNumber()
        : -transaction.amount.toNumber();

    await db.$transaction([
      db.transaction.delete({ where: { id, userId: user.id } }),
      db.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY": date.setDate(date.getDate() + 1); break;
    case "WEEKLY": date.setDate(date.getDate() + 7); break;
    case "MONTHLY": date.setMonth(date.getMonth() + 1); break;
    case "YEARLY": date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
}
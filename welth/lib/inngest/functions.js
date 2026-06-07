import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenAI } from "@google/genai";

export const checkBudgetAlerts = inngest.createFunction(
  { id: "check-budget-alerts", name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                include: { transactions: true },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const expenses = await step.run(`fetch-expenses-${budget.id}`, async () => {
        return await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            type: "EXPENSE",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });
      });

      const totalExpenses = expenses._sum.amount
  ? parseFloat(expenses._sum.amount.toString())
  : 0;
const budgetAmount = parseFloat(budget.amount.toString());
      const percentageUsed = (totalExpenses / budgetAmount) * 100;

      if (
        percentageUsed >= 80 &&
        (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), currentDate))
      ) {
        await step.run(`send-alert-${budget.id}`, async () => {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert: ${Math.round(percentageUsed)}% of your budget used`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: { budgetAmount, totalExpenses, percentageUsed },
            }),
          });
        });

        await step.run(`update-budget-${budget.id}`, async () => {
          return await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        });
      }
    }
  }
);

export const triggerRecurringTransactions = inngest.createFunction(
  { id: "trigger-recurring-transactions", name: "Trigger Recurring Transactions" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run("fetch-recurring-transactions", async () => {
      return await db.transaction.findMany({
        where: {
          isRecurring: true,
          status: "COMPLETED",
          OR: [
            { nextRecurringDate: null },
            { nextRecurringDate: { lte: new Date() } },
          ],
        },
      });
    });

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    concurrency: { limit: 10 },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    await step.run("process-transaction", async () => {
      const { transactionId, userId } = event.data;

      const transaction = await db.transaction.findUnique({
        where: { id: transactionId, userId },
        include: { account: true },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction([
        db.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            status: "COMPLETED",
            isRecurring: false,
            userId: transaction.userId,
            accountId: transaction.accountId,
          },
        }),
        db.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment:
                transaction.type === "EXPENSE"
                  ? -transaction.amount.toNumber()
                  : transaction.amount.toNumber(),
            },
          },
        }),
        db.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        }),
      ]);
    });
  }
);

export const generateMonthlyReports = inngest.createFunction(
  { id: "generate-monthly-reports", name: "Generate Monthly Reports" },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", { month: "long" });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: { month: monthName, stats, insights },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

async function getMonthlyStats(userId, month) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const [income, expenses, transactions] = await Promise.all([
    db.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
    }),
  ]);

  const byCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const amount = t.amount.toNumber();
      acc[t.category] = (acc[t.category] || 0) + amount;
      return acc;
    }, {});

  return {
    totalIncome: income._sum.amount?.toNumber() || 0,
    totalExpenses: expenses._sum.amount?.toNumber() || 0,
    byCategory,
    transactionCount: transactions.length,
  };
}

async function generateFinancialInsights(stats, month) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              text: `Analyze this financial data and provide 3 concise, actionable insights:
                Month: ${month}
                Total Income: $${stats.totalIncome}
                Total Expenses: $${stats.totalExpenses}
                Net: $${stats.totalIncome - stats.totalExpenses}
                Expenses by Category: ${JSON.stringify(stats.byCategory)}
                
                Format: Return exactly 3 bullet points, each under 100 characters.`,
            },
          ],
        },
      ],
    });

    const text = response.text;
    return text
      .split("\n")
      .filter((line) => line.trim().startsWith("•") || line.trim().startsWith("-"))
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    // Fallback insights without AI
    return [
      `- Total spending this month: $${stats.totalExpenses.toFixed(2)}`,
      `- Net savings: $${(stats.totalIncome - stats.totalExpenses).toFixed(2)}`,
      `- Total transactions: ${stats.transactionCount}`,
    ];
  }
}

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return nextDue <= today;
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

function isNewMonth(date1, date2) {
  return (
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  );
}
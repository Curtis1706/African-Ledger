import { Router, type IRouter } from "express";
import { db, transactionsTable, expensesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  GetMonthlyReportQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/monthly", async (req, res): Promise<void> => {
  const params = GetMonthlyReportQueryParams.safeParse(req.query);
  const year = params.success && params.data.year ? params.data.year : new Date().getFullYear();

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const transactions = await db.select().from(transactionsTable);
  const expenses = await db.select().from(expensesTable);

  const result = months.map((month, idx) => {
    const monthStr = `${year}-${String(idx + 1).padStart(2, "0")}`;
    const revenue = transactions
      .filter(t => t.type === "revenue" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenseFromTransactions = transactions
      .filter(t => t.type === "expense" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenseFromExpenses = expenses
      .filter(e => e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalExpenses = expenseFromTransactions + expenseFromExpenses;
    const transactionCount = transactions.filter(t => t.date.startsWith(monthStr)).length;
    return {
      month,
      revenue: Math.round(revenue),
      expenses: Math.round(totalExpenses),
      profit: Math.round(revenue - totalExpenses),
      transactionCount,
    };
  });

  res.json(result);
});

router.get("/reports/summary", async (req, res): Promise<void> => {
  const transactions = await db.select().from(transactionsTable);
  const expenses = await db.select().from(expensesTable);

  const totalRevenue = transactions
    .filter(t => t.type === "revenue")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) +
    expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const year = new Date().getFullYear();

  let bestMonth = "N/A";
  let worstMonth = "N/A";
  let bestProfit = -Infinity;
  let worstProfit = Infinity;

  months.forEach((month, idx) => {
    const monthStr = `${year}-${String(idx + 1).padStart(2, "0")}`;
    const rev = transactions
      .filter(t => t.type === "revenue" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const exp = transactions
      .filter(t => t.type === "expense" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) +
      expenses.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const profit = rev - exp;
    if (rev > 0 || exp > 0) {
      if (profit > bestProfit) { bestProfit = profit; bestMonth = month; }
      if (profit < worstProfit) { worstProfit = profit; worstMonth = month; }
    }
  });

  res.json({
    totalRevenue: Math.round(totalRevenue),
    totalExpenses: Math.round(totalExpenses),
    netProfit: Math.round(netProfit),
    profitMargin: Math.round(profitMargin * 10) / 10,
    bestMonth,
    worstMonth,
  });
});

export default router;

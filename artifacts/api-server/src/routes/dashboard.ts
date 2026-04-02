import { Router, type IRouter } from "express";
import { db, clientsTable, transactionsTable, invoicesTable, expensesTable } from "@workspace/db";
import { sql, eq, and, gte, lte, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const prevMonthStr = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, "0")}`;

  const allTransactions = await db.select().from(transactionsTable);
  const allExpenses = await db.select().from(expensesTable);

  const totalRevenue = allTransactions
    .filter(t => t.type === "revenue")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = allTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) +
    allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  const currentRevenue = allTransactions
    .filter(t => t.type === "revenue" && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const prevRevenue = allTransactions
    .filter(t => t.type === "revenue" && t.date.startsWith(prevMonthStr))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const currentExpenses = allTransactions
    .filter(t => t.type === "expense" && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const prevExpenses = allTransactions
    .filter(t => t.type === "expense" && t.date.startsWith(prevMonthStr))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const expensesGrowth = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;

  const currentProfit = currentRevenue - currentExpenses;
  const prevProfit = prevRevenue - prevExpenses;
  const profitGrowth = prevProfit !== 0 ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;

  const pendingInvoices = await db
    .select()
    .from(invoicesTable)
    .then(rows => rows.filter(i => i.status === "sent" || i.status === "overdue").length);

  const totalClients = await db.select().from(clientsTable).then(rows => rows.length);

  res.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    expensesGrowth: Math.round(expensesGrowth * 10) / 10,
    profitGrowth: Math.round(profitGrowth * 10) / 10,
    pendingInvoices,
    totalClients,
  });
});

router.get("/dashboard/chart", async (req, res): Promise<void> => {
  const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const transactions = await db.select().from(transactionsTable);
  const expenses = await db.select().from(expensesTable);

  const chartData = months.map((month, idx) => {
    const monthStr = `${year}-${String(idx + 1).padStart(2, "0")}`;
    const revenue = transactions
      .filter(t => t.type === "revenue" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === "expense" && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) +
      expenses
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return {
      month,
      revenue: Math.round(revenue),
      expenses: Math.round(expense),
      profit: Math.round(revenue - expense),
    };
  });

  res.json(chartData);
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

  const clients = await db.select().from(clientsTable);
  const clientMap = new Map(clients.map(c => [c.id, c]));

  const activities = transactions.map(t => ({
    id: t.id,
    type: "transaction",
    description: t.description,
    amount: parseFloat(t.amount),
    date: t.createdAt.toISOString(),
    category: t.category,
    clientName: t.clientId ? clientMap.get(t.clientId)?.name : null,
  }));

  res.json(activities);
});

router.get("/dashboard/alerts", async (req, res): Promise<void> => {
  const alerts = [];

  const overdueInvoices = await db
    .select()
    .from(invoicesTable)
    .then(rows => rows.filter(i => i.status === "overdue"));

  if (overdueInvoices.length > 0) {
    alerts.push({
      id: 1,
      type: "warning",
      title: "Factures en retard",
      message: `${overdueInvoices.length} facture(s) sont en retard de paiement.`,
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const dueSoon = await db
    .select()
    .from(invoicesTable)
    .then(rows => rows.filter(i => i.status === "sent" && i.dueDate <= today));

  if (dueSoon.length > 0) {
    alerts.push({
      id: 2,
      type: "info",
      title: "Factures à échéance",
      message: `${dueSoon.length} facture(s) arrivent à échéance bientôt.`,
    });
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = await db
    .select()
    .from(expensesTable)
    .then(rows => rows.filter(e => e.date.startsWith(thisMonth)));
  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  if (monthExpenseTotal > 500000) {
    alerts.push({
      id: 3,
      type: "warning",
      title: "Dépenses élevées",
      message: `Vos dépenses ce mois dépassent 500 000 FCFA.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 4,
      type: "success",
      title: "Tout va bien",
      message: "Aucune alerte en ce moment. Continuez comme ça !",
    });
  }

  res.json(alerts);
});

export default router;

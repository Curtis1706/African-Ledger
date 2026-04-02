import { Router, type IRouter } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateExpenseBody,
  ListExpensesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/expenses", async (req, res): Promise<void> => {
  const params = ListExpensesQueryParams.safeParse(req.query);
  let rows = await db.select().from(expensesTable).orderBy(desc(expensesTable.createdAt));

  if (params.success && params.data.category) {
    rows = rows.filter(e => e.category === params.data.category);
  }

  const result = rows.map(e => ({
    ...e,
    amount: parseFloat(e.amount),
  }));

  res.json(result);
});

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(expensesTable).values({
    ...parsed.data,
    amount: String(parsed.data.amount),
  }).returning();

  res.status(201).json({
    ...row,
    amount: parseFloat(row.amount),
  });
});

router.get("/expenses/by-category", async (req, res): Promise<void> => {
  const rows = await db.select().from(expensesTable);

  const categoryMap = new Map<string, number>();
  const categoryCount = new Map<string, number>();

  let total = 0;
  for (const row of rows) {
    const amount = parseFloat(row.amount);
    categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + amount);
    categoryCount.set(row.category, (categoryCount.get(row.category) ?? 0) + 1);
    total += amount;
  }

  const result = Array.from(categoryMap.entries()).map(([category, catTotal]) => ({
    category,
    total: Math.round(catTotal),
    percentage: total > 0 ? Math.round((catTotal / total) * 1000) / 10 : 0,
    count: categoryCount.get(category) ?? 0,
  }));

  res.json(result);
});

export default router;

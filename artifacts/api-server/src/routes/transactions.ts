import { Router, type IRouter } from "express";
import { db, clientsTable, transactionsTable } from "@workspace/db";
import { eq, desc, and, gte, lte, ilike, or } from "drizzle-orm";
import {
  CreateTransactionBody,
  GetTransactionParams,
  DeleteTransactionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res): Promise<void> => {
  const { type, from, to, search } = req.query as {
    type?: string;
    from?: string;
    to?: string;
    search?: string;
  };

  let rows = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt));
  const clients = await db.select().from(clientsTable);
  const clientMap = new Map(clients.map(c => [c.id, c]));

  if (type === "revenue" || type === "expense") {
    rows = rows.filter(t => t.type === type);
  }
  if (from) {
    rows = rows.filter(t => t.date >= from);
  }
  if (to) {
    rows = rows.filter(t => t.date <= to);
  }
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(t =>
      t.description.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s)
    );
  }

  const result = rows.map(t => ({
    ...t,
    amount: parseFloat(t.amount),
    clientName: t.clientId ? clientMap.get(t.clientId)?.name ?? null : null,
  }));

  res.json(result);
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(transactionsTable).values({
    ...parsed.data,
    amount: String(parsed.data.amount),
    clientId: parsed.data.clientId ?? null,
  }).returning();

  const clients = await db.select().from(clientsTable);
  const clientMap = new Map(clients.map(c => [c.id, c]));

  res.status(201).json({
    ...row,
    amount: parseFloat(row.amount),
    clientName: row.clientId ? clientMap.get(row.clientId)?.name ?? null : null,
  });
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  const clients = await db.select().from(clientsTable);
  const clientMap = new Map(clients.map(c => [c.id, c]));

  res.json({
    ...row,
    amount: parseFloat(row.amount),
    clientName: row.clientId ? clientMap.get(row.clientId)?.name ?? null : null,
  });
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.delete(transactionsTable).where(eq(transactionsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

import { Router, type IRouter } from "express";
import { db, clientsTable, transactionsTable } from "@workspace/db";
import { eq, desc, ilike } from "drizzle-orm";
import {
  CreateClientBody,
  GetClientParams,
  ListClientsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clients", async (req, res): Promise<void> => {
  const params = ListClientsQueryParams.safeParse(req.query);
  let clients = await db.select().from(clientsTable).orderBy(desc(clientsTable.createdAt));
  const transactions = await db.select().from(transactionsTable);

  if (params.success && params.data.search) {
    const s = params.data.search.toLowerCase();
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s)
    );
  }

  const result = clients.map(c => {
    const clientTransactions = transactions.filter(t => t.clientId === c.id && t.type === "revenue");
    const totalPaid = clientTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const transactionCount = transactions.filter(t => t.clientId === c.id).length;
    return {
      ...c,
      createdAt: c.createdAt.toISOString(),
      totalPaid,
      transactionCount,
    };
  });

  res.json(result);
});

router.post("/clients", async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(clientsTable).values({
    ...parsed.data,
    address: parsed.data.address ?? "",
  }).returning();

  res.status(201).json({
    ...row,
    createdAt: row.createdAt.toISOString(),
    totalPaid: 0,
    transactionCount: 0,
  });
});

router.get("/clients/:id", async (req, res): Promise<void> => {
  const params = GetClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, params.data.id));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.clientId, params.data.id))
    .orderBy(desc(transactionsTable.createdAt));

  const clientTransactions = transactions.filter(t => t.type === "revenue");
  const totalPaid = clientTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const transactionCount = transactions.length;

  const transactionsResult = transactions.map(t => ({
    ...t,
    amount: parseFloat(t.amount),
    clientId: t.clientId,
    clientName: client.name,
  }));

  res.json({
    ...client,
    createdAt: client.createdAt.toISOString(),
    totalPaid,
    transactionCount,
    transactions: transactionsResult,
  });
});

export default router;

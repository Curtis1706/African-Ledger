import { Router, type IRouter } from "express";
import { db, clientsTable, invoicesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateInvoiceBody,
  GetInvoiceParams,
  UpdateInvoiceParams,
  UpdateInvoiceBody,
  ListInvoicesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatInvoice(invoice: any, clientName: string) {
  return {
    ...invoice,
    total: parseFloat(invoice.total),
    clientName,
    items: Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items as string || "[]"),
  };
}

router.get("/invoices", async (req, res): Promise<void> => {
  const params = ListInvoicesQueryParams.safeParse(req.query);
  let rows = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt));
  const clients = await db.select().from(clientsTable);
  const clientMap = new Map(clients.map(c => [c.id, c]));

  if (params.success && params.data.status) {
    rows = rows.filter(i => i.status === params.data.status);
  }

  const result = rows.map(i => formatInvoice(i, clientMap.get(i.clientId)?.name ?? "Inconnu"));
  res.json(result);
});

router.post("/invoices", async (req, res): Promise<void> => {
  const parsed = CreateInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const total = parsed.data.items.reduce((sum, item) => sum + item.total, 0);
  const count = await db.select().from(invoicesTable).then(rows => rows.length);
  const number = `FAC-${String(count + 1).padStart(4, "0")}`;

  const [row] = await db.insert(invoicesTable).values({
    ...parsed.data,
    number,
    total: String(total),
    items: JSON.stringify(parsed.data.items),
  }).returning();

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, parsed.data.clientId));
  res.status(201).json(formatInvoice(row, client?.name ?? "Inconnu"));
});

router.get("/invoices/:id", async (req, res): Promise<void> => {
  const params = GetInvoiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, row.clientId));
  res.json(formatInvoice(row, client?.name ?? "Inconnu"));
});

router.patch("/invoices/:id", async (req, res): Promise<void> => {
  const params = UpdateInvoiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateInvoiceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [row] = await db.update(invoicesTable)
    .set({ status: body.data.status })
    .where(eq(invoicesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, row.clientId));
  res.json(formatInvoice(row, client?.name ?? "Inconnu"));
});

export default router;

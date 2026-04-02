import { pgTable, text, serial, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  clientId: integer("client_id").notNull().references(() => clientsTable.id),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid", "overdue"] }).notNull().default("draft"),
  total: numeric("total", { precision: 15, scale: 2 }).notNull().default("0"),
  items: jsonb("items").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import transactionsRouter from "./transactions";
import invoicesRouter from "./invoices";
import clientsRouter from "./clients";
import expensesRouter from "./expenses";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(transactionsRouter);
router.use(invoicesRouter);
router.use(clientsRouter);
router.use(expensesRouter);
router.use(reportsRouter);

export default router;

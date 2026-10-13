import { TransactionService } from "../modules/transaction/transaction.service";

const EXPIRY_INTERVAL_MS = 5 * 60 * 1000;

export const startTransactionExpiryJob = () => {
  const transactionService = new TransactionService();
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      const expired = await transactionService.expireAllDueTransactions();
      if (expired > 0) {
        console.log(`⏱️ Expired ${expired} unpaid transaction(s)`);
      }
    } catch (error) {
      console.error("Transaction expiry job failed:", error);
    } finally {
      running = false;
    }
  };

  void run();
  return setInterval(run, EXPIRY_INTERVAL_MS);
};

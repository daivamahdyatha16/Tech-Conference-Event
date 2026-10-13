import 'dotenv/config';
import app from './app';
import { startTransactionExpiryJob } from './jobs/transaction-expiry.job';

const PORT = process.env.PORT ?? 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV ?? 'development'}`);
  startTransactionExpiryJob();
});

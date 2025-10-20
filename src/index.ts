import { buildServer } from './server.js';
import { env } from './config/env.js';

const app = buildServer();
const server = app.listen(env.PORT, () => console.log(`API escuchando en :${env.PORT}`));

['SIGINT','SIGTERM'].forEach(sig =>
  process.on(sig as NodeJS.Signals, () => server.close(() => process.exit(0)))
);

import { hostname } from 'os';
import express, { Express } from 'express';
import { createServer } from 'http';
import { middlewares } from './app';
import { config, exitLog } from './shared';
// import { PaystackService } from './modules';
const {
  app: { environment, port },
} = config;

const app: Express = express();

middlewares(app);

const server = createServer(app);

// async function test() {
//   const recipient = await PaystackService.createTransferRecipient({
//     type: 'nuban',
//     name: 'Olusegun Ekoh',
//     account_number: '0609083683',
//     bank_code: '058',
//     currency: 'NGN',
//   });

//   const transfer = await PaystackService.initiateTransfer({
//     source: 'balance',
//     amount: 1000,
//     recipient: recipient.data?.recipient_code,
//     reason: 'withdrawal',
//   });

// console.log({ recipient, transfer });
// }

// test();

process
  .on('SIGINT', () => exitLog(null, 'SIGINT'))
  .on('SIGQUIT', () => exitLog(null, 'SIGQUIT'))
  .on('SIGTERM', () => exitLog(null, 'SIGTERM'))
  .on('uncaughtException', (error) => exitLog(error, 'uncaughtException'))
  .on('beforeExit', () => exitLog(null, 'beforeExit'))
  .on('exit', () => exitLog(null, 'exit'));

server.listen({ port }, (): void => {
  process.stdout.write(`⚙️ Env: ${environment}\n`);
  process.stdout.write(`⏱ Started on: ${Date.now()}\n`);
  process.stdout.write(
    `🚀 demo-credit api running on http://${hostname()}:${port}\n`,
  );
});

export { server };

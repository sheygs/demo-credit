import { Paystack } from 'paystack-sdk';
import { config } from '../config';

const paystack = new Paystack(config.app.payStackApiKey);

export { paystack };

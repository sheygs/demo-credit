import {
  GetTransactionResponse,
  TransactionInitialized,
} from 'paystack-sdk/dist/transaction/interface';
import { BadRequest } from 'paystack-sdk/dist/interface';
import {
  InitializePaymentReq,
  paystack,
  UnprocessableEntityException,
} from '../../shared';

interface TransferRecipientReq {
  type: string; // nuban
  name: string;
  account_number: string;
  bank_code: string; // 058
  currency: string; //NGN
}

interface InitiateTransferReq {
  source: string;
  amount: number;
  recipient: string | undefined;
  reason?: string;
}

class PaystackService {
  static async initializePayment(
    initializePaymentReq: InitializePaymentReq,
  ): Promise<{
    authorization_url: string | undefined;
  }> {
    const { amount, email, currency, wallet_id, user_id } = initializePaymentReq;

    try {
      const initialize: TransactionInitialized | BadRequest =
        await paystack.transaction.initialize({
          amount,
          email,
          currency,
          metadata: {
            amount,
            wallet_id,
            user_id,
            currency,
          },
        });

      if (!initialize.status) {
        throw new UnprocessableEntityException(initialize.message);
      }

      return { authorization_url: initialize.data?.authorization_url };
    } catch (error) {
      throw error;
    }
  }

  static async verifyPaymentTransaction(
    reference: string,
  ): Promise<GetTransactionResponse | BadRequest> {
    try {
      const transaction: GetTransactionResponse | BadRequest =
        await paystack.transaction.verify(reference);

      if (!transaction.status) {
        throw new UnprocessableEntityException(transaction.message);
      }

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async createTransferRecipient(transferRecipient: TransferRecipientReq) {
    const { type, name, account_number, bank_code, currency } = transferRecipient;

    try {
      const recipient = await paystack.recipient.create({
        type,
        name,
        account_number,
        bank_code,
        currency,
      });

      return recipient;
    } catch (error) {
      throw error;
    }
  }

  static async initiateTransfer(initiateTransfer: InitiateTransferReq) {
    const { source, amount, recipient, reason } = initiateTransfer;

    try {
      const transfer = await paystack.transfer.initiate({
        source,
        amount,
        recipient: recipient ?? '',
        reason,
      });

      return transfer;
    } catch (error) {
      throw error;
    }
  }
}

export { PaystackService };

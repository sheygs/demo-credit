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
}

export { PaystackService };

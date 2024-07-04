import {
  Request as Req,
  Response as Res,
  NextFunction as NextFn,
} from 'express';
import { OK } from 'http-status';
import { successResponse } from '../../shared';
import { WalletService } from '../wallet';

class TransferController {
  static async createTransfer(req: Req, res: Res, next: NextFn) {
    try {
      const response = await WalletService.transferToWallet(req.body);

      successResponse(res, OK, 'transfer successful', response);
    } catch (error) {
      next(error);
    }
  }

  static async createWithdrawal(req: Req, res: Res, next: NextFn) {
    try {
      const response = await WalletService.disburseToExternalAccount(req.body);

      successResponse(res, OK, 'withdrawal successful', response);
    } catch (error) {
      next(error);
    }
  }
}

export { TransferController };

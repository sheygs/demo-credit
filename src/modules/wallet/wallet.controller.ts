import { Request as Req, Response as Res, NextFunction as NextFn } from 'express';
import { CREATED, OK } from 'http-status';
import { successResponse } from '../../shared';
import { WalletService } from './wallet.service';
import { WalletType } from './wallet.model';

class WalletController {
  static async createWallet(req: Req, res: Res, next: NextFn) {
    try {
      const wallet = await WalletService.createWallet(req.body);

      successResponse<WalletType>(res, CREATED, 'wallet created', wallet);
    } catch (error) {
      next(error);
    }
  }

  static async fundWallet(req: Req, res: Res, next: NextFn) {
    const {
      body: { amount },
      params: { wallet_id },
    } = req;
    try {
      const wallet = await WalletService.fundWallet(wallet_id, amount);

      successResponse<WalletType>(res, OK, 'wallet funded', wallet);
    } catch (error) {
      next(error);
    }
  }
}

export { WalletController };

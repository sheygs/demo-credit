import { Request as Req, Response as Res, NextFunction as Next } from 'express';
import { WalletModel, WalletType } from '../../modules';
import { NotFoundException, UnauthorizedException } from '../utils';

/**
 * SECURITY MIDDLEWARE: Verify wallet ownership before allowing operations
 *
 * This middleware prevents users from performing operations on wallets they don't own.
 * It checks that the authenticated user (req.user_id) owns the wallet specified in the request.
 *
 * CRITICAL: Without this check, any authenticated user could transfer funds from ANY wallet
 * by simply guessing wallet IDs.
 *
 * Usage:
 *   - Apply to transfer endpoints (checks source_wallet_id)
 *   - Apply to withdrawal endpoints (checks wallet_id)
 *   - Apply to wallet funding endpoints (checks wallet_id)
 */
export const verifyWalletOwnership = async (
  req: Req,
  _: Res,
  next: Next,
): Promise<void> => {
  try {
    const { source_wallet_id, wallet_id } = req.body;

    const paramWalletId = req.params.wallet_id;

    // determine which wallet ID to check
    const walletIdToCheck = source_wallet_id || wallet_id || paramWalletId;

    if (!walletIdToCheck) {
      // If no wallet ID in request, skip this check
      // (validation middleware will catch missing required fields)
      return next();
    }

    // fetch the wallet from database
    const wallet: WalletType = await WalletModel.findById(walletIdToCheck);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // CRITICAL SECURITY CHECK: Verify ownership
    // Compare wallet's user_id with authenticated user's ID
    if (String(wallet.user_id) !== String(req.user_id)) {
      throw new UnauthorizedException(
        'Access denied: You do not own this wallet',
      );
    }

    // Ownership verified - proceed to controller
    next();
  } catch (error) {
    next(error);
  }
};

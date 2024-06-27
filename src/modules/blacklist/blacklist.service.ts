import { axiosInstance, config, BlackListedResponse } from '../../shared';

const {
  app: { blackListApiSecret },
} = config;

class BlackListService {
  static async verifyCustomer(email: string) {
    try {
      const result = await axiosInstance.get<BlackListedResponse>(
        `verification/karma/${email}`,
        blackListApiSecret,
      );

      return result;
    } catch (error: any) {
      throw error;
    }
  }
}

export { BlackListService };

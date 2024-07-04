import { axiosInstance, config, BlackListedResponse } from '../../shared';

const {
  app: { adjutorApiSecret },
} = config;

interface UserIdentity {
  email?: string;
  phone_number?: string;
}

class BlackListService {
  static async verifyCustomerBlackListStatus(payload: UserIdentity) {
    const { email, phone_number } = payload;

    const identity = email ? email : phone_number;

    const endpoint = `verification/karma/${identity}`;

    try {
      const result = await axiosInstance.get<BlackListedResponse>(
        endpoint,
        adjutorApiSecret,
      );

      return result;
    } catch (error: any) {
      throw error;
    }
  }
}

export { BlackListService };

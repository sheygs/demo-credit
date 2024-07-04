import axios from 'axios';
import { config } from '../config';
import { BaseException, logger } from '../utils';

class Axios {
  constructor(private readonly API_BASE_URL: string | undefined) {}

  public async get<T>(endpoint: string, token: string): Promise<T> {
    try {
      const options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `${this.API_BASE_URL}/${endpoint}`,
        options,
      );

      return data;
    } catch (error: any) {
      logger.error(JSON.stringify(error));

      if (error.response?.data) {
        return error.response.data;
      }

      throw new BaseException(
        error.message || error.response?.statusText,
        error.response?.status,
      );
    }
  }
}

export const axiosInstance = new Axios(config.app.baseUrl);

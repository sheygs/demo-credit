import mockAxios from 'jest-mock-axios';
import { BaseException, logger, Axios } from '../src/shared';

jest.mock('../src/shared', () => ({
  BaseException: jest.fn(),
  logger: {
    error: jest.fn(),
  },
}));

describe('Axios', () => {
  const apiBaseUrl = 'https://api.example.com';
  const axiosInstance = new Axios(apiBaseUrl);
  const token = 'test-token';
  const endpoint = 'test-endpoint';

  afterEach(() => {
    mockAxios.reset();
  });

  it('should return data when the request is successful', async () => {
    const responseData = { data: 'test-data' };
    mockAxios.get.mockResolvedValueOnce({ data: responseData });

    const result = await axiosInstance.get(endpoint, token);

    expect(result).toEqual(responseData);
    expect(mockAxios.get).toHaveBeenCalledWith(`${apiBaseUrl}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it('should log error and throw BaseException when the request fails', async () => {
    const errorMessage = 'Request failed';
    const errorResponse = {
      response: {
        data: 'error-data',
        statusText: errorMessage,
        status: 400,
      },
    };
    mockAxios.get.mockRejectedValueOnce(errorResponse);

    await expect(axiosInstance.get(endpoint, token)).rejects.toThrow(
      BaseException,
    );
    expect(logger.error).toHaveBeenCalledWith(JSON.stringify(errorResponse));
    expect(BaseException).toHaveBeenCalledWith(errorMessage, 400);
  });

  it('should log error and return response data when the request fails with a response', async () => {
    const errorResponse = {
      response: {
        data: 'error-data',
        statusText: 'Request failed',
        status: 400,
      },
    };
    mockAxios.get.mockRejectedValueOnce(errorResponse);

    const result = await axiosInstance.get(endpoint, token);

    expect(result).toEqual('error-data');
    expect(logger.error).toHaveBeenCalledWith(JSON.stringify(errorResponse));
  });
});

import { AuthService, UserService, BlackListService } from '../src/modules';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  UnprocessableEntityException,
  SecurityUtils,
} from '../src/shared';
import * as jwt from 'jsonwebtoken';

jest.mock('../src/modules', () => ({
  AuthService: jest.fn(),
  UserService: {
    findUser: jest.fn(),
    create: jest.fn(),
  },
  BlackListService: {
    verifyCustomerBlackListStatus: jest.fn(),
  },
}));

jest.mock('../src/shared', () => ({
  ...jest.requireActual('../src/shared'),
  SecurityUtils: {
    hash: jest.fn(),
  },
  BadRequestException: jest.requireActual('../src/shared').BadRequestException,
  UnauthorizedException:
    jest.requireActual('../src/shared').UnauthorizedException,
  ForbiddenException: jest.requireActual('../src/shared').ForbiddenException,
  UnprocessableEntityException:
    jest.requireActual('../src/shared').UnprocessableEntityException,
}));

jest.mock('jsonwebtoken');

describe('AuthService', () => {
  const mockUser = {
    id: 1,
    user_name: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    phone_number: '1234567890',
  };

  const mockRequest = {
    body: {
      email: 'test@example.com',
      password: 'password123',
      phone_number: '1234567890',
    },
  } as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign up a new user successfully', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(null);
    (
      BlackListService.verifyCustomerBlackListStatus as jest.Mock
    ).mockResolvedValue({
      status: 'SUCCESS',
      data: {},
    });
    (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (UserService.create as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue('token');

    const result = await AuthService.signUp(mockRequest);

    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
    expect(BlackListService.verifyCustomerBlackListStatus).toHaveBeenCalledWith(
      {
        email: mockRequest.body.email,
        phone_number: mockRequest.body.phone_number,
      },
    );
    expect(SecurityUtils.hash).toHaveBeenCalledWith(mockRequest.body.password);
    expect(UserService.create).toHaveBeenCalledWith({
      ...mockRequest.body,
      password: 'hashedpassword',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockUser.id,
        user_name: mockUser.user_name,
        email: mockUser.email,
      },
      expect.any(String),
      { expiresIn: expect.any(String) },
    );
    expect(result).toEqual({
      user: { ...mockUser, password: undefined },
      token: 'token',
    });
  });

  it('should throw an error if the user already exists', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(mockUser);

    await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
      BadRequestException,
    );
    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
  });

  it('should throw an error if the user is blacklisted', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(null);
    (
      BlackListService.verifyCustomerBlackListStatus as jest.Mock
    ).mockResolvedValue({
      status: 'SUCCESS',
      data: { blacklisted: true },
    });

    await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
      ForbiddenException,
    );
    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
    expect(BlackListService.verifyCustomerBlackListStatus).toHaveBeenCalledWith(
      {
        email: mockRequest.body.email,
        phone_number: mockRequest.body.phone_number,
      },
    );
  });

  it('should throw an error if hashing the password fails', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(null);
    (
      BlackListService.verifyCustomerBlackListStatus as jest.Mock
    ).mockResolvedValue({
      status: 'SUCCESS',
      data: {},
    });
    (SecurityUtils.hash as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
      BadRequestException,
    );
    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
    expect(SecurityUtils.hash).toHaveBeenCalledWith(mockRequest.body.password);
  });

  it('should throw an error if user creation fails', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(null);
    (
      BlackListService.verifyCustomerBlackListStatus as jest.Mock
    ).mockResolvedValue({
      status: 'SUCCESS',
      data: {},
    });
    (SecurityUtils.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (UserService.create as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
    expect(SecurityUtils.hash).toHaveBeenCalledWith(mockRequest.body.password);
    expect(UserService.create).toHaveBeenCalledWith({
      ...mockRequest.body,
      password: 'hashedpassword',
    });
  });

  it('should throw an error if blacklist verification fails', async () => {
    (UserService.findUser as jest.Mock).mockResolvedValue(null);
    (
      BlackListService.verifyCustomerBlackListStatus as jest.Mock
    ).mockResolvedValue({
      status: 'ERROR',
      message: 'error message',
    });

    await expect(AuthService.signUp(mockRequest)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(UserService.findUser).toHaveBeenCalledWith(mockRequest.body.email);
    expect(BlackListService.verifyCustomerBlackListStatus).toHaveBeenCalledWith(
      {
        email: mockRequest.body.email,
        phone_number: mockRequest.body.phone_number,
      },
    );
  });
});

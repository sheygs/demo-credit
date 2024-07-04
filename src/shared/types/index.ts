enum Env {
  PRODUCTION = 'production',
  TEST = 'test',
  DEVELOPMENT = 'development',
}

enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

export enum RequestPath {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
}

type AppResponse = {
  name: string;
  version: string;
  ver: string;
  description: string;
  authors: string;
  host: string;
  base_url?: string;
  port: number;
  environment: string;
};

interface ObjectProps {
  [prop: string]: any;
}

type NotFoundError = {
  code: number;
  status: Status;
  message: string;
  path: string;
};

interface NotFoundResponse {
  error: NotFoundError;
}

interface SuccessResponse<T> {
  code: number;
  status: Status;
  message: string;
  data: T | {};
}

interface FailureResponse {
  code: number;
  status: Status;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

type Config = {
  app: {
    name: string;
    version: string;
    description: string;
    author: string;
    baseUrl: string | undefined;
    port: string | number;
    environment: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    saltRounds: string;
    adjutorApiSecret: string;
    payStackApiKey: string;
  };

  database: {
    user: string;
    password: string;
    port: string | number;
    host: string;
    name: string;
  };
};

interface BlackListedResponse {
  status: string;
  message: string;
  data?: Data;
  meta: Meta;
}

interface Data {
  karma_identity: string;
  amount_in_contention: string;
  reason: any;
  default_date: string;
  karma_type: KarmaType;
  karma_identity_type: KarmaIdentityType;
  reporting_entity: ReportingEntity;
}

interface KarmaType {
  karma: string;
}

interface KarmaIdentityType {
  identity_type: string;
}

interface ReportingEntity {
  name: string;
  email: string;
}

export interface Meta {
  cost?: number;
  balance: number;
}

interface InitializePaymentReq {
  amount: string;
  email: string;
  currency: string | undefined;
  wallet_id: string;
  user_id: string;
}

interface FundWalletRequest {
  user_id?: string;
  reference: string;
}

interface TransferRequest {
  source_wallet_id: string;
  destination_wallet_id: string;
  amount: string;
}

interface TransactionRequest {
  source_wallet_id: string;
  destination_wallet_id: string | null;
  amount: string;
  transaction_type: string;
  status: string | null;
}

export {
  Env,
  Status,
  TransactionType,
  AppResponse,
  SuccessResponse,
  FailureResponse,
  NotFoundResponse,
  BlackListedResponse,
  Config,
  ObjectProps,
  InitializePaymentReq,
  FundWalletRequest,
  TransferRequest,
  TransactionRequest,
};

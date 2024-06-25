enum Env {
  PRODUCTION = 'production',
  TEST = 'test',
  DEVELOPMENT = 'development',
}

enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
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
    env: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtToken?: string;
  };

  database: {
    user: string;
    password: string;
    port: string | number;
    host: string;
    name: string;
  };
};

export {
  Env,
  Status,
  AppResponse,
  SuccessResponse,
  FailureResponse,
  NotFoundResponse,
  Config,
};

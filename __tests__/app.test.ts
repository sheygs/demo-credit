import express from 'express';
import { middlewares } from '../src/app';
import { startServer } from '../src/server';
import request from 'supertest';

const expressApp = express();

const appServer = startServer(middlewares(expressApp));

describe('App Health', () => {
  test('should display "okay"', async () => {
    const response = await request(appServer).get('/').expect(200);
    expect(response.body.code).toEqual(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toEqual('okay');
    expect(response.body.data.name).toBe('demo-credit');
    expect(response.body.data.version).toBe('0.0.1');
    expect(response.body.data.description).toBe(
      'Demo Credit is a mobile lending app with wallet functionality for borrowers to receive loans and make repayments.',
    );
  });

  test('should return "Not Found" for invalid routes', async () => {
    const response = await request(appServer).get('/me').expect(404);
    expect(response.body.error.code).toEqual(404);
    expect(response.body.error.status).toBe('failure');
    expect(response.body.error.message).toEqual('Not Found');
  });
});

afterAll(() => {
  appServer.close();
});

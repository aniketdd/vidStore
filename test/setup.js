import supertest from 'supertest';
import chai from 'chai';
import app from '../src/app';

export const { expect } = chai;
export const server = supertest.agent(app);
export const BASE_URL = '/v1';

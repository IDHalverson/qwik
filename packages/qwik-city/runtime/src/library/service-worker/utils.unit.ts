import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { Request as NodeRequest, Response as NodeResponse } from 'node-fetch';
import type { ServiceWorkerBundles } from './types';
import { getCacheToDelete, isBuildRequest, useCache } from './utils';

test('getCacheToDelete, delete bundles no longer possible', () => {
  const buildBundles: ServiceWorkerBundles = {
    'q-abc.js': [],
    'q-def.js': [],
  };
  const cachedUrls = [
    'https://qwik.builder.io/build/q-abc.js',
    'https://qwik.builder.io/build/q-xyz.js',
  ];
  const c = getCacheToDelete(buildBundles, cachedUrls);
  equal(c, ['https://qwik.builder.io/build/q-xyz.js']);
});

test('getCacheToDelete, none to delete', () => {
  const buildBundles: ServiceWorkerBundles = {
    'q-abc.js': [],
    'q-def.js': [],
  };
  const cachedUrls = ['https://qwik.builder.io/build/q-abc.js'];
  const c = getCacheToDelete(buildBundles, cachedUrls);
  equal(c, []);
});

test('isBuildRequest, in buildBundles', () => {
  const buildBundles: ServiceWorkerBundles = {
    'q-abc.js': [],
    'q-def.js': [],
  };
  const pathname = '/build/q-abc.js';
  const c = isBuildRequest(buildBundles, pathname);
  equal(c, true);
});

test('isBuildRequest, not in buildBundles', () => {
  const buildBundles: ServiceWorkerBundles = {
    'q-abc.js': [],
    'q-def.js': [],
  };
  const pathname = '/build/q-xyz.js';
  const c = isBuildRequest(buildBundles, pathname);
  equal(c, false);
});

test('do not useCache, no response', () => {
  const request = mockRequest();
  const response = undefined;
  const c = useCache(request, response);
  equal(c, false);
});

test('do not useCache, response has max-age=0', () => {
  const request = mockRequest();
  const response = mockResponse();
  response.headers.set('cache-control', 'max-age=0');
  const c = useCache(request, response);
  equal(c, false);
});

test('do not useCache, response has no-cache', () => {
  const request = mockRequest();
  const response = mockResponse();
  response.headers.set('cache-control', 'no-cache');
  const c = useCache(request, response);
  equal(c, false);
});

test('do not useCache, request has no-cache', () => {
  const request = mockRequest();
  request.headers.set('cache-control', 'no-cache');
  const response = mockResponse();
  const c = useCache(request, response);
  equal(c, false);
});

test('useCache', () => {
  const request = mockRequest();
  const response = mockResponse();
  const c = useCache(request, response);
  equal(c, true);
});

test.run();

export function mockRequest(url?: string): Request {
  url = url || 'https://qwik.builder.io/';
  return new NodeRequest(url) as any;
}

export function mockResponse(body?: any): Response {
  return new NodeResponse(body) as any;
}

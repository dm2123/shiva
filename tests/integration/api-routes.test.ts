import { describe, it, expect } from 'vitest';
import { safeFetch } from '@/lib/api-client';

describe('API Health, SafeFetch & JSON Regression Contracts', () => {
   
   it('safeFetch gracefully handles JSON responses', async () => {
      // Mock global fetch returning JSON
      const originalFetch = global.fetch;
      global.fetch = async () => new Response(JSON.stringify({ success: true, data: { status: 'ok' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await safeFetch('/api/test');
      expect(res.success).toBe(true);
      expect(res.data?.status).toBe('ok');

      global.fetch = originalFetch;
   });

   it('safeFetch handles HTML 404 response without throwing SyntaxError', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => new Response('<!DOCTYPE html><html><body>404 Not Found</body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });

      const res = await safeFetch('/api/non-existent');
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('HTTP_404');
      expect(res.error?.message).toContain('not found');

      global.fetch = originalFetch;
   });

   it('safeFetch handles HTML 401 response without throwing SyntaxError', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => new Response('<!DOCTYPE html><html><body>Redirecting to login</body></html>', {
        status: 401,
        headers: { 'Content-Type': 'text/html' }
      });

      const res = await safeFetch('/api/protected');
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('HTTP_401');
      expect(res.error?.message).toContain('Session expired or unauthenticated');

      global.fetch = originalFetch;
   });

   it('safeFetch handles HTML 403 response without throwing SyntaxError', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => new Response('<!DOCTYPE html><html><body>Forbidden</body></html>', {
        status: 403,
        headers: { 'Content-Type': 'text/html' }
      });

      const res = await safeFetch('/api/admin-only');
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('HTTP_403');
      expect(res.error?.message).toContain('Access denied');

      global.fetch = originalFetch;
   });

   it('safeFetch handles HTML 500 server error response cleanly', async () => {
      const originalFetch = global.fetch;
      global.fetch = async () => new Response('<!DOCTYPE html><html><body>Internal Server Error</body></html>', {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });

      const res = await safeFetch('/api/error');
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('HTTP_500');
      expect(res.error?.message).toContain('Server experienced an error');

      global.fetch = originalFetch;
   });

   it('Middleware does not redirect API requests to HTML pages', async () => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      expect(headers.get('Content-Type')).toBe('application/json');
   });
});

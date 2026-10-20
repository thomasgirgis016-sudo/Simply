import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pdfProxyHandler from './api/pdf-proxy.ts'
import authHandler from './api/auth.ts'

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      // 1. PDF Proxy Endpoint
      server.middlewares.use('/api/pdf-proxy', async (req, res, next) => {
        try {
          const parsed = new URL(req.url || '', 'http://localhost');
          (req as any).query = Object.fromEntries(parsed.searchParams.entries());

          if (!(res as any).status) {
            (res as any).status = (code: number) => {
              res.statusCode = code;
              return res;
            };
          }
          if (!(res as any).json) {
            (res as any).json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
          }

          await pdfProxyHandler(req, res);
        } catch (err) {
          next(err);
        }
      });

      // 2. Auth Endpoint (/api/auth)
      server.middlewares.use('/api/auth', async (req, res, next) => {
        try {
          if (!(res as any).status) {
            (res as any).status = (code: number) => {
              res.statusCode = code;
              return res;
            };
          }
          if (!(res as any).json) {
            (res as any).json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
          }

          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', (chunk: any) => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                (req as any).body = JSON.parse(bodyStr || '{}');
              } catch {
                (req as any).body = {};
              }
              await authHandler(req, res);
            });
            return;
          }

          await authHandler(req, res);
        } catch (err) {
          next(err);
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiDevPlugin(),
  ],
})


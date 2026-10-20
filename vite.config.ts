import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pdfProxyHandler from './api/pdf-proxy.ts'


function pdfProxyDevPlugin(): Plugin {
  return {
    name: 'pdf-proxy-dev-server',
    configureServer(server) {
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
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pdfProxyDevPlugin(),
  ],
})


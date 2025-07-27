import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [react(), tailwindcss(), svgr()],
        //TODO remove proxy after deploy if using vercel functions
        server: {
            proxy: {
                '/api': {
                    target: isProduction
                        ? 'https://bytetogether.onrender.com'
                        : 'http://localhost:3000',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    };
});

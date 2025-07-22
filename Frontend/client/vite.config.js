import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // 👇 Load environment variables from /src/.env
  const env = loadEnv(mode, './src');

  return {
    plugins: [
      tailwindcss(),
      react()
    ],

    define: {
      // Makes `import.meta.env.VITE_...` available
      'import.meta.env': {
        ...env
      }
      
    }
    
  };
});

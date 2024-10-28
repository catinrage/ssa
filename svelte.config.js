import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'svelte-adapter-bun';

/** @type {import('@sveltejs/kit').Config}*/
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      out: 'build',
      assets: 'static',
    }),
    alias: {
      $prisma: './prisma/client.ts',
      $ui: './src/lib/ui',
      $components: './src/lib/ui/components',
      '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
    },
    csrf: false,
  },
};
export default config;

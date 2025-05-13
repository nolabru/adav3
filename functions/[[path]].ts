import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

export const onRequest: PagesFunction = async (context) => {
  // Use a try-catch block to handle potential import errors
  let serverBuild: ServerBuild;
  
  try {
    serverBuild = (await import('../build/server')) as unknown as ServerBuild;
  } catch (error) {
    console.error('Error importing server build:', error);
    return new Response('Server build not found. Please run "pnpm run build" first.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const handler = createPagesFunctionHandler({
    build: serverBuild,
  });

  return handler(context);
};

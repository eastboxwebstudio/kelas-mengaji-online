// This file is deprecated. Please use functions/api/index.ts
// Routing conflict resolution: /api/index.ts is preferred for directory structure.
export const onRequest = async () => {
  return new Response(null, { status: 404 });
};
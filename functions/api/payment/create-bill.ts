// DEPRECATED: This app now uses Google Sheets as backend.
// Please refer to index.tsx for client-side logic.
export const onRequestPost = async () => {
  return new Response(JSON.stringify({ error: "API endpoint deprecated. Please use Google Sheets backend." }), { status: 410 });
};
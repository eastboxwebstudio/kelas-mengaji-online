// DEPRECATED: This app now uses Google Sheets as backend.
export const onRequestPost = async () => {
  return new Response("Webhook endpoint deprecated.", { status: 410 });
};
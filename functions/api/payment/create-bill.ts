
import { createClient } from '@supabase/supabase-js';

interface Env {
  VITE_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  // TOYYIBPAY vars are removed from Env as they are now in DB
  TOYYIBPAY_URL: string; // URL remains static or env var as it rarely changes
}

// Define PagesFunction locally
type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: Record<string, any>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { enrollmentId, name, email, phone, amount, title } = body;

    if (!enrollmentId || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      env.VITE_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Fetch ToyyibPay Settings from Database
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .in('key', ['toyyibpay_secret_key', 'toyyibpay_category_code']);

    if (settingsError || !settingsData) {
      console.error('Settings Error:', settingsError);
      return new Response(JSON.stringify({ error: 'System configuration error' }), { status: 500 });
    }

    // Convert array to object map
    const settingsMap = settingsData.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const secretKey = settingsMap['toyyibpay_secret_key'];
    const categoryCode = settingsMap['toyyibpay_category_code'];

    if (!secretKey || !categoryCode) {
      return new Response(JSON.stringify({ error: 'Payment gateway not configured by Admin' }), { status: 500 });
    }

    // 3. Prepare data for ToyyibPay
    const billAmount = Math.round(parseFloat(amount) * 100);
    const toyyibPayUrl = env.TOYYIBPAY_URL || "https://dev.toyyibpay.com";

    const formData = new FormData();
    formData.append('userSecretKey', secretKey);
    formData.append('categoryCode', categoryCode);
    formData.append('billName', `Yuran: ${title}`);
    formData.append('billDescription', `Pembayaran untuk kelas ${title}. ID Pendaftaran: ${enrollmentId}`);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', billAmount.toString());
    formData.append('billReturnUrl', new URL(request.url).origin + '/student?status=success');
    formData.append('billCallbackUrl', new URL(request.url).origin + '/api/payment/webhook');
    formData.append('billExternalReferenceNo', enrollmentId);
    formData.append('billTo', name);
    formData.append('billEmail', email);
    formData.append('billPhone', phone || '0123456789');

    // 4. Call ToyyibPay API
    const response = await fetch(`${toyyibPayUrl}/index.php/api/createBill`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as any;

    if (Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = `${toyyibPayUrl}/${billCode}`;
      
      return new Response(JSON.stringify({ paymentUrl, billCode }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
        console.error("ToyyibPay Error:", data);
        return new Response(JSON.stringify({ error: 'Failed to create bill with ToyyibPay', details: data }), { status: 500 });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

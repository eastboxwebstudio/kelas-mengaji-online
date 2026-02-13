import { createClient } from '@supabase/supabase-js';

interface Env {
  TOYYIBPAY_SECRET_KEY: string;
  VITE_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Fix: Removed missing PagesFunction type and used any for context to avoid type errors
export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { billCode, enrollmentId } = body;

    if (!billCode || !enrollmentId) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    // 1. Check Bill Status with ToyyibPay
    const formData = new FormData();
    formData.append('userSecretKey', env.TOYYIBPAY_SECRET_KEY);
    formData.append('billCode', billCode);

    const tpResponse = await fetch('https://toyyibpay.com/index.php/api/getBillTransactions', {
      method: 'POST',
      body: formData
    });

    const tpData = await tpResponse.json() as any;

    // ToyyibPay returns array. Empty array means no transactions found yet.
    // Status '1' means successful payment. '2' is pending. '3' is fail.
    const isPaid = Array.isArray(tpData) && tpData.length > 0 && tpData[0].billpaymentStatus === '1';

    if (isPaid) {
      // 2. Initialize Supabase Admin Client
      const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

      // 3. Update Enrollment Status
      const { error } = await supabaseAdmin
        .from('enrollments')
        .update({ 
          status: 'Paid',
          bill_code: billCode 
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, status: 'Paid' }), { headers: { "Content-Type": "application/json" } });
    } else {
      return new Response(JSON.stringify({ success: false, status: 'Unpaid', details: tpData }), { headers: { "Content-Type": "application/json" } });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
interface Env {
  TOYYIBPAY_SECRET_KEY: string;
  TOYYIBPAY_CATEGORY_CODE: string;
}

// Fix: Removed missing PagesFunction type and used any for context to avoid type errors
export const onRequestPost = async (context: any) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;

    const { 
      enrollmentId, 
      name, 
      email, 
      phone, 
      title, 
      price 
    } = body;

    if (!env.TOYYIBPAY_SECRET_KEY || !env.TOYYIBPAY_CATEGORY_CODE) {
      return new Response(JSON.stringify({ error: "Server misconfiguration: Missing ToyyibPay keys" }), { status: 500 });
    }

    // ToyyibPay uses price in CENTS (RM1 = 100)
    const priceInCents = Math.round(parseFloat(price) * 100);
    
    // Construct Return URL (Where ToyyibPay redirects back to)
    const url = new URL(request.url);
    const returnUrl = `${url.protocol}//${url.host}/?payment_verify=true&enrollment_id=${enrollmentId}`;

    const formData = new FormData();
    formData.append('userSecretKey', env.TOYYIBPAY_SECRET_KEY);
    formData.append('categoryCode', env.TOYYIBPAY_CATEGORY_CODE);
    formData.append('billName', `Yuran: ${title}`);
    formData.append('billDescription', `Pembayaran untuk enrollment ID: ${enrollmentId}`);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', priceInCents.toString());
    formData.append('billReturnUrl', returnUrl);
    formData.append('billCallbackUrl', returnUrl); // In production, use a dedicated backend callback URL
    formData.append('billTo', name);
    formData.append('billEmail', email);
    formData.append('billPhone', phone || '0123456789');
    formData.append('billSplitPayment', '0');
    formData.append('billPaymentChannel', '0');
    formData.append('billContentEmail', 'Terima kasih kerana mendaftar dengan CelikKalam.');
    formData.append('billChargeToCustomer', '1');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as any; // ToyyibPay returns an array usually

    // ToyyibPay returns an array containing the bill code in the first object usually
    // Example success: [{"BillCode":"abcdefg"}]
    if (Array.isArray(data) && data[0]?.BillCode) {
      return new Response(JSON.stringify({ billCode: data[0].BillCode }), { 
        headers: { "Content-Type": "application/json" } 
      });
    } else {
        // Handle error response from ToyyibPay
        return new Response(JSON.stringify({ error: "Gagal menjana bill ToyyibPay", details: data }), { status: 400 });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
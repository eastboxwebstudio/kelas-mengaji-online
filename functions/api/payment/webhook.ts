
import { createClient } from '@supabase/supabase-js';

interface Env {
  VITE_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Define PagesFunction locally to fix missing type error
type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: Record<string, any>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    
    const refno = formData.get('refno') as string; // Check reference no
    const status = formData.get('status') as string; // 1 = success, 3 = fail/pending
    const reason = formData.get('reason') as string;
    const billcode = formData.get('billcode') as string;
    const enrollmentId = formData.get('order_id') || formData.get('billExternalReferenceNo') as string;

    console.log(`Webhook Received: Bill ${billcode}, Status ${status}, Ref ${refno}, Enrollment ${enrollmentId}`);

    // Status '1' means successful payment in ToyyibPay
    if (status === '1' && enrollmentId) {
      
      // Initialize Supabase with SERVICE ROLE KEY to bypass RLS policies
      // RLS usually prevents 'anon' users from updating payment status
      const supabaseAdmin = createClient(
        env.VITE_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error } = await supabaseAdmin
        .from('enrollments')
        .update({ 
            status: 'Paid',
            transaction_id: refno,
            bill_code: billcode
        })
        .eq('id', enrollmentId);

      if (error) {
        console.error('Supabase Update Error:', error);
        return new Response('Database Update Failed', { status: 500 });
      }

      return new Response('OK', { status: 200 });
    } else {
        console.log('Payment not successful or missing ID');
        return new Response('Ignored', { status: 200 });
    }

  } catch (err) {
    console.error('Webhook Error:', err);
    return new Response('Server Error', { status: 500 });
  }
};
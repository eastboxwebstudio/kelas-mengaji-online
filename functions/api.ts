interface Env {
  DB: any;
}

export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // CORS Headers untuk membenarkan akses dari frontend
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle Preflight Request (untuk browser check)
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let action = url.searchParams.get("action");
  let payload: any = {};

  // Parse body jika POST request
  if (request.method === "POST") {
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
          payload = JSON.parse(text);
      }
      // Action boleh berada dalam URL query atau JSON body
      action = payload.action || action;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }
  } else {
    // Ambil query params untuk GET request
    url.searchParams.forEach((value, key) => {
      payload[key] = value;
    });
  }

  if (!action) {
    return new Response(JSON.stringify({ error: "Action parameter is required" }), { 
      status: 400, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }

  try {
    const db = env.DB;
    if (!db) {
       throw new Error("Database binding (DB) not found. Check wrangler.json");
    }

    let result = {};

    switch (action) {
      case "getData":
        // Dapatkan semua data yang diperlukan untuk paparan awal
        const classes = await db.prepare("SELECT * FROM classes WHERE isActive = 1 ORDER BY created_at DESC").all();
        const enrollments = await db.prepare("SELECT * FROM enrollments ORDER BY created_at DESC").all();
        // Hati-hati dengan data pengguna, hanya ambil field yang perlu
        const users = await db.prepare("SELECT id, name, email, role, phone FROM users").all();
        
        result = {
          classes: classes.results || [],
          enrollments: enrollments.results || [],
          users: users.results || []
        };
        break;

      case "login":
        const { email, password } = payload;
        // Nota: Dalam production sebenar, password perlu di-hash!
        const user = await db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(email, password).first();
        
        if (user) {
          result = { user: user, status: "success" };
        } else {
          result = { error: "Emel atau kata laluan salah.", status: "error" };
        }
        break;

      case "register":
        const newId = crypto.randomUUID();
        const { name, email: regEmail, password: regPassword, role, phone } = payload;
        
        const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(regEmail).first();
        if (existing) {
           return new Response(JSON.stringify({ error: "Emel telah didaftarkan." }), { 
               status: 400,
               headers: { "Content-Type": "application/json", ...corsHeaders }
           });
        }

        // Default role is student unless specified
        const userRole = role || 'student';

        await db.prepare(
          "INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(newId, name, regEmail, regPassword, userRole, phone).run();

        const newUser = await db.prepare("SELECT * FROM users WHERE id = ?").bind(newId).first();
        result = { user: newUser, status: "success" };
        break;

      case "createClass":
        const classId = crypto.randomUUID();
        const { title: cTitle, description, schedule, price, googleMeetLink, type, instructorId, instructorName } = payload;
        
        await db.prepare(
          "INSERT INTO classes (id, title, description, schedule, price, googleMeetLink, type, instructorId, instructorName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(classId, cTitle, description, schedule, price, googleMeetLink, type || 'monthly', instructorId, instructorName).run();
        
        result = { status: "success", id: classId };
        break;

      case "enroll":
        const enrollId = crypto.randomUUID();
        const { userId, classId: enrollClassId } = payload;
        
        // Check if already enrolled
        const existingEnroll = await db.prepare("SELECT id FROM enrollments WHERE userId = ? AND classId = ?").bind(userId, enrollClassId).first();
        if (existingEnroll) {
             return new Response(JSON.stringify({ error: "Anda sudah mendaftar kelas ini." }), { 
               status: 400,
               headers: { "Content-Type": "application/json", ...corsHeaders }
           });
        }

        await db.prepare(
          "INSERT INTO enrollments (id, userId, classId, status) VALUES (?, ?, ?, 'Unpaid')"
        ).bind(enrollId, userId, enrollClassId).run();
        
        result = { status: "success", id: enrollId };
        break;

      case "pay":
        const { enrollId: payEnrollId } = payload;
        await db.prepare("UPDATE enrollments SET status = 'Paid' WHERE id = ?").bind(payEnrollId).run();
        result = { status: "success" };
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action: " + action }), { 
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }
};
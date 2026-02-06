interface Env {
  DB: any;
}

export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let action = url.searchParams.get("action");
  let payload: any = {};

  if (request.method === "POST") {
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
          payload = JSON.parse(text);
      }
      action = payload.action || action;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }
  } else {
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
        try {
            const classes = await db.prepare("SELECT * FROM classes WHERE isActive = 1 ORDER BY created_at DESC").all();
            const enrollments = await db.prepare("SELECT * FROM enrollments ORDER BY created_at DESC").all();
            const users = await db.prepare("SELECT id, name, email, role, phone FROM users").all();
            
            result = {
              classes: classes.results || [],
              enrollments: enrollments.results || [],
              users: users.results || []
            };
        } catch (dbError: any) {
            // Check specifically for missing table error to give a helpful hint
            if (dbError.message && dbError.message.includes("no such table")) {
                throw new Error("Database belum siap setup. Sila jalankan: npx wrangler d1 execute celikkalam-db --file=./schema.sql --remote");
            }
            throw dbError;
        }
        break;

      case "login":
        const { email, password } = payload;
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
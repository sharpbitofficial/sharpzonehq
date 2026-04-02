import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const findUserIdByEmail = async (serviceClient: ReturnType<typeof createClient>, email: string) => {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage });

    if (error) throw error;

    const match = data.users.find((entry) => entry.email?.toLowerCase() === normalizedEmail);
    if (match) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { data: callerRoles, error: callerRoleError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (callerRoleError) throw callerRoleError;

    const isCeo = callerRoles?.some((entry) => entry.role === "ceo");
    if (!isCeo) {
      return json({ error: "Only the CEO can approve employee applications." }, 403);
    }

    const { applicationId, action } = await req.json();

    if (!applicationId || !["approved", "rejected"].includes(action)) {
      return json({ error: "Invalid request payload." }, 400);
    }

    const { data: application, error: applicationError } = await serviceClient
      .from("employee_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return json({ error: "Application not found." }, 404);
    }

    const reviewedAt = new Date().toISOString();

    const { error: updateError } = await serviceClient
      .from("employee_applications")
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: reviewedAt,
      })
      .eq("id", applicationId);

    if (updateError) throw updateError;

    if (action === "rejected") {
      return json({ success: true, employeeLinked: false });
    }

    const employeeUserId = await findUserIdByEmail(serviceClient, application.email);

    if (!employeeUserId) {
      return json({ success: true, employeeLinked: false });
    }

    const { data: existingStaffRole, error: existingStaffRoleError } = await serviceClient
      .from("user_roles")
      .select("id")
      .eq("user_id", employeeUserId)
      .eq("role", "staff")
      .maybeSingle();

    if (existingStaffRoleError) throw existingStaffRoleError;

    if (!existingStaffRole) {
      const { error: roleInsertError } = await serviceClient.from("user_roles").insert({
        user_id: employeeUserId,
        role: "staff",
      });

      if (roleInsertError) throw roleInsertError;
    }

    await serviceClient.from("notifications").insert({
      user_id: employeeUserId,
      title: "✅ Employee application approved",
      message: "Your SharpZone employee account has been approved. You can now sign in to the employee dashboard.",
    });

    return json({ success: true, employeeLinked: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, 500);
  }
});
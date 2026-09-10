import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase server environment variables are missing"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณากรอกชื่อ-นามสกุล",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin =
      getAdminClient();

    // =====================================================
    // ค้นหาสมาชิกด้วยชื่อ
    // ใช้ Service Role ฝั่ง Server
    // =====================================================

    const {
      data: members,
      error: memberError,
    } = await supabaseAdmin
      .from("members")
      .select(
        "id,name,position,branch,department,auth_email,auth_user_id"
      )
      .eq("name", name)
      .limit(2);

    if (memberError) {
      console.error(
        "Login member lookup error:",
        memberError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถตรวจสอบข้อมูลสมาชิกได้",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // ไม่พบสมาชิก
    // =====================================================

    if (!members || members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบสมาชิกชื่อนี้ในระบบ",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // พบชื่อซ้ำ
    // =====================================================

    if (members.length > 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "พบสมาชิกชื่อนี้มากกว่า 1 บัญชี กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 409 }
      );
    }

    const member = members[0];

    // =====================================================
    // ตรวจสอบว่าบัญชีเชื่อม Supabase Auth แล้ว
    // =====================================================

    if (
      !member.auth_email ||
      !member.auth_user_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "บัญชีนี้ยังไม่ได้เชื่อมระบบรักษาความปลอดภัย กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // ส่งข้อมูลที่จำเป็นกลับไปให้ Browser
    //
    // ไม่ส่ง password
    // ไม่ส่ง service role key
    // =====================================================

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        position: member.position,
        branch: member.branch,
        department: member.department,
        auth_user_id:
          member.auth_user_id,
      },
      auth_email:
        member.auth_email,
    });
  } catch (error) {
    console.error(
      "Login API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }
}
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

    const position =
      typeof body.position === "string"
        ? body.position.trim()
        : "";

    const branch =
      typeof body.branch === "string"
        ? body.branch.trim()
        : "";

    const department =
      typeof body.department === "string"
        ? body.department.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // =====================================================
    // ตรวจสอบข้อมูล
    // =====================================================

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

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาเลือกตำแหน่ง",
        },
        { status: 400 }
      );
    }

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาเลือกสาขา",
        },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาเลือกฝ่าย",
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin =
      getAdminClient();

    // =====================================================
    // ตรวจชื่อซ้ำ + สาขาซ้ำ
    // =====================================================

    const {
      data: existingMembers,
      error: duplicateError,
    } = await supabaseAdmin
      .from("members")
      .select("id,name,branch")
      .eq("name", name)
      .eq("branch", branch)
      .limit(1);

    if (duplicateError) {
      console.error(
        "Duplicate check error:",
        duplicateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถตรวจสอบสมาชิกได้",
        },
        { status: 500 }
      );
    }

    if (
      existingMembers &&
      existingMembers.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "มีสมาชิกชื่อนี้ในสาขานี้แล้ว",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // สร้าง Member ID
    // =====================================================

    const memberId =
      crypto.randomUUID();

    // =====================================================
    // สร้าง Email ภายในสำหรับ Supabase Auth
    // =====================================================

    const authEmail =
      `member-${memberId}@login.warithep-learning.internal`;

    // =====================================================
    // 1. สร้างสมาชิก
    //
    // สำคัญ:
    // ไม่เขียน password ลง members แล้ว
    // =====================================================

    const {
      data: newMember,
      error: memberInsertError,
    } = await supabaseAdmin
      .from("members")
      .insert({
        id: memberId,
        name,
        position,
        branch,
        department,
        auth_email: authEmail,
        role: "member",
      })
      .select(
        "id,name,position,branch,department,auth_email,auth_user_id,role"
      )
      .single();

    if (memberInsertError) {
      console.error(
        "Member insert error:",
        memberInsertError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถสร้างสมาชิกได้",
          detail:
            memberInsertError.message,
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 2. สร้าง Supabase Auth User
    // =====================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email: authEmail,
          password,
          email_confirm: true,

          user_metadata: {
            member_id: memberId,
            name,
            position,
            branch,
            department,
          },
        }
      );

    if (
      authError ||
      !authData.user
    ) {
      console.error(
        "Auth user creation error:",
        authError
      );

      // ลบ Member ที่สร้างไว้
      await supabaseAdmin
        .from("members")
        .delete()
        .eq("id", memberId);

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถสร้างบัญชีเข้าสู่ระบบได้",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 3. เชื่อม Auth User กับ Member
    // =====================================================

    const {
      data: linkedMember,
      error: linkError,
    } = await supabaseAdmin
      .from("members")
      .update({
        auth_user_id:
          authData.user.id,
      })
      .eq("id", memberId)
      .select(
        "id,name,position,branch,department,auth_email,auth_user_id,role"
      )
      .single();

    if (
      linkError ||
      !linkedMember
    ) {
      console.error(
        "Auth link error:",
        linkError
      );

      // ลบ Auth User
      await supabaseAdmin.auth.admin.deleteUser(
        authData.user.id
      );

      // ลบ Member
      await supabaseAdmin
        .from("members")
        .delete()
        .eq("id", memberId);

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่สามารถเชื่อมบัญชีสมาชิกได้",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // สำเร็จ
    // =====================================================

    return NextResponse.json({
      success: true,

      member: linkedMember,

      auth_email: authEmail,
    });
  } catch (error) {
    console.error(
      "Register API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }
}
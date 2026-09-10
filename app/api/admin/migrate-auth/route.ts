import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * สร้าง email ภายในสำหรับสมาชิกเดิม
 *
 * ใช้สำหรับการย้ายระบบจาก
 * name + password
 * ไปเป็น Supabase Auth
 *
 * สมาชิกยังสามารถล็อกอินด้วย "ชื่อ + รหัสผ่าน"
 * ผ่านหน้าเว็บเดิมได้
 */
function makeAuthEmail(memberId: string) {
  return `member-${memberId}@login.warithep-learning.internal`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const migrationToken = body?.token;
    const expectedToken = process.env.AUTH_MIGRATION_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ยังไม่ได้ตั้ง AUTH_MIGRATION_TOKEN ใน .env.local",
        },
        { status: 500 }
      );
    }

    if (migrationToken !== expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Migration token ไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminClient();

    const { data: members, error: membersError } = await supabaseAdmin
      .from("members")
      .select(
        "id, name, position, branch, department, password, auth_user_id, auth_email"
      )
      .order("created_at", { ascending: true });

    if (membersError) {
      throw new Error(membersError.message);
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: "ไม่พบสมาชิกในตาราง members",
        results: [],
      });
    }

    const results: Array<{
      name: string;
      status: string;
      email?: string;
      error?: string;
    }> = [];

    for (const member of members) {
      try {
        // ถ้าย้ายไปแล้ว ไม่ทำซ้ำ
        if (member.auth_user_id && member.auth_email) {
          results.push({
            name: member.name,
            status: "already_migrated",
            email: member.auth_email,
          });

          continue;
        }

        if (!member.password) {
          results.push({
            name: member.name,
            status: "skipped_no_password",
            error: "สมาชิกไม่มี password",
          });

          continue;
        }

        const email =
          member.auth_email || makeAuthEmail(member.id);

        // สร้าง Supabase Auth User
        const { data: authData, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: member.password,
            email_confirm: true,
            user_metadata: {
              member_id: member.id,
              name: member.name,
              position: member.position,
              branch: member.branch,
              department: member.department,
            },
          });

        if (createError) {
          // ถ้า Auth user มีอยู่แล้ว ให้ค้นหาและเชื่อมต่อ
          if (
            createError.message
              .toLowerCase()
              .includes("already")
          ) {
            let existingUserId: string | null = null;

            let page = 1;
            const perPage = 1000;

            while (!existingUserId) {
              const {
                data: usersData,
                error: usersError,
              } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage,
              });

              if (usersError) {
                throw new Error(usersError.message);
              }

              const found = usersData.users.find(
                (user) => user.email === email
              );

              if (found) {
                existingUserId = found.id;
                break;
              }

              if (
                usersData.users.length < perPage
              ) {
                break;
              }

              page++;
            }

            if (!existingUserId) {
              throw new Error(
                "พบ email ซ้ำใน Auth แต่ค้นหา User ไม่เจอ"
              );
            }

            const { error: updateExistingError } =
              await supabaseAdmin
                .from("members")
                .update({
                  auth_user_id: existingUserId,
                  auth_email: email,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", member.id);

            if (updateExistingError) {
              throw new Error(
                updateExistingError.message
              );
            }

            results.push({
              name: member.name,
              status: "linked_existing_auth",
              email,
            });

            continue;
          }

          throw new Error(createError.message);
        }

        if (!authData.user) {
          throw new Error(
            "Supabase Auth ไม่ได้ส่ง user กลับมา"
          );
        }

        // เชื่อม Auth User เข้ากับสมาชิกเดิม
        const { error: updateError } =
          await supabaseAdmin
            .from("members")
            .update({
              auth_user_id: authData.user.id,
              auth_email: email,
              updated_at: new Date().toISOString(),
            })
            .eq("id", member.id);

        if (updateError) {
          // ถ้าเชื่อมไม่ได้ ให้ลบ Auth User ที่เพิ่งสร้าง
          await supabaseAdmin.auth.admin.deleteUser(
            authData.user.id
          );

          throw new Error(updateError.message);
        }

        results.push({
          name: member.name,
          status: "migrated",
          email,
        });
      } catch (memberError) {
        results.push({
          name: member.name,
          status: "error",
          error:
            memberError instanceof Error
              ? memberError.message
              : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        });
      }
    }

    const migrated = results.filter(
      (item) =>
        item.status === "migrated" ||
        item.status === "linked_existing_auth" ||
        item.status === "already_migrated"
    ).length;

    const errors = results.filter(
      (item) => item.status === "error"
    ).length;

    return NextResponse.json({
      success: errors === 0,
      total: members.length,
      migrated,
      errors,
      results,
    });
  } catch (error) {
    console.error("AUTH MIGRATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
      },
      { status: 500 }
    );
  }
}
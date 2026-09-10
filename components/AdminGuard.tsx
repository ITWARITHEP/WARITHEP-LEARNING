"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminGuardProps = {
  children: React.ReactNode;
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        // =====================================================
        // ตรวจสอบ Supabase Auth
        // =====================================================

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // =====================================================
        // หา Member ที่ผูกกับ Auth User
        // =====================================================

        const { data: member, error } =
          await supabase
            .from("members")
            .select(
              "id,name,position,branch,department,role,auth_user_id"
            )
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (error) {
          console.error(
            "ตรวจสอบสิทธิ์ Admin ไม่สำเร็จ:",
            error
          );

          router.replace("/dashboard");
          return;
        }

        // =====================================================
        // ไม่มีข้อมูลสมาชิก
        // =====================================================

        if (!member) {
          router.replace("/dashboard");
          return;
        }

        // =====================================================
        // ตรวจสอบ Role
        // =====================================================

        if (member.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        // =====================================================
        // ผ่านการตรวจสอบ
        // =====================================================

        if (mounted) {
          setAllowed(true);
          setChecking(false);
        }
      } catch (error) {
        console.error(
          "AdminGuard Error:",
          error
        );

        router.replace("/dashboard");
      }
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  // =========================================================
  // กำลังตรวจสอบสิทธิ์
  // =========================================================

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fd] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            🔐
          </div>

          <h1 className="mt-5 text-lg font-black text-slate-900">
            กำลังตรวจสอบสิทธิ์
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            กรุณารอสักครู่...
          </p>

          <div className="mt-5 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>

        </div>
      </main>
    );
  }

  // =========================================================
  // ไม่มีสิทธิ์
  // =========================================================

  if (!allowed) {
    return null;
  }

  // =========================================================
  // Admin ผ่าน
  // =========================================================

  return <>{children}</>;
}
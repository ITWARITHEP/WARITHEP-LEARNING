
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name: string;
  position: string;
  branch: string;
  department: string;
  auth_user_id: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();

    if (!cleanName) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // 1. ล้างข้อมูลสมาชิกเดิม
      localStorage.removeItem("warithep_learning_member");
      localStorage.removeItem("warithep_learning_member_id");
      localStorage.removeItem("warithep_learning_login_name");

      // 2. ค้นหาสมาชิกผ่าน API ฝั่ง Server
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message ||
            "ไม่สามารถตรวจสอบข้อมูลสมาชิกได้"
        );
        return;
      }

      const member = result.member as Member | undefined;
      const authEmail = result.auth_email as string | undefined;

      if (!member || !authEmail || !member.auth_user_id) {
        setError(
          "ข้อมูลบัญชีสมาชิกไม่ครบถ้วน กรุณาติดต่อผู้ดูแลระบบ"
        );
        return;
      }

      // 3. ตรวจสอบรหัสผ่านด้วย Supabase Auth
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (authError || !authData.user) {
        console.error("SUPABASE AUTH ERROR:", authError);
        setError("ชื่อ-นามสกุล หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      // 4. ตรวจสอบว่า Auth เป็นบัญชีของสมาชิกคนนี้
      if (authData.user.id !== member.auth_user_id) {
        await supabase.auth.signOut();

        setError(
          "ข้อมูลบัญชีไม่ตรงกัน กรุณาติดต่อผู้ดูแลระบบ"
        );
        return;
      }

      // 5. บันทึกข้อมูลสมาชิก โดยไม่เก็บรหัสผ่าน
      const memberSession = {
        id: member.id,
        name: member.name,
        position: member.position,
        branch: member.branch,
        department: member.department,
        auth_user_id: member.auth_user_id,
      };

      localStorage.setItem(
        "warithep_learning_member",
        JSON.stringify(memberSession)
      );

      localStorage.setItem(
        "warithep_learning_member_id",
        member.id
      );

      localStorage.setItem(
        "warithep_learning_login_name",
        member.name
      );

      // 6. เข้าสู่ Dashboard
      router.replace("/dashboard");
    } catch (err) {
      console.error("LOGIN EXCEPTION:", err);

      setError(
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
              🎓
            </div>

            <div>
              <div className="font-black text-slate-900">
                วารีเทพ
              </div>
              <div className="text-xs font-bold tracking-widest text-blue-600">
                LEARNING
              </div>
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-xl px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-100"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </header>

      {/* LOGIN AREA */}
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* TITLE */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl shadow-xl shadow-blue-200">
              🎓
            </div>

            <p className="mt-6 font-bold tracking-widest text-blue-600">
              WAREETHEP LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              เข้าสู่ระบบ
            </h1>

            <p className="mt-3 text-slate-500">
              เข้าสู่ห้องเรียนวารีเทพ
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ชื่อ-นามสกุล
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อ-นามสกุล"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รหัสผ่าน
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600"
                >
                  ⚠️ {error}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "กำลังตรวจสอบข้อมูล..."
                  : "เข้าสู่ระบบ →"}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                ยังไม่มีบัญชี?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-block font-black text-blue-600 transition hover:text-blue-700"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
            <p className="text-xs font-bold text-blue-700">
              🔐 ระบบสมาชิก วารีเทพ Learning
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-600">
              กรุณาใช้ชื่อและรหัสผ่านที่สมัครสมาชิกไว้
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const REMEMBER_KEY =
  "warithep_learning_remember";

const LOGIN_NAME_KEY =
  "warithep_learning_login_name";

type LoginMember = {
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
  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================================================
  // โหลดชื่อที่เคยจำไว้
  // ไม่เก็บ password ใน LocalStorage
  // =========================================================

  useEffect(() => {
    const savedRemember =
      localStorage.getItem(
        REMEMBER_KEY
      );

    const savedName =
      localStorage.getItem(
        LOGIN_NAME_KEY
      );

    if (savedRemember === "true") {
      setRemember(true);

      if (savedName) {
        setName(savedName);
      }
    }

    // ลบรหัสผ่านเก่าที่อาจเคยถูกเก็บไว้
    localStorage.removeItem(
      "warithep_learning_login_password"
    );
  }, []);

  // =========================================================
  // Login
  // =========================================================

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "กรุณากรอกชื่อ-นามสกุล"
      );
      return;
    }

    if (!password) {
      setError(
        "กรุณากรอกรหัสผ่าน"
      );
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // 1. ขอข้อมูลบัญชีจาก Server
      //
      // Browser ไม่อ่าน members โดยตรง
      // เพราะ RLS ถูกล็อกแล้ว
      // =====================================================

      const response =
        await fetch(
          "/api/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "ไม่พบสมาชิกชื่อนี้ในระบบ"
        );
      }

      const member =
        result.member as LoginMember;

      const authEmail =
        result.auth_email as string;

      // =====================================================
      // 2. Login ด้วย Supabase Auth
      // =====================================================

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

      if (authError) {
        console.error(
          "Supabase Auth Login Error:",
          authError
        );

        throw new Error(
          "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
        );
      }

      if (!authData.user) {
        throw new Error(
          "ไม่สามารถสร้าง Session ได้"
        );
      }

      // =====================================================
      // 3. ตรวจ Auth User ให้ตรงกับสมาชิก
      // =====================================================

      if (
        authData.user.id !==
        member.auth_user_id
      ) {
        console.error(
          "AUTH USER MISMATCH",
          {
            authUser:
              authData.user.id,
            memberAuthUser:
              member.auth_user_id,
          }
        );

        await supabase.auth.signOut();

        throw new Error(
          "ข้อมูลบัญชีไม่ตรงกัน กรุณาติดต่อผู้ดูแลระบบ"
        );
      }

      // =====================================================
      // 4. จดจำชื่อเท่านั้น
      // =====================================================

      if (remember) {
        localStorage.setItem(
          REMEMBER_KEY,
          "true"
        );

        localStorage.setItem(
          LOGIN_NAME_KEY,
          member.name
        );
      } else {
        localStorage.removeItem(
          REMEMBER_KEY
        );

        localStorage.removeItem(
          LOGIN_NAME_KEY
        );
      }

      // =====================================================
      // 5. เก็บข้อมูลสมาชิกสำหรับ UI
      //
      // ไม่มี password
      // =====================================================

      const memberSession = {
        id: member.id,
        name: member.name,
        position: member.position,
        branch: member.branch,
        department: member.department,
        auth_user_id:
          member.auth_user_id,
      };

      localStorage.setItem(
        "warithep_learning_member",
        JSON.stringify(
          memberSession
        )
      );

      localStorage.setItem(
        "warithep_learning_member_id",
        member.id
      );

      localStorage.setItem(
        "warithep_learning_login_name",
        member.name
      );

      // =====================================================
      // 6. เข้า Dashboard
      // =====================================================

      router.replace("/dashboard");
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );

      // ป้องกัน Auth session ค้างกรณี Login ไม่สำเร็จ
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-md shadow-blue-200">
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

      {/* ===================================================== */}
      {/* LOGIN */}
      {/* ===================================================== */}

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          {/* TITLE */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl shadow-xl shadow-blue-200">
              🎓
            </div>

            <p className="mt-6 font-bold tracking-widest text-blue-600">
              WARETHEP LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              เข้าสู่ระบบ
            </h1>

            <p className="mt-3 text-slate-500">
              เข้าสู่ห้องเรียนวารีเทพ
            </p>

          </div>

          {/* CARD */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ชื่อ-นามสกุล
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="กรอกชื่อ-นามสกุล"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รหัสผ่าน
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {/* REMEMBER NAME */}

              <label className="flex cursor-pointer select-none items-center gap-3">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                  className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600"
                />

                <span className="text-sm font-semibold text-slate-600">
                  จดจำชื่อของฉัน
                </span>

              </label>

              {/* ERROR */}

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
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
                  ? "กำลังตรวจสอบบัญชี..."
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
                className="mt-2 inline-block font-black text-blue-600 hover:text-blue-700"
              >
                สมัครสมาชิก
              </Link>

            </div>

          </div>

          {/* SECURITY INFO */}

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">

            <p className="text-xs font-bold text-blue-700">
              🔐 ระบบเข้าสู่ระบบปลอดภัย
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-600">
              บัญชีของคุณได้รับการยืนยันผ่าน
              <br />
              ระบบรักษาความปลอดภัยของ Supabase
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const REMEMBER_KEY =
  "warithep_learning_remember";

const LOGIN_NAME_KEY =
  "warithep_learning_login_name";

const LOGIN_PASSWORD_KEY =
  "warithep_learning_login_password";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | โหลดข้อมูลที่เคยจำไว้
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const savedRemember =
      localStorage.getItem(
        REMEMBER_KEY
      );

    if (savedRemember === "true") {
      const savedName =
        localStorage.getItem(
          LOGIN_NAME_KEY
        );

      const savedPassword =
        localStorage.getItem(
          LOGIN_PASSWORD_KEY
        );

      if (savedName) {
        setName(savedName);
      }

      if (savedPassword) {
        setPassword(savedPassword);
      }

      setRemember(true);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
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

    /*
    |--------------------------------------------------------------------------
    | จดจำชื่อ + รหัสผ่าน
    |--------------------------------------------------------------------------
    */

    if (remember) {
      localStorage.setItem(
        REMEMBER_KEY,
        "true"
      );

      localStorage.setItem(
        LOGIN_NAME_KEY,
        name.trim()
      );

      localStorage.setItem(
        LOGIN_PASSWORD_KEY,
        password
      );
    } else {
      localStorage.removeItem(
        REMEMBER_KEY
      );

      localStorage.removeItem(
        LOGIN_NAME_KEY
      );

      localStorage.removeItem(
        LOGIN_PASSWORD_KEY
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ตรวจสมาชิกที่เคยสมัครไว้
    |--------------------------------------------------------------------------
    */

    const savedMember =
      localStorage.getItem(
        "warithep_learning_member"
      );

    if (savedMember) {
      try {
        const member =
          JSON.parse(savedMember);

        if (
          member.name &&
          member.name.trim() !==
            name.trim()
        ) {
          setError(
            "ชื่อ-นามสกุลไม่ตรงกับบัญชีที่สมัครไว้"
          );

          setLoading(false);
          return;
        }
      } catch {
        // ข้อมูลเดิมอ่านไม่ได้
      }
    }

    /*
    |--------------------------------------------------------------------------
    | ระบบทดสอบ
    |--------------------------------------------------------------------------
    */

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 300);
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
                    setName(e.target.value)
                  }
                  placeholder="กรอกชื่อ-นามสกุล"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg"
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


              {/* ================================================= */}
              {/* REMEMBER PASSWORD */}
              {/* ================================================= */}

              <label className="flex cursor-pointer items-center gap-3 select-none">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600"
                />

                <span className="text-sm font-semibold text-slate-600">
                  จดจำรหัสผ่าน
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
                  ? "กำลังเข้าสู่ระบบ..."
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


          {/* TEST MODE */}

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">

            <p className="text-xs font-bold text-blue-700">
              ℹ️ ระบบทดสอบ
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-600">
              ขณะนี้ระบบกำลังใช้ระบบเข้าสู่ระบบทดสอบ
              <br />
              การตรวจสอบสมาชิกจริงจะเชื่อมกับ Supabase
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
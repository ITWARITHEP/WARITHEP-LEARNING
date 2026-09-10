"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const departments = [
  "ฝ่ายสำนักบริหารกลาง",
  "ฝ่ายบริหารทรัพยากรมนุษย์",
  "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
  "ฝ่ายจัดซื้อจัดจ้าง",
  "ฝ่ายวิศวกรรม",
  "ฝ่ายคลังสินค้า",
  "ฝ่ายการขายและการตลาด",
  "ฝ่ายการเงิน",
  "ฝ่ายบัญชี",
  "ฝ่ายการภาษี",
  "ฝ่ายเทคโนโลยีสารสนเทศ",
  "ฝ่ายตรวจสอบภายใน",
  "ฝ่ายบริหารโครงการ",
];

const positions = [
  "หัวหน้าฝ่าย",
  "ผู้จัดการฝ่าย",
  "ผู้จัดการสาขา",
  "ผู้จัดการเขต",
  "ผู้อำนวยการฝ่าย",
  "ผู้บริหารระดับสูง",
];

const branches = [
  "วารีเทพ สำนักงานใหญ่",
  "วารีเทพ คำเขื่อนแก้ว",
  "วารีเทพ เขื่องใน",
  "วารีเทพ มหาชนะชัย",
  "วารีเทพ ศรีสะเกษ",
  "วารีเทพ สังขะ",
  "วารีเทพ นางรอง",
  "วารีเทพ สว่างแดนดิน",
  "วารีเทพ จักราช",
  "วารีเทพ บางละมุง",
  "วารีเทพ มหานคร",
  "วารีเทพ สกลนคร",
  "วารีเทพ ปราสาท",
  "วารีเทพ อุดรธานี",
  "วารีเทพ กาญจนบุรี",
  "วารีเทพ ครบุรี",
  "วารีเทพ บ้านม่วง",
  "วารีเทพ สุรินทร์",
  "วารีเทพ เชียงใหม่",
  "วารีเทพ บุรีรัมย์",
  "วารีเทพ บ้านผือ",
  "วารีเทพ เพชรบูรณ์",
  "วารีเทพ ทองผาภูมิ",
  "วารีเทพ ลำปาง",
  "วารีเทพ ชุมแสง",
  "วารีเทพ ยางชุมน้อย",
  "วารีเทพ นครพนม",
  "วารีเทพ ศรีราชา",
  "วารีเทพ ขุขันธ์",
  "วารีเทพ คลองขลุง",
  "วารีเทพ อุตรดิตถ์",
  "วารีเทพ ภูเรือ",
  "วารีเทพ หนองบัวลำภู",
  "วารีเทพ จอมพระ",
  "วารีเทพ อู่ทอง",
  "วารีเทพ วังทอง",
  "วารีเทพ มุกดาหาร",
  "วารีเทพ สุโขทัย",
  "วารีเทพ โพธิ์ทอง",
  "วารีเทพ แก้งคร้อ",
  "วารีเทพ เพ็ญ",
  "วารีเทพ เชียงแสน",
  "วารีเทพ กุฉินารายณ์",
  "วารีเทพ ชัยนาท",
  "วารีเทพ ยางตลาด",
  "วารีเทพ เชียงราย",
  "วารีเทพ พัทยา",
  "วารีเทพบัวใหญ่",
  "วารีเทพ ขอนแก่น",
  "วารีเทพกันทรลักษ์",
  "วารีเทพร้อยเอ็ด",
  "วารีเทพลพบุรี",
  "วารีเทพบ้านดุง",
  "วารีเทพ ประจวบคีรีขันธ์",
  "วารีเทพ ทับสะแก",
  "วารีเทพกำแพงเพชร",
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // สมัครสมาชิก
  // =========================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();

    // =====================================================
    // ตรวจข้อมูล
    // =====================================================

    if (!cleanName) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!position) {
      setError("กรุณาเลือกตำแหน่ง");
      return;
    }

    if (!branch) {
      setError("กรุณาเลือกสาขา");
      return;
    }

    if (!department) {
      setError("กรุณาเลือกฝ่าย");
      return;
    }

    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError(
        "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "รหัสผ่านทั้งสองช่องไม่ตรงกัน"
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // =====================================================
      // ส่งข้อมูลไป Server
      //
      // Server จะเป็นผู้:
      // 1. ตรวจสมาชิกซ้ำ
      // 2. สร้าง members
      // 3. สร้าง Supabase Auth
      // 4. เชื่อม auth_user_id
      // =====================================================

      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            position,
            branch,
            department,
            password,
          }),
        }
      );

      const result = await response.json();

      // =====================================================
      // ตรวจผลจาก Server
      // =====================================================

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "ไม่สามารถสมัครสมาชิกได้"
        );

        return;
      }

      const newMember = result.member;

      if (!newMember) {
        setError(
          "สมัครสมาชิกสำเร็จ แต่ไม่พบข้อมูลสมาชิก"
        );

        return;
      }

      if (!result.auth_email) {
        setError(
          "สมัครสมาชิกสำเร็จ แต่ไม่พบข้อมูลบัญชี Auth"
        );

        return;
      }

      // =====================================================
      // Login อัตโนมัติด้วย Supabase Auth
      // =====================================================

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signInWithPassword({
          email: result.auth_email,
          password,
        });

      if (authError || !authData.user) {
        console.error(
          "AUTO LOGIN ERROR:",
          authError
        );

        setError(
          "สมัครสมาชิกสำเร็จแล้ว แต่ไม่สามารถเข้าสู่ระบบอัตโนมัติได้ กรุณาไปที่หน้าเข้าสู่ระบบ"
        );

        return;
      }

      // =====================================================
      // ตรวจว่า Auth User ตรงกับ Member
      // =====================================================

      if (
        authData.user.id !==
        newMember.auth_user_id
      ) {
        console.error(
          "AUTH USER MISMATCH",
          {
            authUserId:
              authData.user.id,
            memberAuthUserId:
              newMember.auth_user_id,
          }
        );

        await supabase.auth.signOut();

        setError(
          "ข้อมูลบัญชีไม่ตรงกัน กรุณาติดต่อผู้ดูแลระบบ"
        );

        return;
      }

      // =====================================================
      // เก็บข้อมูลสมาชิกสำหรับหน้าเว็บ
      //
      // ไม่มี password
      // =====================================================

      const memberSession = {
        id: newMember.id,
        name: newMember.name,
        position: newMember.position,
        branch: newMember.branch,
        department: newMember.department,
        auth_user_id:
          newMember.auth_user_id,
      };

      localStorage.setItem(
        "warithep_learning_member",
        JSON.stringify(memberSession)
      );

      localStorage.setItem(
        "warithep_learning_member_id",
        newMember.id
      );

      localStorage.setItem(
        "warithep_learning_login_name",
        newMember.name
      );

      // =====================================================
      // เข้า Dashboard
      // =====================================================

      router.push("/dashboard");
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง"
      );
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
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
            href="/login"
            className="rounded-xl px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-100"
          >
            เข้าสู่ระบบ
          </Link>

        </div>
      </header>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">

        <div className="w-full max-w-2xl">

          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl shadow-xl shadow-blue-200">
              🎓
            </div>

            <p className="mt-6 font-bold tracking-widest text-blue-600">
              WAREETHEP LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              สมัครสมาชิก
            </h1>

            <p className="mt-3 text-slate-500">
              สร้างบัญชีเพื่อเข้าสู่ห้องเรียนวารีเทพ
            </p>

          </div>

          {/* ================================================= */}
          {/* FORM CARD */}
          {/* ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ================================================= */}
              {/* NAME */}
              {/* ================================================= */}

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
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="กรอกชื่อและนามสกุล"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                />

              </div>

              {/* ================================================= */}
              {/* POSITION */}
              {/* ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ตำแหน่ง
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                >
                  <option value="">
                    เลือกตำแหน่ง
                  </option>

                  {positions.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* ================================================= */}
              {/* BRANCH */}
              {/* ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  สาขา
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={branch}
                  onChange={(e) =>
                    setBranch(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                >
                  <option value="">
                    เลือกสาขา
                  </option>

                  {branches.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* ================================================= */}
              {/* DEPARTMENT */}
              {/* ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ฝ่าย
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                >
                  <option value="">
                    เลือกฝ่าย
                  </option>

                  {departments.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* ================================================= */}
              {/* PASSWORD */}
              {/* ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รหัสผ่าน
                  <span className="ml-1 text-red-500">
                    *
                  </span>
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
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    autoComplete="new-password"
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

              {/* ================================================= */}
              {/* CONFIRM PASSWORD */}
              {/* ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ยืนยันรหัสผ่าน
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {error && (
                <div className="whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {/* ================================================= */}
              {/* SUBMIT */}
              {/* ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "กำลังสร้างบัญชี..."
                  : "สมัครสมาชิก →"}
              </button>

            </form>

            {/* ================================================= */}
            {/* LOGIN */}
            {/* ================================================= */}

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">

              <p className="text-sm text-slate-500">
                มีบัญชีอยู่แล้ว?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block font-black text-blue-600 transition hover:text-blue-700"
              >
                เข้าสู่ระบบ
              </Link>

            </div>

          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <p className="mt-6 text-center text-xs text-slate-400">
            ข้อมูลสมาชิกจะถูกบันทึกเข้าสู่ระบบ วารีเทพ Learning
          </p>

        </div>

      </div>

    </main>
  );
}
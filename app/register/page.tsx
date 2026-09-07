"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
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
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setLoading(true);

    /*
      ตอนนี้ยังไม่เชื่อม Supabase
      เพื่อทดสอบระบบหน้าเว็บก่อน
    */

    const member = {
      name: name.trim(),
      position,
      branch,
      department,
    };

    localStorage.setItem(
      "warithep_learning_member",
      JSON.stringify(member)
    );

    /*
      ใช้ setTimeout เล็กน้อยเพื่อให้ปุ่มแสดงสถานะ
      แล้วเปลี่ยนหน้าไป Dashboard
    */

    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
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
            href="/login"
            className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
          >
            เข้าสู่ระบบ
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">

        <div className="w-full max-w-2xl">

          {/* TITLE */}
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

          {/* FORM CARD */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* NAME */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ชื่อ-นามสกุล
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อและนามสกุล"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* POSITION */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ตำแหน่ง
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="">
                    เลือกตำแหน่ง
                  </option>

                  {positions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                </select>

              </div>

              {/* BRANCH */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  สาขา
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="">
                    เลือกสาขา
                  </option>

                  {branches.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                </select>

              </div>

              {/* DEPARTMENT */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ฝ่าย
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="">
                    เลือกฝ่าย
                  </option>

                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                </select>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รหัสผ่าน
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-14 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                </div>

              </div>

              {/* CONFIRM */}
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ยืนยันรหัสผ่าน
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-14 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "กำลังเข้าสู่ห้องเรียน..." : "สมัครสมาชิก →"}
              </button>

            </form>

            {/* LOGIN */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">

              <p className="text-sm text-slate-500">
                มีบัญชีอยู่แล้ว?
              </p>

              <Link
                href="/login"
                className="mt-2 inline-block font-black text-blue-600 hover:text-blue-700"
              >
                เข้าสู่ระบบ
              </Link>

            </div>

          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            ระบบกำลังอยู่ในขั้นตอนเตรียมเชื่อมต่อฐานข้อมูล Supabase
          </p>

        </div>

      </div>

    </main>
  );
}
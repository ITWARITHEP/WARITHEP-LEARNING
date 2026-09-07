"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [order, setOrder] = useState("0");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("กรุณากรอกชื่อหลักสูตร");
      return;
    }

    if (!department) {
      setError("กรุณาเลือกฝ่าย");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          department: department,
          title: title.trim(),
          description: description.trim() || null,
          published: status === "published",
        })
        .select()
        .single();

      if (error) {
        console.error("Create course error:", error);
        setError(`บันทึกไม่สำเร็จ: ${error.message}`);
        return;
      }

      console.log("Created course:", data);

      setMessage("บันทึกหลักสูตรเรียบร้อยแล้ว");

      setTimeout(() => {
        router.push("/admin/courses");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึกหลักสูตร");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
              🎓
            </div>

            <div>
              <div className="font-black text-slate-900">
                วารีเทพ
              </div>

              <div className="text-xs font-bold tracking-widest text-blue-600">
                LEARNING ADMIN
              </div>
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← กลับหลักสูตร
          </Link>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">
          <p className="font-bold text-blue-600">
            COURSE MANAGEMENT
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            เพิ่มหลักสูตร
          </h1>

          <p className="mt-3 text-slate-500">
            สร้างหลักสูตรใหม่สำหรับห้องเรียนวารีเทพ
          </p>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700">
            ✅ {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700">
            ❌ {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📚
              </div>

              <h2 className="mt-4 text-xl font-black">
                ข้อมูลหลักสูตร
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                กรอกข้อมูลพื้นฐานของหลักสูตร
              </p>

            </div>

            <div className="space-y-5">

              {/* COURSE NAME */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ชื่อหลักสูตร
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น หลักสูตรการปฐมนิเทศพนักงานใหม่"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
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
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="" disabled>
                    เลือกฝ่าย
                  </option>

                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รายละเอียดหลักสูตร
                </label>

                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายรายละเอียดของหลักสูตร..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

            </div>

          </section>

          {/* COVER */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                🖼️
              </div>

              <h2 className="mt-4 text-xl font-black">
                รูปปกหลักสูตร
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                ใช้สำหรับแสดงหน้าหลักสูตร
              </p>

            </div>

            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-4xl">
                🖼️
              </div>

              <h3 className="mt-5 font-bold">
                อัปโหลดรูปปก
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                PNG, JPG หรือ WEBP
              </p>

              <label className="mt-5 inline-block cursor-pointer rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800">

                เลือกรูปภาพ

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

              </label>

              <p className="mt-3 text-xs text-slate-400">
                ระบบจะเพิ่มการอัปโหลดรูปปกภายหลัง
              </p>

            </div>

          </section>

          {/* SETTINGS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                ⚙️
              </div>

              <h2 className="mt-4 text-xl font-black">
                ตั้งค่าหลักสูตร
              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  สถานะ
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="draft">
                    แบบร่าง
                  </option>

                  <option value="published">
                    เปิดใช้งาน
                  </option>

                </select>
              </div>

              {/* ORDER */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ลำดับการแสดง
                </label>

                <input
                  type="number"
                  min="0"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  ตอนนี้ใช้สำหรับเตรียมลำดับการแสดง
                </p>
              </div>

            </div>

          </section>

          {/* ACTION */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin/courses"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกหลักสูตร"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
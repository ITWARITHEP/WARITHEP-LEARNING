"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  duration_minutes: number;
  passing_percent: number;
  shuffle_questions: boolean;
  show_answers: boolean;
  show_score_immediately: boolean;
  published: boolean;
};

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

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    duration_minutes: 15,
    passing_percent: 50,
    shuffle_questions: false,
    show_answers: false,
    show_score_immediately: false,
    published: false,
  });

  useEffect(() => {
    if (!id) return;

    loadExam();
  }, [id]);

  async function loadExam() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        description,
        department,
        duration_minutes,
        passing_percent,
        shuffle_questions,
        show_answers,
        show_score_immediately,
        published
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setError("ไม่สามารถโหลดข้อมูลแบบทดสอบได้");
      setLoading(false);
      return;
    }

    const exam = data as Exam;

    setForm({
      title: exam.title || "",
      description: exam.description || "",
      department: exam.department || "",
      duration_minutes: Number(exam.duration_minutes || 15),
      passing_percent: Number(exam.passing_percent || 50),
      shuffle_questions: Boolean(exam.shuffle_questions),
      show_answers: Boolean(exam.show_answers),
      show_score_immediately: Boolean(exam.show_score_immediately),
      published: Boolean(exam.published),
    });

    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("กรุณากรอกชื่อแบบทดสอบ");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("exams")
      .update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        department: form.department || null,
        duration_minutes: Number(form.duration_minutes),
        passing_percent: Number(form.passing_percent),
        shuffle_questions: form.shuffle_questions,
        show_answers: form.show_answers,
        show_score_immediately: form.show_score_immediately,
        published: form.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setError(error.message || "บันทึกข้อมูลไม่สำเร็จ");
      setSaving(false);
      return;
    }

    alert("บันทึกการแก้ไขเรียบร้อยแล้ว");

    router.push(`/admin/quizzes/${id}/questions`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-bold text-slate-700">
              กำลังโหลดข้อมูล...
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-4xl">⚠️</div>

            <h1 className="mb-2 text-xl font-black text-slate-900">
              ไม่สามารถโหลดแบบทดสอบ
            </h1>

            <p className="mb-6 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => router.push("/admin/quizzes")}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              ← กลับหน้าแบบทดสอบ
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/quizzes")}
              className="mb-3 text-sm font-bold text-slate-500 hover:text-blue-600"
            >
              ← กลับหน้าแบบทดสอบ
            </button>

            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              แก้ไขแบบทดสอบ
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              แก้ไขรายละเอียดและตั้งค่าของแบบทดสอบ
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/admin/quizzes/${id}/questions`)
            }
            className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
          >
            📝 จัดการข้อสอบ
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                ข้อมูลแบบทดสอบ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                รายละเอียดหลักของแบบทดสอบ
              </p>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ชื่อแบบทดสอบ <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="กรอกชื่อแบบทดสอบ"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ฝ่าย
                </label>

                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">ทุกฝ่าย</option>

                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  รายละเอียด
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                  placeholder="รายละเอียดของแบบทดสอบ..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Exam settings */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                ⚙️ ตั้งค่าการสอบ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                กำหนดเวลาและเงื่อนไขของแบบทดสอบ
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  เวลาทำข้อสอบ
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    นาที
                  </span>
                </div>
              </div>

              {/* Passing */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  คะแนนผ่าน
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.passing_percent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        passing_percent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <div>
                  <div className="font-bold text-slate-800">
                    สุ่มลำดับข้อสอบ
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    สุ่มลำดับคำถามทุกครั้งที่เริ่มทำแบบทดสอบ
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.shuffle_questions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shuffle_questions: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <div>
                  <div className="font-bold text-slate-800">
                    แสดงเฉลยหลังสอบ
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    ให้ผู้เข้าสอบเห็นคำตอบหลังส่งแบบทดสอบ
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.show_answers}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      show_answers: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <div>
                  <div className="font-bold text-slate-800">
                    แสดงคะแนนทันที
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    แสดงคะแนนทันทีหลังส่งแบบทดสอบ
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.show_score_immediately}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      show_score_immediately: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <div>
                  <div className="font-bold text-slate-800">
                    เปิดใช้งานแบบทดสอบ
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    เปิดให้ผู้ใช้สามารถเข้าทำแบบทดสอบนี้ได้
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      published: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
              ❌ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(`/admin/quizzes/${id}/questions`)
              }
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
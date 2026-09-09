"use client";

import { useState } from "react";
import Link from "next/link";
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

const trainingGroups = [
  "พนักงานปฏิบัติการฝ่ายขายและการตลาด",
  "ผู้บริหารพนักงานปฏิบัติการฝ่ายขายและการตลาด",
  "ฝ่ายวิศวกรรม",
  "เจ้าหน้าที่สำนักงาน",
];

export default function NewQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState("department");
  const [department, setDepartment] = useState("");
  const [trainingGroup, setTrainingGroup] = useState("");
  const [description, setDescription] = useState("");

  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingPercent, setPassingPercent] = useState(80);

  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showScoreImmediately, setShowScoreImmediately] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("กรุณากรอกชื่อแบบทดสอบ");
      return;
    }

    if (examType === "department" && !department) {
      setError("กรุณาเลือกฝ่าย");
      return;
    }

    if (examType === "training" && !trainingGroup) {
      setError("กรุณาเลือกกลุ่มการอบรม");
      return;
    }

    if (durationMinutes < 1) {
      setError("เวลาทำข้อสอบต้องมากกว่า 0 นาที");
      return;
    }

    if (
      passingPercent < 0 ||
      passingPercent > 100
    ) {
      setError("คะแนนผ่านต้องอยู่ระหว่าง 0 - 100%");
      return;
    }

    try {
      setSaving(true);

      const { data, error: insertError } = await supabase
        .from("exams")
        .insert({
          title: title.trim(),
          description: description.trim() || null,

          // ประเภทแบบทดสอบ
          exam_type: examType,

          // แบบทดสอบฝ่าย
          department:
            examType === "department"
              ? department
              : null,

          // แบบทดสอบการอบรม
          training_group:
            examType === "training"
              ? trainingGroup
              : null,

          question_count: 0,
          total_score: 0,

          duration_minutes: Number(durationMinutes),
          passing_percent: Number(passingPercent),

          shuffle_questions: shuffleQuestions,
          show_answers: showAnswers,
          show_score_immediately: showScoreImmediately,

          published: false,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (!data?.id) {
        throw new Error(
          "สร้างแบบทดสอบสำเร็จ แต่ไม่พบรหัสแบบทดสอบ"
        );
      }

      router.push(
        `/admin/quizzes/${data.id}/questions`
      );
    } catch (err) {
      console.error("Create exam error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถสร้างแบบทดสอบได้"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/admin"
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
                LEARNING ADMIN
              </div>
            </div>
          </Link>

          <Link
            href="/admin/quizzes"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← กลับแบบทดสอบ
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* TITLE */}
        <div className="mb-8">
          <p className="font-bold text-blue-600">
            QUIZ MANAGEMENT
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            สร้างแบบทดสอบ
          </h1>

          <p className="mt-3 text-slate-500">
            เลือกประเภทแบบทดสอบก่อน แล้วจึงเพิ่มข้อสอบ
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            <div>ไม่สามารถสร้างแบบทดสอบได้</div>
            <div className="mt-1 font-normal">
              {error}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BASIC */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📝
              </div>

              <h2 className="mt-4 text-xl font-black">
                ข้อมูลแบบทดสอบ
              </h2>
            </div>

            <div className="space-y-5">
              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  ชื่อแบบทดสอบ
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="เช่น แบบทดสอบความรู้พื้นฐานพนักงานใหม่"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* EXAM TYPE */}
              <div>
                <label className="mb-3 block text-sm font-bold">
                  ประเภทแบบทดสอบ
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* DEPARTMENT */}
                  <button
                    type="button"
                    onClick={() => {
                      setExamType("department");
                      setTrainingGroup("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      examType === "department"
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="text-3xl">
                      🏢
                    </div>

                    <div className="mt-3 font-black text-slate-900">
                      แบบทดสอบประจำฝ่าย
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      สำหรับการเรียนรู้และความรู้ตามฝ่าย
                    </div>
                  </button>

                  {/* TRAINING */}
                  <button
                    type="button"
                    onClick={() => {
                      setExamType("training");
                      setDepartment("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      examType === "training"
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="text-3xl">
                      🎤
                    </div>

                    <div className="mt-3 font-black text-slate-900">
                      แบบทดสอบการอบรม
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      สำหรับอบรมและสัมมนาพนักงาน
                    </div>
                  </button>
                </div>
              </div>

              {/* DEPARTMENT */}
              {examType === "department" && (
                <div>
                  <label className="mb-2 block text-sm font-bold">
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
              )}

              {/* TRAINING GROUP */}
              {examType === "training" && (
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    กลุ่มการอบรม
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    value={trainingGroup}
                    onChange={(e) =>
                      setTrainingGroup(e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">
                      เลือกกลุ่มการอบรม
                    </option>

                    {trainingGroups.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  รายละเอียด
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="รายละเอียดแบบทดสอบ..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          {/* SETTINGS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                ⚙️
              </div>

              <h2 className="mt-4 text-xl font-black">
                ตั้งค่าการสอบ
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                จำนวนข้อสอบและคะแนนจะคำนวณอัตโนมัติจากข้อสอบที่เพิ่ม
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* QUESTION COUNT */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  จำนวนข้อสอบ
                </label>

                <div className="flex h-[52px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-500">
                  0 ข้อ
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  ระบบจะนับให้อัตโนมัติหลังเพิ่มข้อสอบ
                </p>
              </div>

              {/* TOTAL SCORE */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  คะแนนเต็ม
                </label>

                <div className="flex h-[52px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-500">
                  0 คะแนน
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  ระบบจะรวมคะแนนจากแต่ละข้ออัตโนมัติ
                </p>
              </div>

              {/* DURATION */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  เวลาทำข้อสอบ (นาที)
                </label>

                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* PASSING */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  คะแนนผ่าน (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingPercent}
                  onChange={(e) =>
                    setPassingPercent(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          {/* OPTIONS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black">
                ตัวเลือกเพิ่มเติม
              </h2>
            </div>

            <div className="space-y-4">
              {/* SHUFFLE */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">
                <div>
                  <p className="font-bold">
                    สุ่มลำดับข้อสอบ
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    สุ่มข้อสอบแต่ละคนไม่เหมือนกัน
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) =>
                    setShuffleQuestions(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              {/* ANSWERS */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">
                <div>
                  <p className="font-bold">
                    แสดงเฉลยหลังสอบ
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    ให้ผู้เรียนดูคำตอบหลังส่งข้อสอบ
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) =>
                    setShowAnswers(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              {/* SCORE */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">
                <div>
                  <p className="font-bold">
                    แสดงคะแนนทันที
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    แสดงคะแนนทันทีหลังส่งข้อสอบ
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={showScoreImmediately}
                  onChange={(e) =>
                    setShowScoreImmediately(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>
            </div>
          </section>

          {/* FLOW INFO */}
          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex gap-4">
              <div className="text-3xl">
                💡
              </div>

              <div>
                <h3 className="font-black text-blue-900">
                  หลังจากบันทึก
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  ระบบจะสร้างแบบทดสอบในฐานข้อมูลก่อน
                  จากนั้นจะพาคุณไปหน้าจัดการข้อสอบ
                  เพื่อเพิ่มข้อสอบ A / B / C / D
                  และกำหนดเฉลย
                </p>
              </div>
            </div>
          </section>

          {/* ACTION */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/quizzes"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "กำลังสร้างแบบทดสอบ..."
                : "บันทึกแบบทดสอบ → เพิ่มข้อสอบ"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
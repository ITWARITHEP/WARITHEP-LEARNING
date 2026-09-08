"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

type Exam = {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  question_count: number;
  total_score: number;
  duration_minutes: number;
  passing_percent: number;
  shuffle_questions: boolean;
  show_answers: boolean;
  show_score_immediately: boolean;
  published: boolean;
  created_at: string;
};

type Question = {
  id: string;
  exam_id: string;
  score: number;
};

export default function AdminQuizzesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [examResult, questionResult] = await Promise.all([
        supabase
          .from("exams")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("exam_questions")
          .select("id, exam_id, score"),
      ]);

      if (examResult.error) {
        throw new Error(examResult.error.message);
      }

      if (questionResult.error) {
        throw new Error(questionResult.error.message);
      }

      setExams((examResult.data || []) as Exam[]);
      setQuestions((questionResult.data || []) as Question[]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูลแบบทดสอบได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const questionCountByExam = useMemo(() => {
    const map: Record<string, number> = {};

    for (const question of questions) {
      map[question.exam_id] = (map[question.exam_id] || 0) + 1;
    }

    return map;
  }, [questions]);

  const scoreByExam = useMemo(() => {
    const map: Record<string, number> = {};

    for (const question of questions) {
      map[question.exam_id] =
        (map[question.exam_id] || 0) + Number(question.score || 0);
    }

    return map;
  }, [questions]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        !search ||
        exam.title.toLowerCase().includes(search.toLowerCase());

      const matchDepartment =
        !department || exam.department === department;

      const matchStatus =
        !status ||
        (status === "published" && exam.published) ||
        (status === "draft" && !exam.published);

      return matchSearch && matchDepartment && matchStatus;
    });
  }, [exams, search, department, status]);

  const publishedCount = exams.filter((exam) => exam.published).length;

  const totalScore = questions.reduce(
    (sum, question) => sum + Number(question.score || 0),
    0
  );

  async function togglePublished(exam: Exam) {
    const nextPublished = !exam.published;

    const { error } = await supabase
      .from("exams")
      .update({
        published: nextPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exam.id);

    if (error) {
      alert(error.message);
      return;
    }

    setExams((current) =>
      current.map((item) =>
        item.id === exam.id
          ? {
              ...item,
              published: nextPublished,
            }
          : item
      )
    );
  }

  async function deleteExam(exam: Exam) {
    const confirmed = window.confirm(
      `ต้องการลบแบบทดสอบ "${exam.title}" ใช่หรือไม่?\n\nข้อสอบทั้งหมดของแบบทดสอบนี้จะถูกลบด้วย`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", exam.id);

    if (error) {
      alert(error.message);
      return;
    }

    setExams((current) =>
      current.filter((item) => item.id !== exam.id)
    );

    setQuestions((current) =>
      current.filter((item) => item.exam_id !== exam.id)
    );
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
            href="/admin"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← Admin
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-blue-600">
              QUIZ MANAGEMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              จัดการแบบทดสอบ
            </h1>

            <p className="mt-3 text-slate-500">
              สร้างแบบทดสอบ เพิ่มข้อสอบ กำหนดคะแนน และจัดการผลการทดสอบ
            </p>
          </div>

          <Link
            href="/admin/quizzes/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            + สร้างแบบทดสอบ
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            ไม่สามารถโหลดข้อมูลได้
            <div className="mt-1 font-normal">
              {error}
            </div>
          </div>
        )}

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="📝"
            title="แบบทดสอบทั้งหมด"
            value={exams.length}
          />

          <StatCard
            icon="❓"
            title="ข้อสอบทั้งหมด"
            value={questions.length}
          />

          <StatCard
            icon="🎯"
            title="คะแนนทั้งหมด"
            value={totalScore}
          />

          <StatCard
            icon="🟢"
            title="เปิดใช้งาน"
            value={publishedCount}
          />
        </section>

        {/* FILTER */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                ค้นหาแบบทดสอบ
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อแบบทดสอบ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                ฝ่าย
              </label>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">ทุกฝ่าย</option>

                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                สถานะ
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">ทุกสถานะ</option>
                <option value="draft">แบบร่าง</option>
                <option value="published">เปิดใช้งาน</option>
              </select>
            </div>
          </div>
        </section>

        {/* EXAM LIST */}
        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="text-4xl">⏳</div>

              <p className="mt-4 font-bold text-slate-600">
                กำลังโหลดแบบทดสอบ...
              </p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                📝
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900">
                {exams.length === 0
                  ? "ยังไม่มีแบบทดสอบ"
                  : "ไม่พบแบบทดสอบ"}
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-slate-500">
                {exams.length === 0
                  ? "เริ่มต้นด้วยการสร้างแบบทดสอบแรกของระบบ"
                  : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
              </p>

              {exams.length === 0 && (
                <Link
                  href="/admin/quizzes/new"
                  className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  + สร้างแบบทดสอบแรก
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam) => {
                const realQuestionCount =
                  questionCountByExam[exam.id] || 0;

                const realScore =
                  scoreByExam[exam.id] ?? Number(exam.total_score || 0);

                return (
                  <div
                    key={exam.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              exam.published
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {exam.published
                              ? "เปิดใช้งาน"
                              : "แบบร่าง"}
                          </span>

                          {exam.department && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              {exam.department}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-black text-slate-900">
                          {exam.title}
                        </h2>

                        {exam.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {exam.description}
                          </p>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <InfoItem
                            label="ข้อสอบ"
                            value={`${realQuestionCount} ข้อ`}
                          />

                          <InfoItem
                            label="คะแนน"
                            value={`${realScore} คะแนน`}
                          />

                          <InfoItem
                            label="เวลา"
                            value={`${exam.duration_minutes} นาที`}
                          />

                          <InfoItem
                            label="ผ่าน"
                            value={`${exam.passing_percent}%`}
                          />
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-2 lg:w-[330px] lg:justify-end">
                        <Link
                          href={`/admin/quizzes/${exam.id}/questions`}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                        >
                          📝 จัดการข้อสอบ
                        </Link>

                        <Link
                          href={`/admin/quizzes/${exam.id}/edit`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          ✏️ แก้ไข
                        </Link>

                        <button
                          type="button"
                          onClick={() => togglePublished(exam)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {exam.published
                            ? "ปิดใช้งาน"
                            : "เปิดใช้งาน"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteExam(exam)}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                        >
                          🗑 ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* DEPARTMENT SUMMARY */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="font-bold text-blue-600">
              QUIZ LIBRARY
            </p>

            <h2 className="mt-1 text-2xl font-black">
              แบบทดสอบแยกตามฝ่าย
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((item, index) => {
              const count = exams.filter(
                (exam) => exam.department === item
              ).length;

              return (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-6 text-slate-900">
                        {item}
                      </h3>

                      <div className="mt-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          {count} แบบทดสอบ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Quiz Management
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}
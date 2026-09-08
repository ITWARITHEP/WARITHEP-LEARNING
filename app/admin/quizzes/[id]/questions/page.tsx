"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  question_count: number;
  total_score: number;
  duration_minutes: number;
  passing_percent: number;
  published: boolean;
};

type Question = {
  id: string;
  exam_id: string;
  question_no: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  score: number;
};

type QuestionForm = {
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  score: number;
};

const emptyForm: QuestionForm = {
  question_text: "",
  choice_a: "",
  choice_b: "",
  choice_c: "",
  choice_d: "",
  correct_answer: "A",
  score: 1,
};

export default function AdminQuestionsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<QuestionForm>(emptyForm);

  useEffect(() => {
    if (!examId) return;

    loadData();
  }, [examId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [examResult, questionResult] = await Promise.all([
        supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single(),

        supabase
          .from("exam_questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_no", { ascending: true }),
      ]);

      if (examResult.error) {
        throw new Error(examResult.error.message);
      }

      if (questionResult.error) {
        throw new Error(questionResult.error.message);
      }

      setExam(examResult.data as Exam);
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

  function updateForm(
    field: keyof QuestionForm,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(question: Question) {
    setEditingId(question.id);

    setForm({
      question_text: question.question_text,
      choice_a: question.choice_a,
      choice_b: question.choice_b,
      choice_c: question.choice_c,
      choice_d: question.choice_d,
      correct_answer: question.correct_answer,
      score: Number(question.score || 1),
    });

    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setSuccess("");
  }

  async function saveQuestion() {
    setError("");
    setSuccess("");

    if (!form.question_text.trim()) {
      setError("กรุณากรอกคำถาม");
      return;
    }

    if (!form.choice_a.trim()) {
      setError("กรุณากรอกตัวเลือก A");
      return;
    }

    if (!form.choice_b.trim()) {
      setError("กรุณากรอกตัวเลือก B");
      return;
    }

    if (!form.choice_c.trim()) {
      setError("กรุณากรอกตัวเลือก C");
      return;
    }

    if (!form.choice_d.trim()) {
      setError("กรุณากรอกตัวเลือก D");
      return;
    }

    if (Number(form.score) <= 0) {
      setError("คะแนนต้องมากกว่า 0");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const { data, error } = await supabase
          .from("exam_questions")
          .update({
            question_text: form.question_text.trim(),
            choice_a: form.choice_a.trim(),
            choice_b: form.choice_b.trim(),
            choice_c: form.choice_c.trim(),
            choice_d: form.choice_d.trim(),
            correct_answer: form.correct_answer,
            score: Number(form.score),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .select("*")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setQuestions((current) =>
          current
            .map((item) =>
              item.id === editingId ? (data as Question) : item
            )
            .sort((a, b) => a.question_no - b.question_no)
        );

        setSuccess("แก้ไขข้อสอบเรียบร้อยแล้ว");
      } else {
        const nextQuestionNo =
          questions.length > 0
            ? Math.max(
                ...questions.map((item) => item.question_no)
              ) + 1
            : 1;

        const { data, error } = await supabase
          .from("exam_questions")
          .insert({
            exam_id: examId,
            question_no: nextQuestionNo,
            question_text: form.question_text.trim(),
            choice_a: form.choice_a.trim(),
            choice_b: form.choice_b.trim(),
            choice_c: form.choice_c.trim(),
            choice_d: form.choice_d.trim(),
            correct_answer: form.correct_answer,
            score: Number(form.score),
          })
          .select("*")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setQuestions((current) => [
          ...current,
          data as Question,
        ]);

        setSuccess("เพิ่มข้อสอบเรียบร้อยแล้ว");
      }

      setForm(emptyForm);
      setEditingId(null);

      await updateExamSummary();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถบันทึกข้อสอบได้"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question: Question) {
    const confirmed = window.confirm(
      `ต้องการลบข้อที่ ${question.question_no} ใช่หรือไม่?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", question.id);

      if (error) {
        throw new Error(error.message);
      }

      const remaining = questions
        .filter((item) => item.id !== question.id)
        .sort((a, b) => a.question_no - b.question_no);

      // จัดเลขข้อใหม่ 1,2,3,...
      const reordered = remaining.map((item, index) => ({
        ...item,
        question_no: index + 1,
      }));

      for (const item of reordered) {
        await supabase
          .from("exam_questions")
          .update({
            question_no: item.question_no,
          })
          .eq("id", item.id);
      }

      setQuestions(reordered);

      if (editingId === question.id) {
        cancelEdit();
      }

      await updateExamSummary();

      setSuccess("ลบข้อสอบเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถลบข้อสอบได้"
      );
    }
  }

  async function updateExamSummary() {
    const { data, error } = await supabase
      .from("exam_questions")
      .select("score")
      .eq("exam_id", examId);

    if (error) {
      console.error("Update exam summary error:", error);
      return;
    }

    const count = data?.length || 0;

    const totalScore =
      data?.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0
      ) || 0;

    const { error: updateError } = await supabase
      .from("exams")
      .update({
        question_count: count,
        total_score: totalScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", examId);

    if (updateError) {
      console.error(
        "Update exam summary error:",
        updateError
      );
      return;
    }

    setExam((current) =>
      current
        ? {
            ...current,
            question_count: count,
            total_score: totalScore,
          }
        : current
    );
  }

  async function togglePublished() {
    if (!exam) return;

    const next = !exam.published;

    const { error } = await supabase
      .from("exams")
      .update({
        published: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exam.id);

    if (error) {
      setError(error.message);
      return;
    }

    setExam({
      ...exam,
      published: next,
    });

    setSuccess(
      next
        ? "เปิดใช้งานแบบทดสอบแล้ว"
        : "ปิดใช้งานแบบทดสอบแล้ว"
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-5xl">⏳</div>
          <p className="mt-4 font-bold text-slate-600">
            กำลังโหลดแบบทดสอบ...
          </p>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-6xl">❌</div>

          <h1 className="mt-6 text-2xl font-black">
            ไม่พบแบบทดสอบ
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "แบบทดสอบนี้อาจถูกลบไปแล้ว"}
          </p>

          <Link
            href="/admin/quizzes"
            className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
          >
            ← กลับหน้าจัดการแบบทดสอบ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
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

          <div className="flex items-center gap-2">
            <Link
              href="/admin/quizzes"
              className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← แบบทดสอบ
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* EXAM HEADER */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
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

              <h1 className="mt-4 text-3xl font-black text-slate-900">
                {exam.title}
              </h1>

              {exam.description && (
                <p className="mt-2 text-slate-500">
                  {exam.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={togglePublished}
              className={`rounded-2xl px-6 py-4 font-bold shadow-sm ${
                exam.published
                  ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {exam.published
                ? "ปิดใช้งานแบบทดสอบ"
                : "เปิดใช้งานแบบทดสอบ"}
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard
              icon="❓"
              label="จำนวนข้อ"
              value={`${questions.length} ข้อ`}
            />

            <SummaryCard
              icon="🎯"
              label="คะแนนเต็ม"
              value={`${questions.reduce(
                (sum, item) =>
                  sum + Number(item.score || 0),
                0
              )} คะแนน`}
            />

            <SummaryCard
              icon="⏱️"
              label="เวลาทำ"
              value={`${exam.duration_minutes} นาที`}
            />

            <SummaryCard
              icon="🏆"
              label="คะแนนผ่าน"
              value={`${exam.passing_percent}%`}
            />
          </div>
        </section>

        {/* MESSAGE */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        {/* ADD / EDIT FORM */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-blue-600">
                {editingId
                  ? "EDIT QUESTION"
                  : "CREATE QUESTION"}
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {editingId
                  ? "แก้ไขข้อสอบ"
                  : `เพิ่มข้อสอบข้อที่ ${questions.length + 1}`}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิกการแก้ไข
              </button>
            )}
          </div>

          {/* QUESTION */}
          <div className="mt-7">
            <label className="mb-2 block text-sm font-black text-slate-700">
              คำถาม
            </label>

            <textarea
              value={form.question_text}
              onChange={(e) =>
                updateForm(
                  "question_text",
                  e.target.value
                )
              }
              rows={4}
              placeholder="พิมพ์คำถาม..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* CHOICES */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ChoiceInput
              letter="A"
              value={form.choice_a}
              onChange={(value) =>
                updateForm("choice_a", value)
              }
            />

            <ChoiceInput
              letter="B"
              value={form.choice_b}
              onChange={(value) =>
                updateForm("choice_b", value)
              }
            />

            <ChoiceInput
              letter="C"
              value={form.choice_c}
              onChange={(value) =>
                updateForm("choice_c", value)
              }
            />

            <ChoiceInput
              letter="D"
              value={form.choice_d}
              onChange={(value) =>
                updateForm("choice_d", value)
              }
            />
          </div>

          {/* ANSWER + SCORE */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                เฉลย
              </label>

              <select
                value={form.correct_answer}
                onChange={(e) =>
                  updateForm(
                    "correct_answer",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                คะแนน
              </label>

              <input
                type="number"
                min="1"
                value={form.score}
                onChange={(e) =>
                  updateForm(
                    "score",
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {/* SAVE */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            )}

            <button
              type="button"
              onClick={saveQuestion}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "กำลังบันทึก..."
                : editingId
                  ? "บันทึกการแก้ไข"
                  : "+ เพิ่มข้อสอบ"}
            </button>
          </div>
        </section>

        {/* QUESTIONS */}
        <section className="mt-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-blue-600">
                QUESTION BANK
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                ข้อสอบทั้งหมด
              </h2>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              {questions.length} ข้อ
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                ❓
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-900">
                ยังไม่มีข้อสอบ
              </h3>

              <p className="mt-2 text-slate-500">
                เพิ่มข้อสอบจากแบบฟอร์มด้านบนได้เลย
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((question) => (
                <article
                  key={question.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white">
                        {question.question_no}
                      </div>

                      <div className="min-w-0">
                        <h3 className="whitespace-pre-wrap text-lg font-black leading-7 text-slate-900">
                          {question.question_text}
                        </h3>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(question)
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        ✏️ แก้ไข
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteQuestion(question)
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                      >
                        🗑 ลบ
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <AnswerCard
                      letter="A"
                      text={question.choice_a}
                      correct={
                        question.correct_answer === "A"
                      }
                    />

                    <AnswerCard
                      letter="B"
                      text={question.choice_b}
                      correct={
                        question.correct_answer === "B"
                      }
                    />

                    <AnswerCard
                      letter="C"
                      text={question.choice_c}
                      correct={
                        question.correct_answer === "C"
                      }
                    />

                    <AnswerCard
                      letter="D"
                      text={question.choice_d}
                      correct={
                        question.correct_answer === "D"
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                      ✓ เฉลย {question.correct_answer}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                      🎯 {question.score} คะแนน
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Question Management
          </p>
        </div>
      </footer>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xl">{icon}</div>

      <p className="mt-2 text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ChoiceInput({
  letter,
  value,
  onChange,
}: {
  letter: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {letter}
        </span>

        ตัวเลือก {letter}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`พิมพ์ตัวเลือก ${letter}...`}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function AnswerCard({
  letter,
  text,
  correct,
}: {
  letter: string;
  text: string;
  correct: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        correct
          ? "border-green-300 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-black ${
            correct
              ? "bg-green-600 text-white"
              : "bg-white text-slate-600"
          }`}
        >
          {letter}
        </div>

        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
            {text}
          </p>

          {correct && (
            <p className="mt-1 text-xs font-black text-green-700">
              ✓ คำตอบที่ถูกต้อง
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  department: string;
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

const emptyForm = {
  question_text: "",
  choice_a: "",
  choice_b: "",
  choice_c: "",
  choice_d: "",
  correct_answer: "A" as "A" | "B" | "C" | "D",
  score: "1",
};

export default function QuestionsAdminPage() {
  const params = useParams();
  const router = useRouter();

  const examId = String(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      setExam(examResult.data);
      setQuestions(questionResult.data ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (examId) {
      void loadData();
    }
  }, [examId]);

  async function updateExamSummary(nextQuestions: Question[]) {
    const totalScore = nextQuestions.reduce(
      (sum, question) => sum + Number(question.score || 0),
      0
    );

    const { error } = await supabase
      .from("exams")
      .update({
        question_count: nextQuestions.length,
        total_score: totalScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", examId);

    if (error) {
      throw new Error(error.message);
    }

    setExam((current) =>
      current
        ? {
            ...current,
            question_count: nextQuestions.length,
            total_score: totalScore,
          }
        : current
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.question_text.trim()) {
      setError("กรุณากรอกคำถาม");
      return;
    }

    if (
      !form.choice_a.trim() ||
      !form.choice_b.trim() ||
      !form.choice_c.trim() ||
      !form.choice_d.trim()
    ) {
      setError("กรุณากรอกตัวเลือกให้ครบ A - D");
      return;
    }

    const score = Number(form.score);

    if (!Number.isFinite(score) || score <= 0) {
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
            score,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        const nextQuestions = questions.map((question) =>
          question.id === editingId ? data : question
        );

        setQuestions(nextQuestions);

        await updateExamSummary(nextQuestions);

        setMessage("แก้ไขข้อสอบเรียบร้อยแล้ว");
      } else {
        const nextQuestionNo =
          questions.length > 0
            ? Math.max(
                ...questions.map((question) =>
                  Number(question.question_no)
                )
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
            score,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        const nextQuestions = [...questions, data];

        setQuestions(nextQuestions);

        await updateExamSummary(nextQuestions);

        setMessage(`เพิ่มข้อ ${nextQuestionNo} เรียบร้อยแล้ว`);
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "บันทึกข้อสอบไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  function editQuestion(question: Question) {
    setEditingId(question.id);

    setForm({
      question_text: question.question_text,
      choice_a: question.choice_a,
      choice_b: question.choice_b,
      choice_c: question.choice_c,
      choice_d: question.choice_d,
      correct_answer: question.correct_answer,
      score: String(question.score),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function deleteQuestion(question: Question) {
    const confirmed = window.confirm(
      `ต้องการลบข้อ ${question.question_no} ใช่หรือไม่?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", question.id);

      if (error) {
        throw new Error(error.message);
      }

      const remaining = questions
        .filter((item) => item.id !== question.id)
        .map((item, index) => ({
          ...item,
          question_no: index + 1,
        }));

      /*
       * อัปเดตเลขข้อใหม่ด้วยการลบแล้วสร้างลำดับใหม่
       * เพื่อป้องกัน unique(exam_id, question_no)
       */
      if (remaining.length > 0) {
        await supabase
          .from("exam_questions")
          .delete()
          .eq("exam_id", examId);

        const rows = remaining.map((item) => ({
          exam_id: examId,
          question_no: item.question_no,
          question_text: item.question_text,
          choice_a: item.choice_a,
          choice_b: item.choice_b,
          choice_c: item.choice_c,
          choice_d: item.choice_d,
          correct_answer: item.correct_answer,
          score: Number(item.score),
        }));

        const { data, error: insertError } = await supabase
          .from("exam_questions")
          .insert(rows)
          .select();

        if (insertError) {
          throw new Error(insertError.message);
        }

        const sorted = (data ?? []).sort(
          (a, b) => a.question_no - b.question_no
        );

        setQuestions(sorted);

        await updateExamSummary(sorted);
      } else {
        setQuestions([]);
        await updateExamSummary([]);
      }

      if (editingId === question.id) {
        cancelEdit();
      }

      setMessage("ลบข้อสอบเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ลบข้อสอบไม่สำเร็จ"
      );

      await loadData();
    }
  }

  async function togglePublished() {
    if (!exam) return;

    try {
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("exams")
        .update({
          published: !exam.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", examId);

      if (error) {
        throw new Error(error.message);
      }

      setExam({
        ...exam,
        published: !exam.published,
      });

      setMessage(
        !exam.published
          ? "เผยแพร่แบบทดสอบแล้ว"
          : "ยกเลิกการเผยแพร่แล้ว"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "เปลี่ยนสถานะไม่สำเร็จ"
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f9fd] p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="min-h-screen bg-[#f6f9fd] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-black">
            ไม่พบแบบทดสอบ
          </h1>

          <p className="mt-2 text-slate-500">
            {error || "ไม่พบข้อมูลแบบทดสอบนี้"}
          </p>

          <Link
            href="/admin/quizzes"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            ← กลับหน้าแบบทดสอบ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fd] text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <div className="min-w-0">
            <Link
              href="/admin/quizzes"
              className="text-xs font-bold text-blue-600"
            >
              ← แบบทดสอบ
            </Link>

            <h1 className="mt-1 truncate text-lg font-black sm:text-2xl">
              {exam.title}
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              {exam.department}
            </p>
          </div>

          <button
            type="button"
            onClick={togglePublished}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition sm:px-5 sm:py-3 ${
              exam.published
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {exam.published ? "✓ เผยแพร่แล้ว" : "เผยแพร่แบบทดสอบ"}
          </button>

        </div>
      </header>


      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* SUMMARY */}

        <div className="grid gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-400">
              จำนวนข้อ
            </div>

            <div className="mt-1 text-3xl font-black">
              {questions.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-400">
              คะแนนรวม
            </div>

            <div className="mt-1 text-3xl font-black">
              {exam.total_score}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-400">
              เวลา
            </div>

            <div className="mt-1 text-3xl font-black">
              {exam.duration_minutes}
              <span className="ml-1 text-sm">นาที</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-400">
              เกณฑ์ผ่าน
            </div>

            <div className="mt-1 text-3xl font-black">
              {exam.passing_percent}%
            </div>
          </div>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            ⚠️ {error}
          </div>
        )}


        {/* FORM */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6 flex items-center justify-between gap-3">

            <div>
              <div className="text-xs font-black tracking-widest text-blue-600">
                QUESTION EDITOR
              </div>

              <h2 className="mt-1 text-xl font-black">
                {editingId
                  ? "แก้ไขข้อสอบ"
                  : "เพิ่มข้อสอบ"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                ยกเลิกแก้ไข
              </button>
            )}

          </div>


          <form onSubmit={handleSubmit}>

            <label className="block">
              <div className="mb-2 text-sm font-black">
                คำถาม
              </div>

              <textarea
                value={form.question_text}
                onChange={(e) =>
                  setForm({
                    ...form,
                    question_text: e.target.value,
                  })
                }
                rows={4}
                placeholder="พิมพ์คำถาม..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </label>


            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {[
                ["A", "choice_a"],
                ["B", "choice_b"],
                ["C", "choice_c"],
                ["D", "choice_d"],
              ].map(([letter, key]) => (
                <label key={letter} className="block">

                  <div className="mb-2 text-sm font-black">
                    ตัวเลือก {letter}
                  </div>

                  <input
                    type="text"
                    value={
                      form[
                        key as
                          | "choice_a"
                          | "choice_b"
                          | "choice_c"
                          | "choice_d"
                      ]
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    placeholder={`ตัวเลือก ${letter}`}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  />

                </label>
              ))}

            </div>


            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <label>
                <div className="mb-2 text-sm font-black">
                  คำตอบที่ถูกต้อง
                </div>

                <select
                  value={form.correct_answer}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      correct_answer:
                        e.target.value as
                          | "A"
                          | "B"
                          | "C"
                          | "D",
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>


              <label>
                <div className="mb-2 text-sm font-black">
                  คะแนนข้อนี้
                </div>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.score}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      score: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400"
                />
              </label>

            </div>


            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "กำลังบันทึก..."
                : editingId
                  ? "บันทึกการแก้ไข"
                  : "＋ เพิ่มข้อสอบ"}
            </button>

          </form>

        </section>


        {/* QUESTIONS */}

        <section className="mt-6">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <div className="text-xs font-black tracking-widest text-blue-600">
                QUESTIONS
              </div>

              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                รายการข้อสอบ
              </h2>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
              {questions.length} ข้อ
            </div>

          </div>


          {questions.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="text-5xl">
                📝
              </div>

              <h3 className="mt-4 text-xl font-black">
                ยังไม่มีข้อสอบ
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                เพิ่มข้อสอบจากแบบฟอร์มด้านบน
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {questions.map((question) => (

                <article
                  key={question.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                        {question.question_no}
                      </div>

                      <div>
                        <h3 className="text-base font-black leading-6 sm:text-lg">
                          {question.question_text}
                        </h3>

                        <div className="mt-1 text-xs font-bold text-slate-400">
                          คะแนน {question.score}
                        </div>
                      </div>

                    </div>


                    <div className="flex shrink-0 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          editQuestion(question)
                        }
                        className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-600 hover:bg-blue-100"
                      >
                        ✏️ แก้ไข
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteQuestion(question)
                        }
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                      >
                        🗑 ลบ
                      </button>

                    </div>

                  </div>


                  <div className="mt-5 grid gap-2 md:grid-cols-2">

                    {[
                      ["A", question.choice_a],
                      ["B", question.choice_b],
                      ["C", question.choice_c],
                      ["D", question.choice_d],
                    ].map(([letter, text]) => {

                      const correct =
                        letter === question.correct_answer;

                      return (
                        <div
                          key={letter}
                          className={`rounded-2xl border px-4 py-3 text-sm ${
                            correct
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-100 bg-slate-50"
                          }`}
                        >

                          <span
                            className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                              correct
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            {letter}
                          </span>

                          <span className="font-semibold">
                            {text}
                          </span>

                          {correct && (
                            <span className="ml-2 text-xs font-black text-emerald-600">
                              ✓ คำตอบ
                            </span>
                          )}

                        </div>
                      );

                    })}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}
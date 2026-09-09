"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  shuffle_questions: boolean;
  show_answers: boolean;
  show_score_immediately: boolean;
};

type Question = {
  id: string;
  question_no: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  score: number;
};

type AnswerMap = Record<
  string,
  "A" | "B" | "C" | "D"
>;

type Member = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  position?: string | null;
  branch?: string | null;
  department?: string | null;
};

type SavedMember = {
  id?: string;
  name?: string;
  full_name?: string;
  member_name?: string;
  first_name?: string;
  last_name?: string;
};

export default function ExamPage() {
  const params = useParams();

  const examId = String(params.id);

  const [exam, setExam] =
    useState<Exam | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [finished, setFinished] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [percent, setPercent] =
    useState(0);

  const [maxScore, setMaxScore] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [savingResult, setSavingResult] =
    useState(false);

  const [resultSaved, setResultSaved] =
    useState(false);

  const [alreadyPassed, setAlreadyPassed] =
    useState(false);

  const [passedPercent, setPassedPercent] =
    useState<number | null>(null);

  const [
    checkingPreviousResult,
    setCheckingPreviousResult,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | สร้างชื่อสมาชิก
  |--------------------------------------------------------------------------
  */

  function getMemberDisplayName(
    member: Member
  ) {
    if (member.name?.trim()) {
      return member.name.trim();
    }

    if (member.full_name?.trim()) {
      return member.full_name.trim();
    }

    const first =
      member.first_name?.trim() || "";

    const last =
      member.last_name?.trim() || "";

    return `${first} ${last}`.trim();
  }

  /*
  |--------------------------------------------------------------------------
  | หา Member ปัจจุบัน
  |--------------------------------------------------------------------------
  */

  async function getCurrentMember(): Promise<Member | null> {
    try {
      /*
      |--------------------------------------------------------------------------
      | 1. ใช้ Member ID จาก Login ก่อน
      |--------------------------------------------------------------------------
      */

      const memberIdKeys = [
        "warithep_learning_member_id",
        "warithep_member_id",
        "member_id",
        "current_member_id",
      ];

      for (const key of memberIdKeys) {
        const storedId =
          localStorage.getItem(key)?.trim();

        if (!storedId) continue;

        const {
          data,
          error: memberError,
        } = await supabase
          .from("members")
          .select("*")
          .eq("id", storedId)
          .maybeSingle();

        if (!memberError && data) {
          return data as Member;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | 2. อ่าน Member Object จาก Login
      |--------------------------------------------------------------------------
      */

      const memberKeys = [
        "warithep_learning_member",
        "warithep_learning_user",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      for (const key of memberKeys) {
        const savedValue =
          localStorage.getItem(key);

        if (!savedValue) continue;

        try {
          const parsed: unknown =
            JSON.parse(savedValue);

          if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
          ) {
            continue;
          }

          const savedMember =
            parsed as SavedMember;

          /*
          |--------------------------------------------------------------------------
          | ถ้ามี ID
          |--------------------------------------------------------------------------
          */

          if (savedMember.id) {
            const {
              data,
              error: memberError,
            } = await supabase
              .from("members")
              .select("*")
              .eq("id", savedMember.id)
              .maybeSingle();

            if (!memberError && data) {
              return data as Member;
            }
          }

          /*
          |--------------------------------------------------------------------------
          | ถ้ามีชื่อ
          |--------------------------------------------------------------------------
          */

          const savedName =
            savedMember.name ||
            savedMember.full_name ||
            savedMember.member_name ||
            "";

          if (savedName.trim()) {
            const cleanName =
              savedName.trim();

            const {
              data,
              error: memberError,
            } = await supabase
              .from("members")
              .select("*")
              .eq("name", cleanName)
              .maybeSingle();

            if (!memberError && data) {
              return data as Member;
            }

            const {
              data: fullNameData,
              error: fullNameError,
            } = await supabase
              .from("members")
              .select("*")
              .eq("full_name", cleanName)
              .maybeSingle();

            if (
              !fullNameError &&
              fullNameData
            ) {
              return fullNameData as Member;
            }
          }
        } catch {
          /*
          | ไม่ใช่ JSON
          */
        }
      }

      /*
      |--------------------------------------------------------------------------
      | 3. ใช้ชื่อจาก Login
      |--------------------------------------------------------------------------
      */

      const loginNameKeys = [
        "warithep_learning_login_name",
        "warithep_login_name",
        "login_name",
      ];

      for (const key of loginNameKeys) {
        const loginName =
          localStorage.getItem(key)?.trim();

        if (!loginName) continue;

        const {
          data,
          error: memberError,
        } = await supabase
          .from("members")
          .select("*")
          .eq("name", loginName)
          .maybeSingle();

        if (!memberError && data) {
          return data as Member;
        }

        const {
          data: fullNameData,
          error: fullNameError,
        } = await supabase
          .from("members")
          .select("*")
          .eq("full_name", loginName)
          .maybeSingle();

        if (
          !fullNameError &&
          fullNameData
        ) {
          return fullNameData as Member;
        }
      }

      return null;
    } catch (err) {
      console.error(
        "getCurrentMember error:",
        err
      );

      return null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ตรวจสอบว่าผ่านบทนี้แล้วหรือยัง
  |--------------------------------------------------------------------------
  */

  async function checkPassedBefore(
    currentExamId: string
  ): Promise<boolean> {
    try {
      setCheckingPreviousResult(true);

      const member =
        await getCurrentMember();

      if (!member?.id) {
        console.warn(
          "ไม่พบสมาชิกที่ Login อยู่"
        );

        setAlreadyPassed(false);
        setPassedPercent(null);

        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | ตรวจด้วย member_id
      |--------------------------------------------------------------------------
      */

      const {
        data,
        error: resultError,
      } = await supabase
        .from("exam_results")
        .select(
          "id, percent, passed, member_id, member_name, created_at"
        )
        .eq(
          "exam_id",
          currentExamId
        )
        .eq(
          "member_id",
          member.id
        )
        .eq("passed", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (resultError) {
        console.error(
          "ตรวจสอบผลสอบไม่สำเร็จ:",
          resultError
        );

        return false;
      }

      if (data) {
        setAlreadyPassed(true);
        setPassedPercent(
          Number(data.percent || 0)
        );

        return true;
      }

      /*
      |--------------------------------------------------------------------------
      | รองรับผลสอบเก่าที่อาจไม่มี member_id
      |--------------------------------------------------------------------------
      | ใช้ชื่อสมาชิกจับคู่เพื่อให้ข้อมูลเก่าแสดงได้
      |--------------------------------------------------------------------------
      */

      const memberName =
        getMemberDisplayName(member);

      if (memberName) {
        const {
          data: oldResult,
          error: oldResultError,
        } = await supabase
          .from("exam_results")
          .select(
            "id, percent, passed, member_id, member_name, created_at"
          )
          .eq(
            "exam_id",
            currentExamId
          )
          .eq(
            "member_name",
            memberName
          )
          .eq("passed", true)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (
          !oldResultError &&
          oldResult
        ) {
          setAlreadyPassed(true);
          setPassedPercent(
            Number(
              oldResult.percent || 0
            )
          );

          return true;
        }
      }

      setAlreadyPassed(false);
      setPassedPercent(null);

      return false;
    } catch (err) {
      console.error(
        "checkPassedBefore error:",
        err
      );

      setAlreadyPassed(false);
      setPassedPercent(null);

      return false;
    } finally {
      setCheckingPreviousResult(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | โหลดแบบทดสอบ
  |--------------------------------------------------------------------------
  */

  async function loadExam() {
    try {
      setLoading(true);
      setError("");

      const {
        data: examData,
        error: examError,
      } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .eq("published", true)
        .single();

      if (examError) {
        throw new Error(
          examError.message ||
            "ไม่สามารถโหลดแบบทดสอบได้"
        );
      }

      if (!examData) {
        throw new Error(
          "ไม่พบข้อมูลแบบทดสอบ"
        );
      }

      setExam(examData as Exam);

      const hasPassed =
        await checkPassedBefore(
          examId
        );

      if (hasPassed) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from("exam_questions")
        .select(
          "id,question_no,question_text,choice_a,choice_b,choice_c,choice_d,correct_answer,score"
        )
        .eq("exam_id", examId)
        .order("question_no", {
          ascending: true,
        });

      if (questionError) {
        throw new Error(
          questionError.message ||
            "ไม่สามารถโหลดข้อสอบได้"
        );
      }

      if (
        !questionData ||
        questionData.length === 0
      ) {
        throw new Error(
          "แบบทดสอบนี้ยังไม่มีข้อสอบ"
        );
      }

      let finalQuestions =
        questionData as Question[];

      if (examData.shuffle_questions) {
        finalQuestions = [
          ...finalQuestions,
        ].sort(
          () => Math.random() - 0.5
        );
      }

      setQuestions(finalQuestions);

      setTimeLeft(
        Number(
          examData.duration_minutes || 0
        ) * 60
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดแบบทดสอบได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (examId) {
      void loadExam();
    }
  }, [examId]);

  const currentQuestion =
    questions[currentIndex];

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  /*
  |--------------------------------------------------------------------------
  | เลือกคำตอบ
  |--------------------------------------------------------------------------
  */

  function selectAnswer(
    value: "A" | "B" | "C" | "D"
  ) {
    if (
      !currentQuestion ||
      finished ||
      savingResult ||
      alreadyPassed
    ) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | บันทึกผลสอบ
  |--------------------------------------------------------------------------
  */

  async function saveExamResult(
    finalScore: number,
    finalPercent: number,
    finalMaxScore: number
  ) {
    if (
      !exam ||
      resultSaved ||
      savingResult
    ) {
      return;
    }

    try {
      setSavingResult(true);

      /*
      |--------------------------------------------------------------------------
      | สำคัญที่สุด
      |--------------------------------------------------------------------------
      | ดึงสมาชิกใหม่ตอนส่งข้อสอบ
      |--------------------------------------------------------------------------
      */

      const member =
        await getCurrentMember();

      if (!member?.id) {
        alert(
          "ไม่พบข้อมูลสมาชิกที่เข้าสู่ระบบ\nกรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่ก่อนทำแบบทดสอบ"
        );

        return;
      }

      const memberName =
        getMemberDisplayName(member);

      if (!memberName) {
        alert(
          "ไม่พบชื่อสมาชิก กรุณาเข้าสู่ระบบใหม่"
        );

        return;
      }

      const department =
        member.department ||
        exam.department ||
        "";

      const passed =
        finalPercent >=
        Number(
          exam.passing_percent || 0
        );

      /*
      |--------------------------------------------------------------------------
      | บันทึกผลโดยบังคับใช้ member.id
      |--------------------------------------------------------------------------
      */

      const resultPayload = {
        exam_id: exam.id,
        member_id: member.id,
        member_name: memberName,
        department,
        score: finalScore,
        total_score: finalMaxScore,
        percent: finalPercent,
        passed,
      };

      console.log(
        "กำลังบันทึกผลสอบ:",
        resultPayload
      );

      const {
        error: resultError,
      } = await supabase
        .from("exam_results")
        .insert(resultPayload);

      if (resultError) {
        console.error(
          "บันทึกผลสอบไม่สำเร็จ:",
          resultError
        );

        alert(
          `บันทึกผลสอบไม่สำเร็จ\n${resultError.message}`
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | บันทึก Member ID กลับ localStorage
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "warithep_learning_member_id",
        member.id
      );

      localStorage.setItem(
        "warithep_learning_member",
        JSON.stringify(member)
      );

      localStorage.setItem(
        "warithep_learning_login_name",
        memberName
      );

      setResultSaved(true);

      if (passed) {
        setAlreadyPassed(true);
        setPassedPercent(
          finalPercent
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        "เกิดข้อผิดพลาดขณะบันทึกผลการสอบ"
      );
    } finally {
      setSavingResult(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | คำนวณคะแนน
  |--------------------------------------------------------------------------
  */

  async function calculateResult() {
    if (
      !exam ||
      finished ||
      savingResult
    ) {
      return;
    }

    let total = 0;
    let calculatedMaxScore = 0;

    questions.forEach((question) => {
      const questionScore =
        Number(question.score || 0);

      calculatedMaxScore +=
        questionScore;

      if (
        answers[question.id] ===
        question.correct_answer
      ) {
        total += questionScore;
      }
    });

    const resultPercent =
      calculatedMaxScore > 0
        ? (total /
            calculatedMaxScore) *
          100
        : 0;

    setScore(total);
    setMaxScore(
      calculatedMaxScore
    );
    setPercent(resultPercent);
    setFinished(true);

    await saveExamResult(
      total,
      resultPercent,
      calculatedMaxScore
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ข้อต่อไป
  |--------------------------------------------------------------------------
  */

  async function nextQuestion() {
    if (!currentQuestion) return;

    if (!answers[currentQuestion.id]) {
      alert(
        "กรุณาเลือกคำตอบก่อน"
      );
      return;
    }

    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (current) => current + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      await calculateResult();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ข้อก่อนหน้า
  |--------------------------------------------------------------------------
  */

  function previousQuestion() {
    if (currentIndex === 0) return;

    setCurrentIndex(
      (current) => current - 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Timer
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      loading ||
      checkingPreviousResult ||
      finished ||
      savingResult ||
      alreadyPassed ||
      timeLeft <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setTimeLeft((current) => {
          if (current <= 1) {
            window.clearInterval(
              timer
            );

            setTimeout(() => {
              void calculateResult();
            }, 0);

            return 0;
          }

          return current - 1;
        });
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    loading,
    checkingPreviousResult,
    finished,
    savingResult,
    alreadyPassed,
    timeLeft,
  ]);

  /*
  |--------------------------------------------------------------------------
  | เวลา
  |--------------------------------------------------------------------------
  */

  function formatTime(
    seconds: number
  ) {
    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  /*
  |--------------------------------------------------------------------------
  | เริ่มใหม่
  |--------------------------------------------------------------------------
  */

  function restartExam() {
    window.location.reload();
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (
    loading ||
    checkingPreviousResult
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fd] p-6">
        <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-sm">
          <div className="text-4xl">
            📝
          </div>

          <div className="mt-4 text-sm font-bold text-slate-500">
            กำลังตรวจสอบสิทธิ์การทำแบบทดสอบ...
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ผ่านแล้ว
  |--------------------------------------------------------------------------
  */

  if (
    alreadyPassed &&
    !finished &&
    exam
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fd] p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-emerald-200 bg-white shadow-xl">

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-14 text-center sm:px-10">

            <div className="text-7xl">
              🎉
            </div>

            <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
              ผ่านแบบทดสอบแล้ว
            </h1>

            <p className="mt-3 text-sm font-medium text-white/85">
              {exam.title}
            </p>

          </div>

          <div className="p-6 sm:p-10">

            <div className="rounded-3xl bg-emerald-50 p-6 text-center">

              <div className="text-sm font-bold text-emerald-700">
                คุณผ่านแบบทดสอบบทนี้เรียบร้อยแล้ว
              </div>

              {passedPercent !== null && (
                <div className="mt-3 text-4xl font-black text-emerald-700">
                  {passedPercent.toFixed(
                    1
                  )}
                  %
                </div>
              )}

              <div className="mt-2 text-xs text-emerald-600">
                ระบบไม่อนุญาตให้ทำแบบทดสอบบทนี้ซ้ำ
              </div>

            </div>

            <div className="mt-6">
              <Link
                href="/exams"
                className="flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white hover:bg-blue-700"
              >
                ← กลับหน้าแบบทดสอบ
              </Link>
            </div>

          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (
    error ||
    !exam ||
    questions.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fd] p-6">

        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black">
            ไม่สามารถเปิดแบบทดสอบได้
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "ไม่พบข้อมูลแบบทดสอบ"}
          </p>

          <Link
            href="/exams"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white"
          >
            ← กลับหน้าแบบทดสอบ
          </Link>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RESULT
  |--------------------------------------------------------------------------
  */

  if (finished) {
    const passed =
      percent >=
      Number(
        exam.passing_percent || 0
      );

    return (
      <main className="min-h-screen bg-[#f6f9fd] px-4 py-8 sm:px-6 sm:py-12">

        <div className="mx-auto max-w-2xl">

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl">

            <div
              className={`px-6 py-12 text-center sm:px-10 ${
                passed
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                  : "bg-gradient-to-br from-blue-600 to-blue-800"
              }`}
            >

              <div className="text-6xl">
                {passed
                  ? "🎉"
                  : "📝"}
              </div>

              <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
                {passed
                  ? "ผ่านการทดสอบ"
                  : "สิ้นสุดการทดสอบ"}
              </h1>

              <p className="mt-2 text-sm font-medium text-white/80">
                {exam.title}
              </p>

              <div className="mt-3 text-xs font-bold text-white/70">
                {savingResult
                  ? "กำลังบันทึกผลการสอบ..."
                  : resultSaved
                    ? "✓ บันทึกผลการสอบเรียบร้อย"
                    : ""}
              </div>

            </div>

            <div className="p-6 sm:p-10">

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="text-xs font-bold text-slate-400">
                    คะแนนที่ได้
                  </div>

                  <div className="mt-2 text-3xl font-black text-slate-900">
                    {score}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    จาก {maxScore}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="text-xs font-bold text-slate-400">
                    เปอร์เซ็นต์
                  </div>

                  <div className="mt-2 text-3xl font-black text-blue-600">
                    {percent.toFixed(
                      1
                    )}
                    %
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="text-xs font-bold text-slate-400">
                    เกณฑ์ผ่าน
                  </div>

                  <div className="mt-2 text-3xl font-black text-slate-900">
                    {
                      exam.passing_percent
                    }
                    %
                  </div>
                </div>

              </div>

              <div
                className={`mt-5 rounded-2xl p-4 text-center text-sm font-black ${
                  passed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passed
                  ? "✓ ขอแสดงความยินดี คุณผ่านเกณฑ์การทดสอบ"
                  : "ยังไม่ผ่านเกณฑ์ สามารถกลับไปทบทวนเนื้อหาและทำแบบทดสอบใหม่ได้"}
              </div>

              {exam.show_answers && (
                <div className="mt-6 rounded-2xl border border-slate-200 p-5">

                  <h2 className="font-black">
                    เฉลย
                  </h2>

                  <div className="mt-4 space-y-3">

                    {questions.map(
                      (question) => {
                        const correct =
                          answers[
                            question.id
                          ] ===
                          question.correct_answer;

                        return (
                          <div
                            key={
                              question.id
                            }
                            className={`rounded-xl p-4 ${
                              correct
                                ? "bg-emerald-50"
                                : "bg-red-50"
                            }`}
                          >

                            <div className="text-sm font-black">
                              ข้อ{" "}
                              {
                                question.question_no
                              }
                            </div>

                            <div className="mt-1 text-xs text-slate-600">
                              คำตอบที่ถูกต้อง:{" "}
                              {
                                question.correct_answer
                              }
                            </div>

                            <div className="mt-1 text-xs font-bold">
                              {correct
                                ? "✓ ตอบถูก"
                                : "✕ ตอบผิด"}
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/exams"
                  className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  ← แบบทดสอบทั้งหมด
                </Link>

                {!passed && (
                  <button
                    type="button"
                    onClick={
                      restartExam
                    }
                    className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white hover:bg-blue-700"
                  >
                    🔄 ทำแบบทดสอบอีกครั้ง
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EXAM
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#f6f9fd] text-slate-900">

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <div className="min-w-0">

            <Link
              href="/exams"
              className="text-xs font-bold text-blue-600"
            >
              ← แบบทดสอบ
            </Link>

            <h1 className="mt-1 truncate text-sm font-black sm:text-lg">
              {exam.title}
            </h1>

          </div>

          <div
            className={`shrink-0 rounded-2xl px-4 py-2 text-center ${
              timeLeft <= 60
                ? "bg-red-100 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >

            <div className="text-[9px] font-black tracking-wider">
              TIME
            </div>

            <div className="text-lg font-black tabular-nums">
              {formatTime(
                timeLeft
              )}
            </div>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between text-xs font-bold">

            <span>
              ข้อ{" "}
              {currentIndex + 1} /{" "}
              {questions.length}
            </span>

            <span className="text-blue-600">
              ตอบแล้ว{" "}
              {answeredCount} /{" "}
              {questions.length}
            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${
                  ((currentIndex + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
              {
                currentQuestion.question_no
              }
            </div>

            <h2 className="text-lg font-black leading-7 sm:text-2xl sm:leading-9">
              {
                currentQuestion.question_text
              }
            </h2>

          </div>

          <div className="mt-7 space-y-3">

            {[
              [
                "A",
                currentQuestion.choice_a,
              ],
              [
                "B",
                currentQuestion.choice_b,
              ],
              [
                "C",
                currentQuestion.choice_c,
              ],
              [
                "D",
                currentQuestion.choice_d,
              ],
            ].map(
              ([letter, text]) => {

                const selected =
                  answers[
                    currentQuestion.id
                  ] === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() =>
                      selectAnswer(
                        letter as
                          | "A"
                          | "B"
                          | "C"
                          | "D"
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5 ${
                      selected
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {letter}
                    </span>

                    <span className="text-sm font-semibold leading-6 sm:text-base">
                      {text}
                    </span>

                  </button>
                );
              }
            )}

          </div>

          <div className="mt-8 flex gap-3">

            <button
              type="button"
              onClick={
                previousQuestion
              }
              disabled={
                currentIndex === 0
              }
              className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← ก่อนหน้า
            </button>

            <button
              type="button"
              onClick={
                nextQuestion
              }
              disabled={
                savingResult
              }
              className="flex-1 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingResult
                ? "กำลังบันทึก..."
                : currentIndex ===
                    questions.length - 1
                  ? "ส่งคำตอบ ✓"
                  : "ข้อถัดไป →"}
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}
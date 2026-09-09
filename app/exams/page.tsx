"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  title: string;
  department: string;
  description: string | null;
  question_count: number;
  passing_percent: number;
  published: boolean;
};

type ExamResult = {
  exam_id: string;
  passed: boolean;
};

type Member = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  department?: string | null;
};

const departments = [
  "ทั้งหมด",
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

const departmentIcons: Record<string, string> = {
  "ฝ่ายสำนักบริหารกลาง": "🏢",
  "ฝ่ายบริหารทรัพยากรมนุษย์": "👥",
  "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร": "📣",
  "ฝ่ายจัดซื้อจัดจ้าง": "🛒",
  "ฝ่ายวิศวกรรม": "⚙️",
  "ฝ่ายคลังสินค้า": "📦",
  "ฝ่ายการขายและการตลาด": "📈",
  "ฝ่ายการเงิน": "💳",
  "ฝ่ายบัญชี": "🧾",
  "ฝ่ายการภาษี": "📑",
  "ฝ่ายเทคโนโลยีสารสนเทศ": "💻",
  "ฝ่ายตรวจสอบภายใน": "🔍",
  "ฝ่ายบริหารโครงการ": "📊",
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] =
    useState("ทั้งหมด");

  const [search, setSearch] = useState("");

  // exam_id ที่สมาชิกคนนี้สอบผ่านแล้ว
  const [passedExams, setPassedExams] =
    useState<Record<string, boolean>>({});

  // =========================================================
  // หา Member ปัจจุบัน
  // ใช้วิธีเดียวกับหน้า /exams/[id]
  // =========================================================

  async function getCurrentMember(): Promise<Member | null> {
    try {
      // -----------------------------------------------------
      // 1. ลองหา member_id จาก localStorage
      // -----------------------------------------------------

      const memberIdKeys = [
        "warithep_learning_member_id",
        "warithep_member_id",
        "member_id",
        "current_member_id",
      ];

      for (const key of memberIdKeys) {
        const storedId = localStorage.getItem(key);

        if (!storedId) continue;

        const { data, error } = await supabase
          .from("members")
          .select("id,name,full_name,department")
          .eq("id", storedId)
          .maybeSingle();

        if (!error && data) {
          return data as Member;
        }
      }

      // -----------------------------------------------------
      // 2. ถ้าไม่มี ID ให้หาโดยใช้ชื่อ
      // -----------------------------------------------------

      const nameKeys = [
        "warithep_learning_login_name",
        "warithep_learning_member",
        "warithep_learning_user",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      for (const key of nameKeys) {
        const storedValue = localStorage.getItem(key);

        if (!storedValue) continue;

        let storedName = storedValue;

        // ถ้าเป็น JSON
        try {
          const parsed = JSON.parse(storedValue);

          if (typeof parsed === "string") {
            storedName = parsed;
          } else if (parsed && typeof parsed === "object") {
            storedName =
              parsed.name ||
              parsed.full_name ||
              parsed.member_name ||
              "";
          }
        } catch {
          // เป็นข้อความธรรมดา ใช้ต่อได้เลย
        }

        if (!storedName) continue;

        const safeName = storedName.replace(/,/g, "");

        const { data, error } = await supabase
          .from("members")
          .select("id,name,full_name,department")
          .or(
            `name.eq.${safeName},full_name.eq.${safeName}`
          )
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return data as Member;
        }
      }

      return null;
    } catch (error) {
      console.error(
        "Get current member error:",
        error
      );

      return null;
    }
  }

  // =========================================================
  // โหลดแบบทดสอบ + ผลสอบ
  // =========================================================

  async function loadExams() {
    try {
      setLoading(true);

      // -----------------------------------------------------
      // โหลดแบบทดสอบ
      // -----------------------------------------------------

      const { data: examData, error: examError } =
        await supabase
          .from("exams")
          .select(
            "id,title,department,description,question_count,passing_percent,published"
          )
          .eq("published", true)
          .order("created_at", {
            ascending: false,
          });

      if (examError) {
        console.error(
          "Load exams error:",
          examError
        );

        setExams([]);
        return;
      }

      setExams(examData ?? []);

      // -----------------------------------------------------
      // หาสมาชิกที่กำลัง Login
      // -----------------------------------------------------

      const member = await getCurrentMember();

      if (!member?.id) {
        console.log(
          "ไม่พบสมาชิกปัจจุบัน จึงไม่สามารถโหลดผลสอบได้"
        );

        setPassedExams({});
        return;
      }

      console.log(
        "Current member:",
        member.id,
        member.name || member.full_name
      );

      // -----------------------------------------------------
      // โหลดผลสอบของสมาชิกคนนี้
      // -----------------------------------------------------

      const { data: resultData, error: resultError } =
        await supabase
          .from("exam_results")
          .select("exam_id,passed")
          .eq("member_id", member.id);

      if (resultError) {
        console.error(
          "Load exam results error:",
          resultError
        );

        setPassedExams({});
        return;
      }

      console.log(
        "Exam results:",
        resultData
      );

      // -----------------------------------------------------
      // สร้างรายการเฉพาะบทที่สอบผ่าน
      // -----------------------------------------------------

      const passedMap: Record<string, boolean> = {};

      (resultData as ExamResult[] | null)?.forEach(
        (result) => {
          if (result.passed === true) {
            passedMap[result.exam_id] = true;
          }
        }
      );

      console.log(
        "Passed exams:",
        passedMap
      );

      setPassedExams(passedMap);
    } catch (error) {
      console.error(
        "Load exams error:",
        error
      );

      setExams([]);
      setPassedExams({});
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // โหลดเมื่อเปิดหน้า
  // =========================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadExams();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredExams = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchDepartment =
        selectedDepartment === "ทั้งหมด" ||
        exam.department === selectedDepartment;

      const matchSearch =
        !keyword ||
        exam.title
          .toLowerCase()
          .includes(keyword) ||
        exam.department
          .toLowerCase()
          .includes(keyword);

      return (
        matchDepartment &&
        matchSearch
      );
    });
  }, [
    exams,
    selectedDepartment,
    search,
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f9fd] text-slate-900">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto max-w-[1500px] px-4 sm:px-5 md:px-8">

          <div className="flex h-[64px] items-center justify-between sm:h-[72px]">

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 sm:gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/15 sm:h-11 sm:w-11 sm:rounded-2xl">
                <span className="text-xl sm:text-2xl">
                  🎓
                </span>
              </div>

              <div className="leading-tight">

                <div className="text-base font-black text-slate-900 sm:text-lg">
                  วารีเทพ
                </div>

                <div className="text-[9px] font-black tracking-[0.2em] text-blue-600 sm:text-[10px]">
                  LEARNING
                </div>

              </div>

            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-3 md:gap-6">

              <Link
                href="/courses"
                className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-600 sm:flex"
              >
                📚 หลักสูตร
              </Link>

              <Link
                href="/knowledge"
                className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-600 md:flex"
              >
                🎥 วิดีโอ
              </Link>

              <Link
                href="/ranking"
                className="flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-blue-600 sm:text-sm"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-lg transition hover:bg-blue-100 sm:h-10 sm:w-10"
              >
                👤
              </Link>

            </nav>

          </div>

        </div>

      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-100 bg-white">

        <div className="pointer-events-none absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-blue-100/50 blur-3xl sm:h-[500px] sm:w-[500px]" />

        <div className="pointer-events-none absolute -left-32 top-32 h-[300px] w-[300px] rounded-full bg-sky-100/40 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-7 pt-8 sm:px-5 sm:pb-8 sm:pt-10 md:px-8 md:pb-10 md:pt-14">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 sm:mb-5 sm:px-3.5 sm:py-2 sm:text-xs">

            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2" />

            LEARNING CENTER

          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <h1 className="text-[28px] font-black leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-5xl">
                แบบทดสอบ
              </h1>

              <p className="mt-2.5 text-sm leading-6 text-slate-500 sm:mt-3 sm:text-base md:text-lg">
                ทดสอบความรู้และประเมินความเข้าใจจากการเรียนรู้
              </p>

            </div>

            <Link
              href="/dashboard"
              className="group inline-flex w-fit items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md sm:px-5 sm:py-3.5"
            >

              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>

              Dashboard

            </Link>

          </div>

          <div className="mt-6 max-w-3xl sm:mt-8">

            <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:shadow-md sm:h-14 sm:px-4">

              <span className="mr-2.5 text-lg sm:mr-3 sm:text-xl">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ค้นหาแบบทดสอบหรือฝ่าย..."
                className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm"
              />

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================== */}
      {/* FILTER */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pt-4 sm:px-5 sm:pt-5 md:px-8">

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-3">

          {departments.map((department) => {

            const active =
              selectedDepartment === department;

            return (

              <button
                key={department}
                type="button"
                onClick={() =>
                  setSelectedDepartment(
                    department
                  )
                }
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[10px] font-bold transition-all sm:px-4 sm:py-2.5 sm:text-xs ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                }`}
              >

                {department !== "ทั้งหมด" && (
                  <span className="mr-1">
                    {departmentIcons[
                      department
                    ]}
                  </span>
                )}

                {department}

              </button>

            );

          })}

        </div>

      </section>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-16 pt-4 sm:px-5 sm:pb-20 sm:pt-5 md:px-8">

        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">

          <div>

            <div className="text-[10px] font-black tracking-[0.18em] text-blue-600 sm:text-xs">
              EXAM CENTER
            </div>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
              แบบทดสอบทั้งหมด
            </h2>

          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm sm:px-4 sm:py-2 sm:text-xs">

            {loading
              ? "กำลังโหลด..."
              : `${filteredExams.length} แบบทดสอบ`}

          </div>

        </div>

        {/* ===================================================== */}
        {/* LOADING */}
        {/* ===================================================== */}

        {loading ? (

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (

                <div
                  key={item}
                  className="h-[300px] animate-pulse rounded-[22px] border border-slate-200 bg-white sm:h-[310px] sm:rounded-[26px]"
                />

              )
            )}

          </div>

        ) : filteredExams.length === 0 ? (

          <div className="relative overflow-hidden rounded-[24px] border border-blue-100 bg-white px-5 py-16 text-center shadow-sm sm:rounded-[30px] sm:px-6 sm:py-20">

            <div className="relative">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue-50 text-3xl sm:h-20 sm:w-20 sm:rounded-[24px] sm:text-4xl">
                📝
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900 sm:mt-6 sm:text-2xl">
                ยังไม่มีแบบทดสอบ
              </h2>

              <p className="mx-auto mt-2.5 max-w-lg text-xs leading-6 text-slate-500 sm:mt-3 sm:text-sm sm:leading-7">
                เมื่อผู้ดูแลระบบสร้างและเผยแพร่แบบทดสอบแล้ว
                แบบทดสอบจะปรากฏในหน้านี้
              </p>

              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-2 text-[10px] font-semibold text-slate-400 sm:mt-6 sm:px-4 sm:text-xs">
                📋 รอแบบทดสอบจากผู้ดูแลระบบ
              </div>

            </div>

          </div>

        ) : (

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredExams.map((exam) => {

              const icon =
                departmentIcons[
                  exam.department
                ] || "📝";

              const passed =
                passedExams[exam.id] === true;

              return (

                <article
                  key={exam.id}
                  className={`group relative overflow-hidden rounded-[22px] border bg-white shadow-sm transition-all duration-300 sm:rounded-[26px] ${
                    passed
                      ? "border-green-300 bg-green-50/60 shadow-green-100"
                      : "border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  }`}
                >

                  {/* ================================================= */}
                  {/* HEADER */}
                  {/* ================================================= */}

                  <div
                    className={`relative h-[150px] overflow-hidden sm:h-[165px] ${
                      passed
                        ? "bg-gradient-to-br from-[#16a34a] via-[#22c55e] to-[#15803d]"
                        : "bg-gradient-to-br from-[#2f7df4] via-[#4f93f7] to-[#3973dd]"
                    }`}
                  >

                    <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-100/10 blur-3xl" />

                    {/* ================================================= */}
                    {/* PASSED BADGE */}
                    {/* ================================================= */}

                    {passed && (

                      <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">

                        <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-[10px] font-black text-white shadow-sm backdrop-blur-md sm:text-xs">

                          <span>✓</span>

                          ผ่านแล้ว

                        </div>

                      </div>

                    )}

                    {/* DEPARTMENT */}

                    <div className="absolute right-3 top-3 max-w-[58%] sm:right-4 sm:top-4">

                      <div className="rounded-full border border-white/25 bg-white/20 px-2.5 py-1.5 backdrop-blur-sm sm:px-3">

                        <span className="block truncate text-[8px] font-black tracking-wide text-white sm:text-[10px]">
                          {exam.department}
                        </span>

                      </div>

                    </div>

                    {/* ICON */}

                    <div className="absolute left-4 top-4 sm:left-5 sm:top-5">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/20 text-2xl shadow-sm backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl sm:text-3xl ${
                          passed
                            ? "mt-9 sm:mt-9"
                            : ""
                        }`}
                      >

                        {passed ? "🏆" : icon}

                      </div>

                    </div>

                    {/* TITLE */}

                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">

                      <div className="mb-1 text-[8px] font-black tracking-[0.17em] text-white/75 sm:mb-1.5 sm:text-[9px]">

                        {passed
                          ? "COMPLETED"
                          : "KNOWLEDGE TEST"}

                      </div>

                      <h3 className="line-clamp-2 text-[15px] font-black leading-[1.3] text-white sm:text-[17px]">
                        {exam.title}
                      </h3>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* BODY */}
                  {/* ================================================= */}

                  <div className="p-4 sm:p-5">

                    <p className="line-clamp-2 min-h-[44px] text-xs leading-5 text-slate-500 sm:min-h-[48px] sm:text-sm sm:leading-6">

                      {passed
                        ? "คุณผ่านแบบทดสอบบทนี้เรียบร้อยแล้ว"
                        : exam.description ||
                          "แบบทดสอบเพื่อประเมินความรู้และความเข้าใจ"}

                    </p>

                    {/* INFO */}

                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">

                      <div
                        className={`rounded-xl border p-3 sm:rounded-2xl sm:p-3.5 ${
                          passed
                            ? "border-green-100 bg-green-50"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >

                        <div className="text-[10px] font-semibold text-slate-400 sm:text-[11px]">
                          จำนวนข้อ
                        </div>

                        <div
                          className={`mt-1 text-xl font-black sm:text-2xl ${
                            passed
                              ? "text-green-700"
                              : "text-slate-900"
                          }`}
                        >
                          {exam.question_count}
                        </div>

                      </div>

                      <div
                        className={`rounded-xl border p-3 sm:rounded-2xl sm:p-3.5 ${
                          passed
                            ? "border-green-100 bg-green-50"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >

                        <div className="text-[10px] font-semibold text-slate-400 sm:text-[11px]">
                          เกณฑ์ผ่าน
                        </div>

                        <div
                          className={`mt-1 text-xl font-black sm:text-2xl ${
                            passed
                              ? "text-green-700"
                              : "text-slate-900"
                          }`}
                        >
                          {exam.passing_percent}%
                        </div>

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* BUTTON */}
                    {/* ================================================= */}

                    {passed ? (

                      <div className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-xs font-black text-green-700 sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-3.5 sm:text-sm">

                        <span>🔒</span>

                        <span>
                          ผ่านแล้ว • ไม่สามารถทำซ้ำ
                        </span>

                        <span>✓</span>

                      </div>

                    ) : (

                      <Link
                        href={`/exams/${exam.id}`}
                        className="group/button mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-md shadow-blue-500/15 transition-all hover:bg-blue-700 hover:shadow-lg sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-3.5 sm:text-sm"
                      >

                        <span>📝</span>

                        <span>
                          เริ่มทำแบบทดสอบ
                        </span>

                        <span className="transition-transform group-hover/button:translate-x-1">
                          →
                        </span>

                      </Link>

                    )}

                  </div>

                </article>

              );

            })}

          </div>

        )}

      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-4 py-6 sm:px-5 sm:py-7 md:flex-row md:px-8">

          <div className="text-xs font-bold text-slate-500 sm:text-sm">
            🎓 วารีเทพ Learning
          </div>

          <div className="text-[10px] text-slate-400 sm:text-xs">
            Learning • Development • Growth
          </div>

        </div>

      </footer>

    </main>
  );
}
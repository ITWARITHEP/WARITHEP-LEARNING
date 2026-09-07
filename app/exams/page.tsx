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
  passing_score: number;
  published: boolean;
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

  /*
   * โหลดแบบทดสอบ
   *
   * ประกาศฟังก์ชันก่อน useEffect
   * เพื่อไม่ให้ ESLint ฟ้องว่า
   * "loadExams accessed before declared"
   */
  async function loadExams() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("exams")
        .select(
          "id,title,department,description,question_count,passing_score,published"
        )
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Load exams error:", error);
        setExams([]);
        return;
      }

      setExams(data ?? []);
    } catch (error) {
      console.error("Load exams error:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadExams();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredExams = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchDepartment =
        selectedDepartment === "ทั้งหมด" ||
        exam.department === selectedDepartment;

      const matchSearch =
        !keyword ||
        exam.title.toLowerCase().includes(keyword) ||
        exam.department.toLowerCase().includes(keyword);

      return matchDepartment && matchSearch;
    });
  }, [exams, selectedDepartment, search]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20">
                <span className="relative text-2xl">🎓</span>
              </div>

              <div className="leading-tight">
                <div className="text-lg font-black text-slate-900">
                  วารีเทพ
                </div>

                <div className="text-[10px] font-black tracking-[0.22em] text-blue-600">
                  LEARNING
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-2 md:gap-6">
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
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition hover:bg-blue-100"
              >
                👤
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-32 -top-40 h-[550px] w-[550px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -left-40 top-32 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="pointer-events-none absolute right-[18%] top-8 text-[180px] leading-none text-blue-500/[0.025]">
          ❄
        </div>

        <div className="mx-auto max-w-[1500px] px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-black text-blue-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            LEARNING CENTER
          </div>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                แบบทดสอบ
              </h1>

              <p className="mt-3 text-base text-slate-500 md:text-lg">
                ทดสอบความรู้และประเมินความเข้าใจจากการเรียนรู้
              </p>
            </div>

            <Link
              href="/dashboard"
              className="group inline-flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              Dashboard
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mt-8 max-w-3xl">
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:shadow-lg">
              <span className="mr-3 text-xl">🔎</span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาแบบทดสอบหรือฝ่าย..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENT FILTER */}
      <section className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {departments.map((department) => {
            const active =
              selectedDepartment === department;

            return (
              <button
                key={department}
                type="button"
                onClick={() =>
                  setSelectedDepartment(department)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                }`}
              >
                {department !== "ทั้งหมด" && (
                  <span className="mr-1">
                    {departmentIcons[department]}
                  </span>
                )}

                {department}
              </button>
            );
          })}
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1500px] px-5 pb-20 pt-4 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[0.2em] text-blue-600">
              EXAM CENTER
            </div>

            <h2 className="mt-1 text-2xl font-black md:text-3xl">
              แบบทดสอบทั้งหมด
            </h2>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
            {loading
              ? "กำลังโหลด..."
              : `${filteredExams.length} แบบทดสอบ`}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[310px] animate-pulse rounded-[26px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          /* EMPTY */
          <div className="relative overflow-hidden rounded-[30px] border border-blue-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-16 text-[180px] leading-none text-blue-500/[0.035]">
              ❄
            </div>

            <div className="pointer-events-none absolute -bottom-20 -left-10 text-[150px] leading-none text-blue-500/[0.025]">
              ❄
            </div>

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl shadow-inner">
                📝
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900">
                ยังไม่มีแบบทดสอบ
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                เมื่อผู้ดูแลระบบสร้างและเผยแพร่แบบทดสอบแล้ว
                แบบทดสอบจะปรากฏในหน้านี้
              </p>

              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400">
                <span>📋</span>
                รอแบบทดสอบจากผู้ดูแลระบบ
              </div>
            </div>
          </div>
        ) : (
          /* EXAM CARDS */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredExams.map((exam) => {
              const icon =
                departmentIcons[exam.department] || "📝";

              return (
                <article
                  key={exam.id}
                  className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-900/10"
                >
                  {/* BLUE HEADER */}
                  <div className="relative h-[165px] overflow-hidden bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7]">
                    <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

                    <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />

                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -right-4 -top-12 rotate-12 text-[145px] leading-none text-white/[0.065]">
                        ❄
                      </div>

                      <div className="absolute bottom-[-45px] right-20 -rotate-12 text-[100px] leading-none text-white/[0.045]">
                        ❄
                      </div>

                      <div className="absolute -bottom-[55px] -left-8 rotate-12 text-[120px] leading-none text-white/[0.03]">
                        ❄
                      </div>
                    </div>

                    {/* DEPARTMENT */}
                    <div className="absolute right-4 top-4">
                      <div className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 backdrop-blur-md">
                        <span className="text-[10px] font-black tracking-wide text-white">
                          {exam.department}
                        </span>
                      </div>
                    </div>

                    {/* ICON */}
                    <div className="absolute left-5 top-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-3xl shadow-xl backdrop-blur-md">
                        {icon}
                      </div>
                    </div>

                    {/* TITLE */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="mb-1.5 text-[9px] font-black tracking-[0.2em] text-blue-100/80">
                        KNOWLEDGE TEST
                      </div>

                      <h3 className="line-clamp-2 text-[17px] font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                        {exam.title}
                      </h3>
                    </div>

                    {/* SHINE */}
                    <div className="absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out group-hover:left-[120%]" />
                  </div>

                  {/* BODY */}
                  <div className="p-5">
                    <p className="line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                      {exam.description ||
                        "แบบทดสอบเพื่อประเมินความรู้และความเข้าใจ"}
                    </p>

                    {/* INFO */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="text-[11px] font-semibold text-slate-400">
                          จำนวนข้อ
                        </div>

                        <div className="mt-1 text-2xl font-black text-slate-900">
                          {exam.question_count}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="text-[11px] font-semibold text-slate-400">
                          เกณฑ์ผ่าน
                        </div>

                        <div className="mt-1 text-2xl font-black text-slate-900">
                          {exam.passing_score}%
                        </div>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <Link
                      href={`/exams/${exam.id}`}
                      className="group/button mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
                    >
                      <span>📝</span>

                      <span>เริ่มทำแบบทดสอบ</span>

                      <span className="transition-transform group-hover/button:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-5 py-7 md:flex-row md:px-8">
          <div className="text-sm font-bold text-slate-500">
            🎓 วารีเทพ Learning
          </div>

          <div className="text-xs text-slate-400">
            Learning • Development • Growth
          </div>
        </div>
      </footer>
    </main>
  );
}
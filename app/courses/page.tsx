"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Department = {
  id: string;
  name: string;
  icon: string;
  code: string;
};

const departments: Department[] = [
  {
    id: "1",
    name: "ฝ่ายสำนักบริหารกลาง",
    icon: "🏢",
    code: "01",
  },
  {
    id: "2",
    name: "ฝ่ายบริหารทรัพยากรมนุษย์",
    icon: "👥",
    code: "02",
  },
  {
    id: "3",
    name: "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
    icon: "🎓",
    code: "03",
  },
  {
    id: "4",
    name: "ฝ่ายจัดซื้อจัดจ้าง",
    icon: "🛒",
    code: "04",
  },
  {
    id: "5",
    name: "ฝ่ายวิศวกรรม",
    icon: "⚙️",
    code: "05",
  },
  {
    id: "6",
    name: "ฝ่ายคลังสินค้า",
    icon: "📦",
    code: "06",
  },
  {
    id: "7",
    name: "ฝ่ายการขายและการตลาด",
    icon: "📈",
    code: "07",
  },
  {
    id: "8",
    name: "ฝ่ายการเงิน",
    icon: "💳",
    code: "08",
  },
  {
    id: "9",
    name: "ฝ่ายบัญชี",
    icon: "🧾",
    code: "09",
  },
  {
    id: "10",
    name: "ฝ่ายการภาษี",
    icon: "📑",
    code: "10",
  },
  {
    id: "11",
    name: "ฝ่ายเทคโนโลยีสารสนเทศ",
    icon: "💻",
    code: "11",
  },
  {
    id: "12",
    name: "ฝ่ายตรวจสอบภายใน",
    icon: "🔍",
    code: "12",
  },
  {
    id: "13",
    name: "ฝ่ายบริหารโครงการ",
    icon: "📊",
    code: "13",
  },
];

type Stats = {
  standards: Record<string, number>;
  videos: Record<string, number>;
};

export default function CoursesPage() {
  const [stats, setStats] = useState<Stats>({
    standards: {},
    videos: {},
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          { data: standardsData, error: standardsError },
          { data: videosData, error: videosError },
        ] = await Promise.all([
          supabase
            .from("department_standards")
            .select("department")
            .eq("published", true),

          supabase
            .from("knowledge_videos")
            .select("department")
            .eq("published", true)
            .eq("category", "course"),
        ]);

        if (standardsError) {
          console.error("โหลดมาตรฐานไม่สำเร็จ:", standardsError);
        }

        if (videosError) {
          console.error("โหลดวิดีโอไม่สำเร็จ:", videosError);
        }

        const standards: Record<string, number> = {};
        const videos: Record<string, number> = {};

        (standardsData || []).forEach((item) => {
          standards[item.department] =
            (standards[item.department] || 0) + 1;
        });

        (videosData || []).forEach((item) => {
          videos[item.department] =
            (videos[item.department] || 0) + 1;
        });

        setStats({
          standards,
          videos,
        });
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter((department) =>
      department.name.toLowerCase().includes(keyword)
    );
  }, [search]);

  const totalStandards = Object.values(stats.standards).reduce(
    (sum, value) => sum + value,
    0
  );

  const totalVideos = Object.values(stats.videos).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-5 md:px-8">
          <div className="flex h-[64px] items-center justify-between sm:h-[72px]">
            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 sm:gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-600/15 sm:h-11 sm:w-11 sm:rounded-2xl">
                <span className="text-xl sm:text-2xl">🎓</span>
              </div>

              <div className="leading-tight">
                <div className="text-base font-black text-slate-900 sm:text-lg">
                  วารีเทพ
                </div>

                <div className="text-[9px] font-bold tracking-[0.2em] text-blue-600 sm:text-[10px] sm:tracking-[0.22em]">
                  LEARNING
                </div>
              </div>
            </Link>

            {/* NAV */}
            <nav className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
              <Link
                href="/dashboard"
                className="hidden text-sm font-semibold text-slate-500 transition hover:text-blue-600 sm:block"
              >
                Dashboard
              </Link>

              <Link
                href="/ranking"
                className="text-xs font-semibold text-slate-500 transition hover:text-blue-600 sm:text-sm"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base transition hover:bg-blue-100 sm:h-10 sm:w-10 sm:text-lg"
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

      <section className="relative overflow-hidden">
        {/* Soft Background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-blue-400/8 blur-3xl sm:h-[500px] sm:w-[500px]" />

        <div className="pointer-events-none absolute -left-32 top-24 h-[320px] w-[320px] rounded-full bg-indigo-400/7 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-7 pt-8 sm:px-5 sm:pb-8 sm:pt-10 md:px-8 md:pb-9 md:pt-14">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 sm:mb-5 sm:px-3.5 sm:py-2 sm:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 sm:h-2 sm:w-2" />
            LEARNING CENTER
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-3xl">
              <h1 className="text-[27px] font-black leading-[1.18] tracking-tight text-slate-950 sm:text-3xl md:text-5xl">
                ห้องเรียนวารีเทพของเรา
              </h1>

              <p className="mt-2.5 max-w-2xl text-sm leading-6 text-slate-500 sm:mt-3 sm:text-base md:text-lg">
                ศูนย์การเรียนรู้และวิดีโอสอนงาน
                สำหรับพนักงานวารีเทพ
              </p>
            </div>

            {/* SEARCH */}
            <div className="w-full lg:w-[420px]">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5">
                  <span className="text-lg text-slate-400 sm:text-xl">
                    🔎
                  </span>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาฝ่ายที่ต้องการเรียน..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[13px] outline-none shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:h-14 sm:pl-14 sm:pr-5 sm:text-sm md:text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* OVERVIEW */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-7 sm:px-5 sm:pb-9 md:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {/* หน่วยงาน */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🏢
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  หน่วยงาน
                </div>

                <div className="text-xl font-black text-slate-900 sm:text-2xl">
                  13
                </div>
              </div>
            </div>
          </div>

          {/* มาตรฐาน */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📋
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  มาตรฐาน
                </div>

                <div className="text-xl font-black text-slate-900 sm:text-2xl">
                  {loading ? "—" : totalStandards}
                </div>
              </div>
            </div>
          </div>

          {/* วิดีโอ */}
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md md:col-span-1 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🎬
              </div>

              <div>
                <div className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  วิดีโอสอนงาน
                </div>

                <div className="text-xl font-black text-slate-900 sm:text-2xl">
                  {loading ? "—" : totalVideos}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* DEPARTMENT SECTION */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-5 sm:pb-20 md:px-8">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div>
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
              เลือกฝ่ายที่ต้องการเรียน
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm">
              ห้องเรียนสอนงานแยกตามหน่วยงาน
            </p>
          </div>

          {search && (
            <div className="shrink-0 text-xs font-semibold text-slate-400 sm:text-sm">
              พบ {filteredDepartments.length} ฝ่าย
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* DEPARTMENT GRID */}
        {/* ================================================= */}

        {filteredDepartments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm sm:p-16">
            <div className="mb-4 text-4xl sm:text-5xl">🔎</div>

            <h3 className="text-base font-bold sm:text-lg">
              ไม่พบฝ่ายที่ค้นหา
            </h3>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              ลองค้นหาด้วยชื่อฝ่ายอื่น
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
            {filteredDepartments.map((department) => {
              const standardCount =
                stats.standards[department.name] || 0;

              const videoCount =
                stats.videos[department.name] || 0;

              return (
                <Link
                  key={department.id}
                  href={`/courses/${department.id}`}
                  className="group block"
                >
                  <article className="relative h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/8 sm:rounded-[28px]">
                    {/* ================================================= */}
                    {/* PREMIUM ICE BLUE HEADER */}
                    {/* ================================================= */}

                    <div className="relative h-[165px] overflow-hidden bg-gradient-to-br from-[#1f67e8] via-[#397bea] to-[#527ce0] sm:h-[180px] md:h-[185px]">
                      {/* Soft glow */}
                      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-200/12 blur-3xl" />

                      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                      {/* ================================================= */}
                      {/* ICE WATERMARK - VERY LIGHT */}
                      {/* ================================================= */}

                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-7 -top-12 rotate-12 text-[135px] leading-none text-white/[0.025] sm:text-[165px]">
                          
                        </div>

                        <div className="absolute bottom-[-55px] right-[70px] -rotate-12 text-[105px] leading-none text-white/[0.018] sm:right-[120px] sm:text-[120px]">
                          
                        </div>

                        <div className="absolute -bottom-16 -left-8 rotate-12 text-[125px] leading-none text-white/[0.015] sm:text-[145px]">
                          
                        </div>

                        {/* Crystal lines - lighter */}
                        <div className="absolute right-0 top-0 h-full w-[260px] opacity-[0.035]">
                          <div className="absolute right-24 top-5 h-48 w-px rotate-[35deg] bg-white" />
                          <div className="absolute right-24 top-5 h-48 w-px rotate-[-35deg] bg-white" />
                          <div className="absolute right-24 top-5 h-px w-48 rotate-[35deg] bg-white" />
                          <div className="absolute right-24 top-5 h-px w-48 rotate-[-35deg] bg-white" />
                        </div>

                        {/* Tiny sparkles */}
                        <div className="absolute right-20 top-12 h-1.5 w-1.5 rounded-full bg-white/20" />
                        <div className="absolute right-48 top-28 h-1 w-1 rounded-full bg-white/15" />
                        <div className="absolute bottom-10 right-28 h-1.5 w-1.5 rounded-full bg-white/15" />
                        <div className="absolute left-1/2 top-20 h-1 w-1 rounded-full bg-white/15" />
                      </div>

                      {/* ================================================= */}
                      {/* DEPARTMENT NUMBER */}
                      {/* ================================================= */}

                      <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                        <div className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 shadow-sm backdrop-blur-md sm:px-3.5">
                          <span className="text-[9px] font-black tracking-wider text-white sm:text-[11px]">
                            DEPT {department.code}
                          </span>
                        </div>
                      </div>

                      {/* ================================================= */}
                      {/* ICON */}
                      {/* ================================================= */}

                      <div className="absolute left-4 top-4 sm:left-6 sm:top-5">
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/18 shadow-md backdrop-blur-md sm:h-16 sm:w-16">
                          <span className="relative text-[29px] drop-shadow-md sm:text-[35px]">
                            {department.icon}
                          </span>
                        </div>
                      </div>

                      {/* ================================================= */}
                      {/* TEXT AREA */}
                      {/* ================================================= */}

                      <div className="absolute inset-x-0 bottom-0">
                        {/* Soft white readability layer */}
                        <div className="absolute inset-x-0 bottom-0 h-[105px] bg-gradient-to-t from-[#174fc7]/75 via-[#2466d8]/25 to-transparent" />

                        <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
                          <div className="mb-1.5 text-[8px] font-black tracking-[0.2em] text-blue-50/90 sm:text-[10px] sm:mb-2 sm:text-[11px]">
                            DEPARTMENT LEARNING
                          </div>

                          <h3 className="max-w-[90%] text-[18px] font-black leading-[1.25] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] sm:text-[20px] md:text-[21px]">
                            {department.name}
                          </h3>

                          <div className="mt-2.5 h-0.5 w-12 rounded-full bg-white/80 sm:mt-3 sm:h-1 sm:w-16" />
                        </div>
                      </div>

                      {/* Hover shine */}
                      <div className="absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-1000 ease-out group-hover:left-[120%]" />
                    </div>

                    {/* ================================================= */}
                    {/* CARD CONTENT */}
                    {/* ================================================= */}

                    <div className="p-4 sm:p-5">
                      {/* COUNTERS */}
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {/* STANDARD */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 sm:p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl">
                              📋
                            </span>

                            <span className="text-xl font-black text-slate-900 sm:text-2xl">
                              {loading ? "—" : standardCount}
                            </span>
                          </div>

                          <div className="mt-1.5 text-[11px] font-bold text-slate-500 sm:mt-2 sm:text-xs">
                            มาตรฐาน
                          </div>
                        </div>

                        {/* VIDEO */}
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3.5 sm:p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl">
                              🎬
                            </span>

                            <span className="text-xl font-black text-blue-600 sm:text-2xl">
                              {loading ? "—" : videoCount}
                            </span>
                          </div>

                          <div className="mt-1.5 text-[11px] font-bold text-blue-600/70 sm:mt-2 sm:text-xs">
                            วิดีโอสอนงาน
                          </div>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 sm:mt-5 sm:pt-4">
                        <span className="text-[10px] text-slate-400 sm:text-xs">
                          {videoCount > 0
                            ? `${videoCount} วิดีโอพร้อมเรียน`
                            : "ยังไม่มีวิดีโอ"}
                        </span>

                        <span className="shrink-0 text-xs font-black text-blue-600 transition-transform group-hover:translate-x-1 sm:text-sm">
                          เข้าห้องเรียน
                          <span className="ml-1">→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const section =
    searchParams.get("section") || "";

  const isStandards =
    section === "standards";

  const isClassroom =
    section === "classroom";

  const [stats, setStats] = useState<Stats>({
    standards: {},
    videos: {},
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /*
  |--------------------------------------------------------------------------
  | โหลดข้อมูล
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        {
          data: standardsData,
          error: standardsError,
        },
        {
          data: videosData,
          error: videosError,
        },
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
        console.error(
          "โหลดมาตรฐานไม่สำเร็จ:",
          standardsError
        );
      }

      if (videosError) {
        console.error(
          "โหลดวิดีโอไม่สำเร็จ:",
          videosError
        );
      }

      const standards: Record<string, number> = {};
      const videos: Record<string, number> = {};

      (standardsData || []).forEach((item) => {
        if (!item.department) return;

        standards[item.department] =
          (standards[item.department] || 0) + 1;
      });

      (videosData || []).forEach((item) => {
        if (!item.department) return;

        videos[item.department] =
          (videos[item.department] || 0) + 1;
      });

      setStats({
        standards,
        videos,
      });
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาด:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ค้นหาฝ่าย
  |--------------------------------------------------------------------------
  */

  const filteredDepartments = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter(
      (department) =>
        department.name
          .toLowerCase()
          .includes(keyword)
    );
  }, [search]);

  const totalStandards =
    Object.values(stats.standards).reduce(
      (sum, value) => sum + value,
      0
    );

  const totalVideos =
    Object.values(stats.videos).reduce(
      (sum, value) => sum + value,
      0
    );

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  function Header() {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-5 md:px-8">
          <div className="flex h-[64px] items-center justify-between sm:h-[72px]">

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 sm:gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-md shadow-blue-600/15 sm:h-11 sm:w-11 sm:rounded-2xl">
                <span className="text-xl sm:text-2xl">
                  🎓
                </span>
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
    );
  }

  /*
  |--------------------------------------------------------------------------
  | หน้าหลัก 2 หมวด
  |--------------------------------------------------------------------------
  */

  if (!isStandards && !isClassroom) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f5f8fc] text-slate-900">

        <Header />

        {/* HERO */}

        <section className="relative overflow-hidden">

          <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -left-32 top-32 h-[320px] w-[320px] rounded-full bg-sky-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-[1200px] px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 md:px-8 md:pt-16">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-black text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              LEARNING CENTER
            </div>

            <h1 className="text-[30px] font-black leading-[1.15] tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
              หลักสูตรสอนงาน
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base md:text-lg">
              ศูนย์การเรียนรู้ของวารีเทพ
              แบ่งเนื้อหาออกเป็น 2 ส่วน
              เพื่อให้พนักงานเรียนรู้ได้อย่างเป็นระบบ
            </p>

          </div>

        </section>

        {/* 2 CATEGORIES */}

        <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 md:px-8">

          <div className="grid gap-6 md:grid-cols-2">

            {/* ================================================= */}
            {/* STANDARD */}
            {/* ================================================= */}

            <Link
              href="/courses?section=standards"
              className="group block"
            >
              <article className="relative h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10">

                <div className="relative h-[240px] overflow-hidden bg-gradient-to-br from-[#00164d] via-[#00358f] to-[#001b5e] sm:h-[270px]">

                  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    <span className="text-[10px] font-black tracking-wider text-white">
                      CATEGORY 01
                    </span>
                  </div>

                  <div className="absolute left-6 top-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/10 shadow-lg sm:h-24 sm:w-24">
                    <span className="text-5xl sm:text-6xl">
                      📋
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#00143f] via-[#002a78]/70 to-transparent" />

                    <div className="relative px-6 pb-7 sm:px-8 sm:pb-8">

                      <div className="mb-2 text-[10px] font-black tracking-[0.2em] text-blue-100/80">
                        DEPARTMENT STANDARD
                      </div>

                      <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                        เรียนรู้มาตรฐานตามฝ่าย
                      </h2>

                      <div className="mt-3 h-1 w-16 rounded-full bg-blue-400" />

                    </div>
                  </div>

                </div>

                <div className="p-6 sm:p-7">

                  <p className="text-sm leading-6 text-slate-500 sm:text-base">
                    เรียนรู้มาตรฐานและแนวทางการทำงาน
                    ของแต่ละหน่วยงาน แยกตามฝ่าย
                  </p>

                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                        📑
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          มาตรฐานทั้งหมด
                        </p>

                        <p className="text-xl font-black text-slate-900">
                          {loading
                            ? "—"
                            : totalStandards}
                        </p>
                      </div>

                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-blue-600 transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                  <div className="mt-5 text-sm font-black text-blue-600">
                    ดูมาตรฐานตามฝ่าย →
                  </div>

                </div>

              </article>
            </Link>

            {/* ================================================= */}
            {/* CLASSROOM */}
            {/* ================================================= */}

            <Link
              href="/courses?section=classroom"
              className="group block"
            >
              <article className="relative h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10">

                <div className="relative h-[240px] overflow-hidden bg-gradient-to-br from-[#06318f] via-[#0b4fc4] to-[#082b78] sm:h-[270px]">

                  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    <span className="text-[10px] font-black tracking-wider text-white">
                      CATEGORY 02
                    </span>
                  </div>

                  <div className="absolute left-6 top-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/10 shadow-lg sm:h-24 sm:w-24">
                    <span className="text-5xl sm:text-6xl">
                      🎓
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#00143f] via-[#002a78]/65 to-transparent" />

                    <div className="relative px-6 pb-7 sm:px-8 sm:pb-8">

                      <div className="mb-2 text-[10px] font-black tracking-[0.2em] text-blue-100/80">
                        WARITHEP CLASSROOM
                      </div>

                      <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                        ห้องเรียนวารีเทพของเรา
                      </h2>

                      <div className="mt-3 h-1 w-16 rounded-full bg-blue-400" />

                    </div>
                  </div>

                </div>

                <div className="p-6 sm:p-7">

                  <p className="text-sm leading-6 text-slate-500 sm:text-base">
                    ห้องเรียนวิดีโอสอนงาน
                    สำหรับการเรียนรู้ขั้นตอนการทำงาน
                    และพัฒนาทักษะของพนักงาน
                  </p>

                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-blue-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        🎬
                      </div>

                      <div>
                        <p className="text-xs font-bold text-blue-600/60">
                          วิดีโอทั้งหมด
                        </p>

                        <p className="text-xl font-black text-blue-700">
                          {loading
                            ? "—"
                            : totalVideos}
                        </p>
                      </div>

                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-black text-blue-600 shadow-sm transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                  <div className="mt-5 text-sm font-black text-blue-600">
                    เข้าห้องเรียน →
                  </div>

                </div>

              </article>
            </Link>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-8 text-center">
            <div className="font-black text-slate-800">
              🎓 วารีเทพ Learning
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Learning • Training • Development
            </p>
          </div>
        </footer>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | หน้าเลือกฝ่าย
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f8fc] text-slate-900">

      <Header />

      {/* HERO */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 top-24 h-[320px] w-[320px] rounded-full bg-sky-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-7 pt-8 sm:px-5 sm:pb-8 sm:pt-10 md:px-8 md:pb-9 md:pt-14">

          <Link
            href="/courses"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            ← กลับหลักสูตรสอนงาน
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 sm:mb-5 sm:px-3.5 sm:py-2 sm:text-xs">

            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 sm:h-2 sm:w-2" />

            {isStandards
              ? "DEPARTMENT STANDARD"
              : "WARITHEP CLASSROOM"}

          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <h1 className="text-[27px] font-black leading-[1.18] tracking-tight text-slate-950 sm:text-3xl md:text-5xl">

                {isStandards
                  ? "เรียนรู้มาตรฐานตามฝ่าย"
                  : "ห้องเรียนวารีเทพของเรา"}

              </h1>

              <p className="mt-2.5 max-w-2xl text-sm leading-6 text-slate-500 sm:mt-3 sm:text-base md:text-lg">

                {isStandards
                  ? "เลือกฝ่ายเพื่อเรียนรู้มาตรฐานของหน่วยงาน"
                  : "เลือกฝ่ายเพื่อเข้าสู่ห้องเรียนวิดีโอสอนงาน"}

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
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="ค้นหาฝ่ายที่ต้องการเรียน..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[13px] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:h-14 sm:pl-14 sm:pr-5 sm:text-sm md:text-base"
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* OVERVIEW */}

      <section className="mx-auto max-w-[1500px] px-4 pb-7 sm:px-5 sm:pb-9 md:px-8">

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex items-center gap-3 sm:gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📋
              </div>

              <div>

                <div className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  มาตรฐาน
                </div>

                <div className="text-xl font-black text-slate-900 sm:text-2xl">
                  {loading
                    ? "—"
                    : totalStandards}
                </div>

              </div>

            </div>

          </div>

          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-1 sm:p-5">

            <div className="flex items-center gap-3 sm:gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🎬
              </div>

              <div>

                <div className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  วิดีโอสอนงาน
                </div>

                <div className="text-xl font-black text-slate-900 sm:text-2xl">
                  {loading
                    ? "—"
                    : totalVideos}
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* DEPARTMENT */}

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-5 sm:pb-20 md:px-8">

        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">

          <div>

            <h2 className="text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
              {isStandards
                ? "เลือกฝ่ายที่ต้องการเรียนรู้มาตรฐาน"
                : "เลือกฝ่ายที่ต้องการเข้าเรียน"}
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm">
              {isStandards
                ? "มาตรฐานการทำงานแยกตามหน่วยงาน"
                : "ห้องเรียนวิดีโอสอนงานแยกตามหน่วยงาน"}
            </p>

          </div>

          {search && (
            <div className="shrink-0 text-xs font-semibold text-slate-400 sm:text-sm">
              พบ {filteredDepartments.length} ฝ่าย
            </div>
          )}

        </div>

        {filteredDepartments.length === 0 ? (

          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm sm:p-16">

            <div className="mb-4 text-4xl sm:text-5xl">
              🔎
            </div>

            <h3 className="text-base font-bold sm:text-lg">
              ไม่พบฝ่ายที่ค้นหา
            </h3>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              ลองค้นหาด้วยชื่อฝ่ายอื่น
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredDepartments.map(
              (department) => {

                const standardCount =
                  stats.standards[
                    department.name
                  ] || 0;

                const videoCount =
                  stats.videos[
                    department.name
                  ] || 0;

                const targetHref =
                  isStandards
                    ? `/departments/${department.id}`
                    : `/courses/${department.id}`;

                return (

                  <Link
                    key={department.id}
                    href={targetHref}
                    className="group block"
                  >

                    <article className="relative h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 sm:rounded-[28px]">

                      {/* BLUE HEADER */}

                      <div className="relative h-[165px] overflow-hidden bg-gradient-to-br from-[#00164d] via-[#00358f] to-[#001b5e] sm:h-[180px] md:h-[185px]">

                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

                        <div className="absolute right-4 top-4 sm:right-5 sm:top-5">

                          <div className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 shadow-sm sm:px-3.5 sm:py-2">

                            <span className="text-[9px] font-black tracking-wider text-white sm:text-[11px]">
                              DEPT {department.code}
                            </span>

                          </div>

                        </div>

                        <div className="absolute left-4 top-4 sm:left-6 sm:top-5">

                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-md sm:h-16 sm:w-16">

                            <span className="text-[29px] drop-shadow-md sm:text-[35px]">
                              {department.icon}
                            </span>

                          </div>

                        </div>

                        <div className="absolute inset-x-0 bottom-0">

                          <div className="absolute inset-x-0 bottom-0 h-[115px] bg-gradient-to-t from-[#00143f]/95 via-[#002a78]/55 to-transparent" />

                          <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">

                            <div className="mb-1.5 text-[8px] font-black tracking-[0.2em] text-blue-100/80 sm:mb-2 sm:text-[10px]">
                              {isStandards
                                ? "DEPARTMENT STANDARD"
                                : "DEPARTMENT LEARNING"}
                            </div>

                            <h3 className="max-w-[92%] text-[18px] font-black leading-[1.35] tracking-tight text-white sm:text-[20px] md:text-[21px]">
                              {department.name}
                            </h3>

                            <div className="mt-2.5 h-1 w-12 rounded-full bg-blue-400 sm:mt-3 sm:w-16" />

                          </div>

                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="p-4 sm:p-5">

                        {isStandards ? (

                          /* ==========================================
                             STANDARD CARD
                             ========================================== */

                          <div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                              <div className="flex items-center justify-between">

                                <span className="text-xl">
                                  📋
                                </span>

                                <span className="text-2xl font-black text-slate-900">
                                  {loading
                                    ? "—"
                                    : standardCount}
                                </span>

                              </div>

                              <div className="mt-2 text-xs font-bold text-slate-500">
                                มาตรฐานของฝ่าย
                              </div>

                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                              <span className="text-xs text-slate-400">
                                {standardCount > 0
                                  ? `${standardCount} มาตรฐาน`
                                  : "ยังไม่มีมาตรฐาน"}
                              </span>

                              <span className="text-sm font-black text-blue-600 transition-transform group-hover:translate-x-1">
                                ดูมาตรฐาน
                                <span className="ml-1">
                                  →
                                </span>
                              </span>

                            </div>

                          </div>

                        ) : (

                          /* ==========================================
                             CLASSROOM CARD
                             ========================================== */

                          <div>

                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                              <div className="flex items-center justify-between">

                                <span className="text-xl">
                                  🎬
                                </span>

                                <span className="text-2xl font-black text-blue-600">
                                  {loading
                                    ? "—"
                                    : videoCount}
                                </span>

                              </div>

                              <div className="mt-2 text-xs font-bold text-blue-600/70">
                                วิดีโอสอนงาน
                              </div>

                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                              <span className="text-xs text-slate-400">
                                {videoCount > 0
                                  ? `${videoCount} วิดีโอพร้อมเรียน`
                                  : "ยังไม่มีวิดีโอ"}
                              </span>

                              <span className="text-sm font-black text-blue-600 transition-transform group-hover:translate-x-1">
                                เข้าห้องเรียน
                                <span className="ml-1">
                                  →
                                </span>
                              </span>

                            </div>

                          </div>

                        )}

                      </div>

                    </article>

                  </Link>

                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}
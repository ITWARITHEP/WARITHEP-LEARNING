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

  const totalStandards = Object.values(
    stats.standards
  ).reduce((sum, value) => sum + value, 0);

  const totalVideos = Object.values(
    stats.videos
  ).reduce((sum, value) => sum + value, 0);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/70">

        <div className="max-w-[1500px] mx-auto px-5 md:px-8">

          <div className="h-[72px] flex items-center justify-between">

            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-2xl">
                  🎓
                </span>
              </div>

              <div className="leading-tight">
                <div className="font-black text-slate-900 text-lg">
                  วารีเทพ
                </div>

                <div className="text-[10px] font-bold tracking-[0.22em] text-blue-600">
                  LEARNING
                </div>
              </div>
            </Link>

            {/* NAV */}
            <nav className="flex items-center gap-2 md:gap-6">

              <Link
                href="/dashboard"
                className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/ranking"
                className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition"
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

        {/* Background glow */}

        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute top-20 -left-40 w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative max-w-[1500px] mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-8">

          {/* Badge */}

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black mb-5">

            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />

            LEARNING CENTER

          </div>


          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div className="max-w-3xl">

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">
                ห้องเรียนวารีเทพของเรา
              </h1>

              <p className="text-slate-500 mt-3 text-base md:text-lg">
                ศูนย์การเรียนรู้และวิดีโอสอนงาน
                สำหรับพนักงานวารีเทพ
              </p>

            </div>


            {/* SEARCH */}

            <div className="w-full lg:w-[420px]">

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-xl text-slate-400">
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
                  className="w-full h-14 pl-14 pr-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm text-sm md:text-base"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* OVERVIEW */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-9">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {/* หน่วยงาน */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                🏢
              </div>

              <div>

                <div className="text-xs text-slate-400 font-semibold">
                  หน่วยงาน
                </div>

                <div className="text-2xl font-black text-slate-900">
                  13
                </div>

              </div>

            </div>

          </div>


          {/* มาตรฐาน */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                📋
              </div>

              <div>

                <div className="text-xs text-slate-400 font-semibold">
                  มาตรฐาน
                </div>

                <div className="text-2xl font-black text-slate-900">
                  {loading
                    ? "—"
                    : totalStandards}
                </div>

              </div>

            </div>

          </div>


          {/* วิดีโอ */}

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                🎬
              </div>

              <div>

                <div className="text-xs text-slate-400 font-semibold">
                  วิดีโอสอนงาน
                </div>

                <div className="text-2xl font-black text-slate-900">
                  {loading
                    ? "—"
                    : totalVideos}
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* DEPARTMENT SECTION */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-20">

        <div className="flex items-end justify-between mb-7">

          <div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-950">
              เลือกฝ่ายที่ต้องการเรียน
            </h2>

            <p className="text-sm text-slate-500 mt-1.5">
              ห้องเรียนสอนงานแยกตามหน่วยงาน
            </p>

          </div>


          {search && (
            <div className="text-sm font-semibold text-slate-400">
              พบ {filteredDepartments.length} ฝ่าย
            </div>
          )}

        </div>


        {/* ================================================= */}
        {/* DEPARTMENT GRID */}
        {/* ================================================= */}

        {filteredDepartments.length === 0 ? (

          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">

            <div className="text-5xl mb-4">
              🔎
            </div>

            <h3 className="font-bold text-lg">
              ไม่พบฝ่ายที่ค้นหา
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              ลองค้นหาด้วยชื่อฝ่ายอื่น
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

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

                return (

                  <Link
                    key={department.id}
                    href={`/courses/${department.id}`}
                    className="group"
                  >

                    <article className="relative h-full bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all duration-300">


                      {/* ================================================= */}
                      {/* PREMIUM ICE BLUE HEADER */}
                      {/* ================================================= */}

                      <div className="relative h-[185px] overflow-hidden bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7]">

                        {/* Glow */}

                        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl" />

                        <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl" />


                        {/* ================================================= */}
                        {/* ICE WATERMARK */}
                        {/* ================================================= */}

                        <div className="absolute inset-0 overflow-hidden pointer-events-none">

                          <div className="absolute -right-5 -top-12 text-[170px] leading-none text-white/[0.065] rotate-12">
                            ❄
                          </div>

                          <div className="absolute right-[120px] bottom-[-55px] text-[120px] leading-none text-white/[0.045] -rotate-12">
                            ❄
                          </div>

                          <div className="absolute -left-8 bottom-[-65px] text-[145px] leading-none text-white/[0.035] rotate-12">
                            ❄
                          </div>


                          {/* Crystal lines */}

                          <div className="absolute right-0 top-0 w-[300px] h-full opacity-[0.08]">

                            <div className="absolute right-24 top-5 w-px h-48 bg-white rotate-[35deg]" />

                            <div className="absolute right-24 top-5 w-px h-48 bg-white rotate-[-35deg]" />

                            <div className="absolute right-24 top-5 w-48 h-px bg-white rotate-[35deg]" />

                            <div className="absolute right-24 top-5 w-48 h-px bg-white rotate-[-35deg]" />

                          </div>


                          {/* Sparkles */}

                          <div className="absolute top-12 right-20 w-2 h-2 rounded-full bg-white/40" />

                          <div className="absolute top-28 right-48 w-1.5 h-1.5 rounded-full bg-white/30" />

                          <div className="absolute bottom-10 right-28 w-2 h-2 rounded-full bg-white/30" />

                          <div className="absolute top-20 left-1/2 w-1 h-1 rounded-full bg-white/30" />

                        </div>


                        {/* ================================================= */}
                        {/* DEPARTMENT NUMBER */}
                        {/* ================================================= */}

                        <div className="absolute top-5 right-5">

                          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md shadow-lg">

                            <span className="text-white text-[11px] font-black tracking-wider">
                              DEPT {department.code}
                            </span>

                          </div>

                        </div>


                        {/* ================================================= */}
                        {/* ICON */}
                        {/* ================================================= */}

                        <div className="absolute left-6 top-5">

                          <div className="relative w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-xl">

                            <div className="absolute inset-0 rounded-2xl bg-white/10 blur-md" />

                            <span className="relative text-[35px] drop-shadow-lg">
                              {department.icon}
                            </span>

                          </div>

                        </div>


                        {/* ================================================= */}
                        {/* DEPARTMENT NAME */}
                        {/* ================================================= */}

                        <div className="absolute left-6 right-6 bottom-6">

                          <div className="text-[10px] md:text-[11px] font-black tracking-[0.22em] text-blue-100/80 mb-2">
                            DEPARTMENT LEARNING
                          </div>

                          <h3 className="text-white text-[20px] md:text-[21px] font-black leading-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
                            {department.name}
                          </h3>

                          <div className="mt-3 w-16 h-1 rounded-full bg-white/80" />

                        </div>


                        {/* ================================================= */}
                        {/* HOVER SHINE */}
                        {/* ================================================= */}

                        <div className="absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[120%] transition-all duration-1000 ease-out" />

                      </div>


                      {/* ================================================= */}
                      {/* CARD CONTENT */}
                      {/* ================================================= */}

                      <div className="p-5">


                        {/* COUNTERS */}

                        <div className="grid grid-cols-2 gap-3">


                          {/* STANDARD */}

                          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

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

                            <div className="text-xs text-slate-500 font-bold mt-2">
                              มาตรฐาน
                            </div>

                          </div>


                          {/* VIDEO */}

                          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">

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

                            <div className="text-xs text-blue-600/70 font-bold mt-2">
                              วิดีโอสอนงาน
                            </div>

                          </div>

                        </div>


                        {/* FOOTER */}

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">

                          <span className="text-xs text-slate-400">

                            {videoCount > 0
                              ? `${videoCount} วิดีโอพร้อมเรียน`
                              : "ยังไม่มีวิดีโอ"}

                          </span>


                          <span className="text-sm font-black text-blue-600 group-hover:translate-x-1 transition-transform">

                            เข้าห้องเรียน
                            <span className="ml-1">
                              →
                            </span>

                          </span>

                        </div>

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
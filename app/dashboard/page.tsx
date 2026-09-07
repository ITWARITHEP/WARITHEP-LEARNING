"use client";

import { useEffect, useState } from "react";
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
    icon: "📣",
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

export default function DashboardPage() {
  const [standardCounts, setStandardCounts] = useState<
    Record<string, number>
  >({});

  const [courseCount, setCourseCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [
          standardsResult,
          coursesResult,
          videosResult,
        ] = await Promise.all([
          supabase
            .from("department_standards")
            .select("department")
            .eq("published", true),

          supabase
            .from("courses")
            .select("id", { count: "exact", head: true })
            .eq("published", true),

          supabase
            .from("knowledge_videos")
            .select("id", { count: "exact", head: true })
            .eq("published", true),
        ]);

        if (standardsResult.error) {
          console.error(
            "โหลดมาตรฐานไม่สำเร็จ:",
            standardsResult.error
          );
        }

        if (coursesResult.error) {
          console.error(
            "โหลดหลักสูตรไม่สำเร็จ:",
            coursesResult.error
          );
        }

        if (videosResult.error) {
          console.error(
            "โหลดวิดีโอไม่สำเร็จ:",
            videosResult.error
          );
        }

        const counts: Record<string, number> = {};

        (standardsResult.data || []).forEach((item) => {
          counts[item.department] =
            (counts[item.department] || 0) + 1;
        });

        setStandardCounts(counts);

        setCourseCount(coursesResult.count || 0);
        setVideoCount(videosResult.count || 0);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalStandards = Object.values(
    standardCounts
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

              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden">

                <div className="absolute inset-0 bg-white/10" />

                <span className="relative text-2xl">
                  🎓
                </span>

              </div>

              <div className="leading-tight">

                <div className="font-black text-slate-900 text-lg">
                  วารีเทพ
                </div>

                <div className="text-[10px] font-black tracking-[0.22em] text-blue-600">
                  LEARNING
                </div>

              </div>

            </Link>


            {/* NAVIGATION */}

            <nav className="flex items-center gap-2 md:gap-6">

              <Link
                href="/knowledge"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                🎥 วิดีโอ
              </Link>

              <Link
                href="/ranking"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
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

        <div className="absolute -top-40 -right-20 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute top-24 -left-40 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="max-w-[1500px] mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-8">

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black mb-5">

            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />

            WARITHEP LEARNING

          </div>


          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

            <div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">

                ยินดีต้อนรับสู่{" "}

                <span className="text-blue-600">
                  วารีเทพ Learning
                </span>{" "}

                🎓

              </h1>

              <p className="text-slate-500 mt-3 text-base md:text-lg">
                ศูนย์กลางการเรียนรู้และพัฒนาศักยภาพบุคลากร
              </p>

            </div>


            {/* Quick action */}

            <Link
              href="/courses"
              className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >

              <span className="text-xl">
                📚
              </span>

              <span>
                เข้าสู่ห้องเรียน
              </span>

              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>

            </Link>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* STAT CARDS */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-9">

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">

          {/* หลักสูตร */}

          <div className="group bg-white rounded-[24px] border border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                📚
              </div>

              <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
                LEARNING
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl md:text-4xl font-black text-slate-950">
                {loading ? "—" : courseCount}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                หลักสูตรทั้งหมด
              </div>

            </div>

          </div>


          {/* วิดีโอ */}

          <div className="group bg-white rounded-[24px] border border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                🎬
              </div>

              <span className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                VIDEO
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl md:text-4xl font-black text-slate-950">
                {loading ? "—" : videoCount}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                วิดีโอการเรียนรู้
              </div>

            </div>

          </div>


          {/* เรียนจบ */}

          <div className="group bg-white rounded-[24px] border border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                ✅
              </div>

              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                PROGRESS
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl md:text-4xl font-black text-slate-950">
                0
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                เรียนจบแล้ว
              </div>

            </div>

          </div>


          {/* คะแนน */}

          <div className="group bg-white rounded-[24px] border border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                🏆
              </div>

              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                SCORE
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl md:text-4xl font-black text-slate-950">
                0
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                คะแนนสะสม
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* QUICK MENU */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-10">

        <div className="mb-6">

          <div className="text-xs font-black tracking-[0.2em] text-blue-600">
            QUICK ACCESS
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-1">
            เมนูการเรียนรู้
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            เข้าถึงเนื้อหาและเครื่องมือการเรียนรู้
          </p>

        </div>


        {/* ================================================= */}
        {/* 5 LEARNING MENU */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-5">

          {/* ================================================= */}
          {/* 1. หลักสูตร */}
          {/* ================================================= */}

          <Link
            href="/courses"
            className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >

            <div className="absolute -right-8 -top-8 text-[100px] opacity-[0.035]">
              ❄
            </div>

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                📚
              </div>

              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                →
              </span>

            </div>

            <h3 className="font-black text-lg mt-5">
              หลักสูตรสอนงาน
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              ห้องเรียนวิดีโอสอนงาน
            </p>

          </Link>


          {/* ================================================= */}
          {/* 2. แบบทดสอบ */}
          {/* ================================================= */}

          <Link
            href="/exams"
            className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >

            <div className="absolute -right-8 -top-8 text-[100px] opacity-[0.035]">
              ❄
            </div>

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-xl">
                📝
              </div>

              <span className="text-violet-500 group-hover:translate-x-1 transition-transform">
                →
              </span>

            </div>

            <h3 className="font-black text-lg mt-5">
              แบบทดสอบ
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              ทำแบบทดสอบและประเมินความรู้
            </p>

          </Link>


          {/* ================================================= */}
          {/* 3. วิดีโอ */}
          {/* ================================================= */}

          <Link
            href="/knowledge"
            className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >

            <div className="absolute -right-8 -top-8 text-[100px] opacity-[0.035]">
              ❄
            </div>

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                🎥
              </div>

              <span className="text-red-500 group-hover:translate-x-1 transition-transform">
                →
              </span>

            </div>

            <h3 className="font-black text-lg mt-5">
              วิดีโออบรมและบรรยาย
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              วิดีโอความรู้และการอบรม
            </p>

          </Link>


          {/* ================================================= */}
          {/* 4. Ranking */}
          {/* ================================================= */}

          <Link
            href="/ranking"
            className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >

            <div className="absolute -right-8 -top-8 text-[100px] opacity-[0.035]">
              ❄
            </div>

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                🏆
              </div>

              <span className="text-amber-500 group-hover:translate-x-1 transition-transform">
                →
              </span>

            </div>

            <h3 className="font-black text-lg mt-5">
              Ranking
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              อันดับการเรียนรู้
            </p>

          </Link>


          {/* ================================================= */}
          {/* 5. Profile */}
          {/* ================================================= */}

          <Link
            href="/profile"
            className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >

            <div className="absolute -right-8 -top-8 text-[100px] opacity-[0.035]">
              ❄
            </div>

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                👤
              </div>

              <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                →
              </span>

            </div>

            <h3 className="font-black text-lg mt-5">
              โปรไฟล์ของฉัน
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              ดูข้อมูลและความคืบหน้า
            </p>

          </Link>

        </div>

      </section>


      {/* ===================================================== */}
      {/* LEARNING CENTER */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent pointer-events-none" />

        <div className="relative max-w-[1500px] mx-auto px-5 md:px-8 pb-20">

          <div className="mb-7">

            <div className="text-xs font-black tracking-[0.2em] text-blue-600">
              LEARNING CENTER
            </div>

            <h2 className="text-2xl md:text-3xl font-black mt-1">
              การเรียนรู้มาตรฐานตามฝ่าย
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              เลือกฝ่ายเพื่อดูมาตรฐานของหน่วยงาน
            </p>

          </div>


          {/* ================================================= */}
          {/* DEPARTMENT GRID */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            {departments.map((department) => {

              const count =
                standardCounts[department.name] || 0;

              return (

                <Link
                  key={department.id}
                  href={`/departments/${department.id}`}
                  className="group"
                >

                  <article className="relative overflow-hidden h-full bg-white rounded-[26px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all duration-300">


                    {/* ================================================= */}
                    {/* BLUE ICE HEADER */}
                    {/* ================================================= */}

                    <div className="relative h-[155px] overflow-hidden bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7]">

                      {/* Glow */}

                      <div className="absolute -top-20 -right-16 w-52 h-52 rounded-full bg-cyan-300/20 blur-3xl" />

                      <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-blue-300/20 blur-3xl" />


                      {/* ================================================= */}
                      {/* ICE WATERMARK */}
                      {/* ================================================= */}

                      <div className="absolute inset-0 overflow-hidden pointer-events-none">

                        <div className="absolute -right-4 -top-12 text-[145px] leading-none text-white/[0.065] rotate-12">
                          ❄
                        </div>

                        <div className="absolute right-20 bottom-[-45px] text-[100px] leading-none text-white/[0.045] -rotate-12">
                          ❄
                        </div>

                        <div className="absolute -left-8 bottom-[-55px] text-[120px] leading-none text-white/[0.03] rotate-12">
                          ❄
                        </div>


                        {/* Crystal */}

                        <div className="absolute right-0 top-0 w-[220px] h-full opacity-[0.07]">

                          <div className="absolute right-16 top-3 w-px h-44 bg-white rotate-[35deg]" />

                          <div className="absolute right-16 top-3 w-px h-44 bg-white rotate-[-35deg]" />

                          <div className="absolute right-16 top-3 w-44 h-px bg-white rotate-[35deg]" />

                          <div className="absolute right-16 top-3 w-44 h-px bg-white rotate-[-35deg]" />

                        </div>


                        {/* Sparkles */}

                        <div className="absolute top-12 right-14 w-1.5 h-1.5 rounded-full bg-white/40" />

                        <div className="absolute top-20 right-32 w-1 h-1 rounded-full bg-white/30" />

                        <div className="absolute bottom-8 right-20 w-2 h-2 rounded-full bg-white/20" />

                      </div>


                      {/* ================================================= */}
                      {/* NUMBER */}
                      {/* ================================================= */}

                      <div className="absolute top-4 right-4">

                        <div className="px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md">

                          <span className="text-white text-[10px] font-black tracking-wider">
                            DEPT {department.code}
                          </span>

                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* ICON */}
                      {/* ================================================= */}

                      <div className="absolute left-5 top-5">

                        <div className="relative w-14 h-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-xl">

                          <div className="absolute inset-0 rounded-2xl bg-white/10 blur-md" />

                          <span className="relative text-3xl drop-shadow-lg">
                            {department.icon}
                          </span>

                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* NAME */}
                      {/* ================================================= */}

                      <div className="absolute left-5 right-5 bottom-5">

                        <div className="text-[9px] font-black tracking-[0.2em] text-blue-100/80 mb-1.5">
                          DEPARTMENT
                        </div>

                        <h3 className="text-white text-[16px] font-black leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                          {department.name}
                        </h3>

                      </div>


                      {/* Hover shine */}

                      <div className="absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[120%] transition-all duration-1000 ease-out" />

                    </div>


                    {/* ================================================= */}
                    {/* CARD BODY */}
                    {/* ================================================= */}

                    <div className="p-4">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            📋
                          </div>

                          <div>

                            <div className="text-[11px] text-slate-400 font-semibold">
                              มาตรฐานของฝ่าย
                            </div>

                            <div className="text-2xl font-black text-slate-900">
                              {loading ? "—" : count}
                            </div>

                          </div>

                        </div>


                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">

                          →

                        </div>

                      </div>


                      {/* Bottom line */}

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">

                        <span className="text-[11px] text-slate-400">
                          ดูมาตรฐานของฝ่าย
                        </span>

                        <span className="text-[11px] font-bold text-blue-600">
                          ดูรายละเอียด
                        </span>

                      </div>

                    </div>

                  </article>

                </Link>

              );
            })}

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-7">

          <div className="flex flex-col md:flex-row items-center justify-between gap-3">

            <div className="text-sm font-bold text-slate-500">
              🎓 วารีเทพ Learning
            </div>

            <div className="text-xs text-slate-400">
              Learning • Development • Growth
            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}
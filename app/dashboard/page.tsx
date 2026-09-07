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
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f9fd] text-slate-900">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto max-w-[1500px] px-4 sm:px-5 md:px-8">

          <div className="flex h-[64px] items-center justify-between sm:h-[72px]">

            {/* LOGO */}

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 sm:gap-3"
            >

              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/15 sm:h-11 sm:w-11 sm:rounded-2xl">

                <span className="relative text-xl sm:text-2xl">
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


            {/* NAVIGATION */}

            <nav className="flex items-center gap-1.5 sm:gap-3 md:gap-6">

              <Link
                href="/knowledge"
                className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-600 sm:flex"
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

        {/* LIGHT GLOW */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-blue-100/50 blur-3xl sm:h-[500px] sm:w-[500px]" />

        <div className="pointer-events-none absolute -left-32 top-32 h-[300px] w-[300px] rounded-full bg-sky-100/40 blur-3xl sm:h-[420px] sm:w-[420px]" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-7 pt-8 sm:px-5 sm:pb-8 sm:pt-10 md:px-8 md:pb-10 md:pt-14">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 sm:px-3.5 sm:py-2 sm:text-xs">

            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2" />

            WARITHEP LEARNING

          </div>


          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <h1 className="text-[27px] font-black leading-[1.2] tracking-tight text-slate-950 sm:text-3xl md:text-5xl">

                ยินดีต้อนรับสู่{" "}

                <span className="text-blue-600">
                  วารีเทพ Learning
                </span>

                {" "}🎓

              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base md:text-lg">
                ศูนย์กลางการเรียนรู้และพัฒนาศักยภาพบุคลากร
              </p>

            </div>


            <Link
              href="/courses"
              className="group inline-flex w-fit items-center gap-2.5 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/15 transition hover:bg-blue-700 hover:shadow-lg sm:px-5 sm:py-3.5 sm:text-base"
            >

              <span className="text-lg sm:text-xl">
                📚
              </span>

              <span>
                เข้าสู่ห้องเรียน
              </span>

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>

            </Link>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* STAT CARDS */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-5 sm:py-8 md:px-8">

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

          {/* COURSE */}

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-[24px] sm:p-5 md:p-6">

            <div className="flex items-start justify-between gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📚
              </div>

              <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-500 sm:block">
                LEARNING
              </span>

            </div>

            <div className="mt-4 sm:mt-5">

              <div className="text-2xl font-black text-slate-950 sm:text-3xl md:text-4xl">
                {loading ? "—" : courseCount}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                หลักสูตรทั้งหมด
              </div>

            </div>

          </div>


          {/* VIDEO */}

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-[24px] sm:p-5 md:p-6">

            <div className="flex items-start justify-between gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🎬
              </div>

              <span className="hidden rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-black text-sky-600 sm:block">
                VIDEO
              </span>

            </div>

            <div className="mt-4 sm:mt-5">

              <div className="text-2xl font-black text-slate-950 sm:text-3xl md:text-4xl">
                {loading ? "—" : videoCount}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                วิดีโอการเรียนรู้
              </div>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-[24px] sm:p-5 md:p-6">

            <div className="flex items-start justify-between gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                ✅
              </div>

              <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-600 sm:block">
                PROGRESS
              </span>

            </div>

            <div className="mt-4 sm:mt-5">

              <div className="text-2xl font-black text-slate-950 sm:text-3xl md:text-4xl">
                0
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                เรียนจบแล้ว
              </div>

            </div>

          </div>


          {/* SCORE */}

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-[24px] sm:p-5 md:p-6">

            <div className="flex items-start justify-between gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🏆
              </div>

              <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-600 sm:block">
                SCORE
              </span>

            </div>

            <div className="mt-4 sm:mt-5">

              <div className="text-2xl font-black text-slate-950 sm:text-3xl md:text-4xl">
                0
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                คะแนนสะสม
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* QUICK MENU */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-8 sm:px-5 sm:pb-10 md:px-8">

        <div className="mb-5 sm:mb-6">

          <div className="text-[10px] font-black tracking-[0.18em] text-blue-600 sm:text-xs">
            QUICK ACCESS
          </div>

          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
            เมนูการเรียนรู้
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            เข้าถึงเนื้อหาและเครื่องมือการเรียนรู้
          </p>

        </div>


        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">

          {/* COURSE */}

          <Link
            href="/courses"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

            <div className="pointer-events-none absolute -right-7 -top-7 text-[80px] opacity-[0.018] sm:text-[100px]">
              
            </div>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📚
              </div>

              <span className="text-blue-600 transition-transform group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900 sm:mt-5 sm:text-lg">
              หลักสูตรสอนงาน
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
              ห้องเรียนวิดีโอสอนงาน
            </p>

          </Link>


          {/* EXAM */}

          <Link
            href="/exams"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

            <div className="pointer-events-none absolute -right-7 -top-7 text-[80px] opacity-[0.018] sm:text-[100px]">
              
            </div>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📝
              </div>

              <span className="text-violet-500 transition-transform group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900 sm:mt-5 sm:text-lg">
              แบบทดสอบ
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
              ทำแบบทดสอบและประเมินความรู้
            </p>

          </Link>


          {/* KNOWLEDGE */}

          <Link
            href="/knowledge"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

            <div className="pointer-events-none absolute -right-7 -top-7 text-[80px] opacity-[0.018] sm:text-[100px]">
              
            </div>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🎥
              </div>

              <span className="text-sky-500 transition-transform group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900 sm:mt-5 sm:text-lg">
              วิดีโออบรมและบรรยาย
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
              วิดีโอความรู้และการอบรม
            </p>

          </Link>


          {/* RANKING */}

          <Link
            href="/ranking"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

            <div className="pointer-events-none absolute -right-7 -top-7 text-[80px] opacity-[0.018] sm:text-[100px]">
              
            </div>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                🏆
              </div>

              <span className="text-amber-500 transition-transform group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900 sm:mt-5 sm:text-lg">
              Ranking
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
              อันดับการเรียนรู้
            </p>

          </Link>


          {/* PROFILE */}

          <Link
            href="/profile"
            className="group relative col-span-2 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:col-span-1 sm:rounded-[24px] sm:p-5"
          >

            <div className="pointer-events-none absolute -right-7 -top-7 text-[80px] opacity-[0.018] sm:text-[100px]">
              
            </div>

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                👤
              </div>

              <span className="text-emerald-500 transition-transform group-hover:translate-x-1">
                →
              </span>

            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900 sm:mt-5 sm:text-lg">
              โปรไฟล์ของฉัน
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">
              ดูข้อมูลและความคืบหน้า
            </p>

          </Link>

        </div>

      </section>


      {/* ===================================================== */}
      {/* LEARNING CENTER */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden">

        {/* VERY LIGHT BACKGROUND */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-16 sm:px-5 sm:pb-20 md:px-8">

          <div className="mb-6 sm:mb-7">

            <div className="text-[10px] font-black tracking-[0.18em] text-blue-600 sm:text-xs">
              LEARNING CENTER
            </div>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
              การเรียนรู้มาตรฐานตามฝ่าย
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              เลือกฝ่ายเพื่อดูมาตรฐานของหน่วยงาน
            </p>

          </div>


          {/* DEPARTMENT GRID */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">

            {departments.map((department) => {

              const count =
                standardCounts[department.name] || 0;

              return (

                <Link
                  key={department.id}
                  href={`/departments/${department.id}`}
                  className="group"
                >

                  <article className="relative h-full overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:rounded-[26px]">


                    {/* ================================================= */}
                    {/* LIGHT ICE BLUE HEADER */}
                    {/* ================================================= */}

                    <div className="relative h-[135px] overflow-hidden bg-gradient-to-br from-[#2f7df4] via-[#4f93f7] to-[#3973dd] sm:h-[145px]">

                      {/* Soft light */}

                      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                      <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cyan-100/10 blur-3xl" />


                      {/* ================================================= */}
                      {/* VERY LIGHT ICE WATERMARK */}
                      {/* ================================================= */}

                      <div className="pointer-events-none absolute inset-0 overflow-hidden">

                        <div className="absolute -right-5 -top-14 text-[125px] leading-none text-white/[0.035] rotate-12 sm:text-[140px]">
                          
                        </div>

                        <div className="absolute right-16 bottom-[-48px] text-[90px] leading-none text-white/[0.025] -rotate-12 sm:text-[100px]">
                          
                        </div>

                        <div className="absolute -left-8 bottom-[-55px] text-[105px] leading-none text-white/[0.018] rotate-12 sm:text-[120px]">
                          
                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* DEPARTMENT NUMBER */}
                      {/* ================================================= */}

                      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">

                        <div className="rounded-full border border-white/30 bg-white/20 px-2.5 py-1 backdrop-blur-sm sm:px-3 sm:py-1.5">

                          <span className="text-[9px] font-black tracking-wider text-white sm:text-[10px]">
                            DEPT {department.code}
                          </span>

                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* ICON */}
                      {/* ================================================= */}

                      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/20 shadow-sm backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">

                          <span className="text-2xl sm:text-3xl">
                            {department.icon}
                          </span>

                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* NAME */}
                      {/* ================================================= */}

                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">

                        <div className="mb-1 text-[8px] font-black tracking-[0.18em] text-white/75 sm:text-[9px] sm:tracking-[0.2em]">
                          DEPARTMENT
                        </div>

                        <h3 className="text-[14px] font-black leading-[1.3] text-white sm:text-[16px]">
                          {department.name}
                        </h3>

                      </div>

                    </div>


                    {/* ================================================= */}
                    {/* CARD BODY */}
                    {/* ================================================= */}

                    <div className="p-4 sm:p-5">

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-base sm:h-10 sm:w-10">
                            📋
                          </div>

                          <div className="min-w-0">

                            <div className="text-[10px] font-semibold text-slate-400 sm:text-[11px]">
                              มาตรฐานของฝ่าย
                            </div>

                            <div className="text-xl font-black text-slate-900 sm:text-2xl">
                              {loading ? "—" : count}
                            </div>

                          </div>

                        </div>


                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white sm:h-9 sm:w-9">

                          →

                        </div>

                      </div>


                      {/* BOTTOM */}

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:mt-4">

                        <span className="text-[9px] text-slate-400 sm:text-[11px]">
                          ดูมาตรฐานของฝ่าย
                        </span>

                        <span className="text-[9px] font-bold text-blue-600 sm:text-[11px]">
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
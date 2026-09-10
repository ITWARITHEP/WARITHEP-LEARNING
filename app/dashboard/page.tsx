"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ExamResult = {
  exam_id: string;
  score: number | null;
  total_score: number | null;
  percent: number | null;
  passed: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  // =========================================================
  // หลักสูตร = วิดีโอ
  // =========================================================

  const [courseCount, setCourseCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  // =========================================================
  // วิดีโอที่เรียนจบแล้ว
  // =========================================================

  const [completedCount, setCompletedCount] = useState(0);

  // =========================================================
  // คะแนนสะสมจากแบบทดสอบ
  // =========================================================

  const [totalScore, setTotalScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // ออกจากระบบ
  // =========================================================

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      // ออกจาก Supabase Auth
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout Error:", error);
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      // ล้างข้อมูลสมาชิกที่เก็บไว้ในเครื่อง
      const sessionKeys = [
        "warithep_learning_member",
        "warithep_learning_member_id",
        "warithep_learning_user",
        "warithep_learning_login_name",
        "warithep_learning_login_password",
        "warithep_member_id",
        "member_id",
        "current_member_id",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      sessionKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // กลับหน้า Login
      router.replace("/login");
    }
  }

  // =========================================================
  // หา Member ID ปัจจุบัน
  // =========================================================

  async function getCurrentMemberId(): Promise<string | null> {
    try {
      // -------------------------------------------------------
      // 1. Member ID ที่ Login เก็บไว้
      // -------------------------------------------------------

      const memberIdKeys = [
        "warithep_learning_member_id",
        "warithep_member_id",
        "member_id",
        "current_member_id",
      ];

      for (const key of memberIdKeys) {
        const storedId = localStorage.getItem(key)?.trim();

        if (!storedId) continue;

        const { data, error } = await supabase
          .from("members")
          .select("id")
          .eq("id", storedId)
          .maybeSingle();

        if (!error && data?.id) {
          return data.id;
        }
      }

      // -------------------------------------------------------
      // 2. ข้อมูลสมาชิกใน LocalStorage
      // -------------------------------------------------------

      const objectKeys = [
        "warithep_learning_member",
        "warithep_learning_user",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      for (const key of objectKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) continue;

        try {
          const parsed = JSON.parse(stored);

          if (parsed && typeof parsed === "object") {
            const value = parsed as Record<string, unknown>;

            // มี ID
            if (value.id) {
              const id = String(value.id);

              const { data, error } = await supabase
                .from("members")
                .select("id")
                .eq("id", id)
                .maybeSingle();

              if (!error && data?.id) {
                localStorage.setItem(
                  "warithep_learning_member_id",
                  data.id
                );

                return data.id;
              }
            }

            // มีชื่อ
            const name = String(
              value.name ||
                value.member_name ||
                ""
            ).trim();

            if (name) {
              const { data, error } = await supabase
                .from("members")
                .select("id")
                .eq("name", name)
                .limit(1)
                .maybeSingle();

              if (!error && data?.id) {
                localStorage.setItem(
                  "warithep_learning_member_id",
                  data.id
                );

                return data.id;
              }
            }
          }
        } catch (error) {
          console.warn(
            "อ่านข้อมูลสมาชิกไม่ได้:",
            key,
            error
          );
        }
      }

      // -------------------------------------------------------
      // 3. Login Name
      // -------------------------------------------------------

      const loginName = localStorage
        .getItem("warithep_learning_login_name")
        ?.trim();

      if (loginName) {
        const { data, error } = await supabase
          .from("members")
          .select("id")
          .eq("name", loginName)
          .limit(1)
          .maybeSingle();

        if (!error && data?.id) {
          localStorage.setItem(
            "warithep_learning_member_id",
            data.id
          );

          return data.id;
        }
      }

      return null;
    } catch (error) {
      console.error(
        "getCurrentMemberId error:",
        error
      );

      return null;
    }
  }

  // =========================================================
  // โหลด Dashboard
  // =========================================================

  async function loadDashboard() {
    try {
      setLoading(true);

      // =====================================================
      // โหลดวิดีโอ
      //
      // หลักสูตร = วิดีโอ
      // =====================================================

      const {
        data: videosData,
        error: videosError,
      } = await supabase
        .from("knowledge_videos")
        .select("id")
        .eq("published", true);

      if (videosError) {
        console.error(
          "โหลดวิดีโอไม่สำเร็จ:",
          videosError
        );
      }

      const publishedVideos = videosData || [];

      const totalVideos = publishedVideos.length;

      // วิดีโอทั้งหมด
      setVideoCount(totalVideos);

      // หลักสูตรทั้งหมด = วิดีโอทั้งหมด
      setCourseCount(totalVideos);

      // =====================================================
      // หา Member ปัจจุบัน
      // =====================================================

      const memberId = await getCurrentMemberId();

      if (!memberId) {
        console.warn("ไม่พบสมาชิกปัจจุบัน");

        setCompletedCount(0);
        setTotalScore(0);

        return;
      }

      // =====================================================
      // เรียนจบแล้ว
      // =====================================================

      const videoIds = publishedVideos.map(
        (video) => video.id
      );

      if (videoIds.length > 0) {
        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from("video_progress")
          .select(
            "video_id,completed,progress_percent"
          )
          .eq("member_id", memberId)
          .in("video_id", videoIds);

        if (progressError) {
          console.error(
            "โหลดความคืบหน้าวิดีโอไม่สำเร็จ:",
            progressError
          );

          setCompletedCount(0);
        } else {
          const completedVideos =
            (progressData || []).filter(
              (item) =>
                item.completed === true ||
                Number(
                  item.progress_percent || 0
                ) >= 100
            );

          const uniqueCompletedIds = new Set(
            completedVideos.map(
              (item) => item.video_id
            )
          );

          setCompletedCount(
            uniqueCompletedIds.size
          );
        }
      } else {
        setCompletedCount(0);
      }

      // =====================================================
      // คะแนนสะสม
      //
      // ใช้ผลล่าสุดของแต่ละแบบทดสอบ
      // รวมเฉพาะแบบทดสอบที่ผ่าน
      // =====================================================

      const {
        data: resultData,
        error: resultError,
      } = await supabase
        .from("exam_results")
        .select(
          "exam_id,score,total_score,percent,passed,created_at"
        )
        .eq("member_id", memberId)
        .order("created_at", {
          ascending: false,
        });

      if (resultError) {
        console.error(
          "โหลดคะแนนสอบไม่สำเร็จ:",
          resultError
        );

        setTotalScore(0);
      } else {
        // ---------------------------------------------------
        // เก็บผลล่าสุดของแต่ละแบบทดสอบ
        // ---------------------------------------------------

        const latestResults: Record<
          string,
          ExamResult
        > = {};

        (resultData || []).forEach((result) => {
          if (!latestResults[result.exam_id]) {
            latestResults[result.exam_id] = {
              exam_id: result.exam_id,
              score: Number(result.score || 0),
              total_score: Number(
                result.total_score || 0
              ),
              percent: Number(
                result.percent || 0
              ),
              passed: result.passed === true,
              created_at: result.created_at,
            };
          }
        });

        // ---------------------------------------------------
        // รวมคะแนนเฉพาะแบบทดสอบที่ผ่าน
        // ---------------------------------------------------

        const accumulatedScore = Object.values(
          latestResults
        )
          .filter(
            (result) => result.passed === true
          )
          .reduce(
            (sum, result) =>
              sum + Number(result.score || 0),
            0
          );

        setTotalScore(accumulatedScore);
      }
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );
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

            {/* NAVIGATION */}

            <nav className="flex items-center gap-1.5 sm:gap-3 md:gap-4">

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

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
              >
                <span>
                  {loggingOut ? "⏳" : "🚪"}
                </span>

                <span className="hidden sm:inline">
                  {loggingOut
                    ? "กำลังออกจากระบบ..."
                    : "ออกจากระบบ"}
                </span>
              </button>

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
                {loading ? "—" : completedCount}
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
                {loading ? "—" : totalScore}
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

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-5 sm:pb-20 md:px-8">

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

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">

          {/* COURSE */}

          <Link
            href="/courses"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

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
              มาตรฐานและห้องเรียนวารีเทพ
            </p>

          </Link>

          {/* EXAM */}

          <Link
            href="/exams"
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

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
            className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:rounded-[24px] sm:p-5"
          >

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
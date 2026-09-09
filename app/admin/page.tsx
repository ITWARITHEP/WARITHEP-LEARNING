"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  members: number;
  courses: number;
  videos: number;
  quizzes: number;
  standards: number;
  standardFiles: number;
  examResults: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    members: 0,
    courses: 0,
    videos: 0,
    quizzes: 0,
    standards: 0,
    standardFiles: 0,
    examResults: 0,
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD REAL DATABASE STATS
  // =========================================================

  const loadStats = useCallback(async () => {
    setLoading(true);

    try {
      const [
        membersResult,
        coursesResult,
        videosResult,
        quizzesResult,
        standardsResult,
        standardFilesResult,
        examResultsResult,
      ] = await Promise.all([
        // MEMBERS
        supabase
          .from("members")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // COURSES
        supabase
          .from("courses")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // VIDEOS
        supabase
          .from("knowledge_videos")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // EXAMS
        supabase
          .from("exams")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // STANDARDS
        supabase
          .from("department_standards")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // STANDARD FILES
        supabase
          .from("standard_files")
          .select("*", {
            count: "exact",
            head: true,
          }),

        // EXAM RESULTS
        supabase
          .from("exam_results")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      // =====================================================
      // LOG ERROR แยกแต่ละ TABLE
      // =====================================================

      if (membersResult.error) {
        console.error(
          "โหลด members ไม่สำเร็จ:",
          membersResult.error
        );
      }

      if (coursesResult.error) {
        console.error(
          "โหลด courses ไม่สำเร็จ:",
          coursesResult.error
        );
      }

      if (videosResult.error) {
        console.error(
          "โหลด knowledge_videos ไม่สำเร็จ:",
          videosResult.error
        );
      }

      if (quizzesResult.error) {
        console.error(
          "โหลด exams ไม่สำเร็จ:",
          quizzesResult.error
        );
      }

      if (standardsResult.error) {
        console.error(
          "โหลด department_standards ไม่สำเร็จ:",
          standardsResult.error
        );
      }

      if (standardFilesResult.error) {
        console.error(
          "โหลด standard_files ไม่สำเร็จ:",
          standardFilesResult.error
        );
      }

      if (examResultsResult.error) {
        console.error(
          "โหลด exam_results ไม่สำเร็จ:",
          examResultsResult.error
        );
      }

      // =====================================================
      // SET REAL STATS
      // =====================================================

      setStats({
        members: membersResult.count ?? 0,
        courses: coursesResult.count ?? 0,
        videos: videosResult.count ?? 0,
        quizzes: quizzesResult.count ?? 0,
        standards: standardsResult.count ?? 0,
        standardFiles: standardFilesResult.count ?? 0,
        examResults: examResultsResult.count ?? 0,
      });

      console.log("ADMIN DASHBOARD STATS:", {
        members: membersResult.count ?? 0,
        courses: coursesResult.count ?? 0,
        videos: videosResult.count ?? 0,
        quizzes: quizzesResult.count ?? 0,
        standards: standardsResult.count ?? 0,
        standardFiles: standardFilesResult.count ?? 0,
        examResults: examResultsResult.count ?? 0,
      });
    } catch (error) {
      console.error(
        "โหลดข้อมูล Dashboard ไม่สำเร็จ:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    void loadStats();

    const timer = setInterval(() => {
      void loadStats();
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, [loadStats]);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
              🎓
            </div>

            <div>

              <div className="font-black text-slate-900">
                วารีเทพ
              </div>

              <div className="text-xs font-bold tracking-widest text-blue-600">
                LEARNING ADMIN
              </div>

            </div>

          </Link>

          <Link
            href="/"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            🌐 เว็บไซต์
          </Link>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-600">
              ADMIN DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              แผงควบคุม
            </h1>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              จัดการระบบห้องเรียนวารีเทพ Learning
            </p>

          </div>

          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading
              ? "⏳ กำลังโหลด..."
              : "🔄 รีเฟรชข้อมูล"}
          </button>

        </div>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* MEMBERS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              👥
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              สมาชิกทั้งหมด
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "—" : stats.members}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              จากฐานข้อมูล members
            </p>

          </div>

          {/* COURSES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
              📚
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              หลักสูตร
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "—" : stats.courses}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              จากฐานข้อมูล courses
            </p>

          </div>

          {/* VIDEOS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              🎥
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              วิดีโอ
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "—" : stats.videos}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              จาก knowledge_videos
            </p>

          </div>

          {/* QUIZZES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              📝
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              แบบทดสอบ
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "—" : stats.quizzes}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              จากฐานข้อมูล exams
            </p>

          </div>

          {/* STANDARDS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-2xl">
              📋
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              มาตรฐาน
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "—" : stats.standards}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              จาก department_standards
            </p>

          </div>

        </section>

        {/* ===================================================
            EXTRA DATABASE SUMMARY
        =================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-400">
                  ไฟล์มาตรฐาน
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {loading ? "—" : stats.standardFiles}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                📎
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              จาก standard_files
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-400">
                  ผลการทำแบบทดสอบ
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {loading ? "—" : stats.examResults}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
                🏆
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              จาก exam_results
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-400">
                  สถานะฐานข้อมูล
                </p>

                <p className="mt-1 text-2xl font-black text-green-600">
                  Online
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
                🟢
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Supabase Database
            </p>

          </div>

        </section>

        {/* ===================================================
            MENU
        =================================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              MANAGEMENT
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              จัดการระบบ
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <AdminCard
              href="/admin/departments"
              icon="🏢"
              title="จัดการฝ่าย"
              description="จัดการข้อมูลฝ่ายสำนักงานใหญ่"
            />
            <AdminCard
  href="/admin/exam-results"
  icon="🏆"
  title="ผลการสอบสมาชิก"
  description="ดูคะแนนและสถานะการสอบของสมาชิก"
/>

            <AdminCard
              href="/admin/standards"
              icon="📋"
              title="จัดการมาตรฐาน"
              description="เพิ่มและจัดการมาตรฐานของแต่ละฝ่าย"
            />

            <AdminCard
              href="/admin/courses"
              icon="📚"
              title="จัดการหลักสูตร"
              description="สร้างและจัดการหลักสูตร"
            />

            <AdminCard
              href="/admin/videos"
              icon="🎥"
              title="จัดการวิดีโอ"
              description="จัดการวิดีโอสอนงาน"
            />

            <AdminCard
              href="/admin/knowledge"
              icon="💡"
              title="วิดีโออบรมและบรรยาย"
              description="จัดการวิดีโอความรู้และการบรรยาย"
            />

            <AdminCard
              href="/admin/quizzes"
              icon="📝"
              title="จัดการแบบทดสอบ"
              description="สร้างข้อสอบและจัดการคะแนน"
            />

            <AdminCard
              href="/admin/members"
              icon="👥"
              title="จัดการสมาชิก"
              description="ดูและจัดการข้อมูลสมาชิก"
            />

            <AdminCard
              href="/ranking"
              icon="🏆"
              title="Ranking"
              description="ดูอันดับผู้เรียน"
            />

            <AdminCard
              href="/admin/reports"
              icon="📊"
              title="รายงานการเรียน"
              description="ดูข้อมูลและสรุปผลการเรียน"
            />

            <AdminCard
              href="/admin/settings"
              icon="⚙️"
              title="ตั้งค่าระบบ"
              description="ตั้งค่าระบบห้องเรียน"
            />

          </div>

        </section>

        {/* ===================================================
            DATABASE STATUS
        =================================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              SYSTEM STATUS
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              สถานะระบบ
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <StatusCard
              icon="☁️"
              title="Cloudflare Stream"
              status="เชื่อมต่อแล้ว"
              color="green"
            />

            <StatusCard
              icon="🗄️"
              title="Supabase"
              status="เชื่อมต่อแล้ว"
              color="green"
            />

            <StatusCard
              icon="🔐"
              title="Authentication"
              status="ยังไม่ได้เชื่อมต่อ"
              color="yellow"
            />

          </div>

        </section>

        {/* ===================================================
            DATABASE TABLES
        =================================================== */}

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <p className="font-bold text-blue-600">
                DATABASE
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                ฐานข้อมูลที่เชื่อมต่อ
              </h2>

            </div>

            <div className="w-fit rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
              🟢 Supabase Online
            </div>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <DatabaseTable
              name="members"
              label="👥 สมาชิก"
              count={stats.members}
            />

            <DatabaseTable
              name="courses"
              label="📚 หลักสูตร"
              count={stats.courses}
            />

            <DatabaseTable
              name="knowledge_videos"
              label="🎥 วิดีโอ"
              count={stats.videos}
            />

            <DatabaseTable
              name="exams"
              label="📝 แบบทดสอบ"
              count={stats.quizzes}
            />

            <DatabaseTable
              name="department_standards"
              label="📋 มาตรฐาน"
              count={stats.standards}
            />

          </div>

        </section>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6">

          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Admin Dashboard
          </p>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   ADMIN CARD
========================================================= */

function AdminCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
    >

      <div className="flex items-start gap-4">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-blue-100">
          {icon}
        </div>

        <div className="min-w-0">

          <h3 className="font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </Link>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  icon,
  title,
  status,
  color,
}: {
  icon: string;
  title: string;
  status: string;
  color: "green" | "yellow";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl">
            {icon}
          </div>

          <div>

            <p className="font-bold text-slate-900">
              {title}
            </p>

            <p
              className={`mt-1 text-xs font-bold ${
                color === "green"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {status}
            </p>

          </div>

        </div>

        <div
          className={`h-3 w-3 rounded-full ${
            color === "green"
              ? "bg-green-500"
              : "bg-yellow-400"
          }`}
        />

      </div>

    </div>
  );
}

/* =========================================================
   DATABASE TABLE
========================================================= */

function DatabaseTable({
  name,
  label,
  count,
}: {
  name: string;
  label: string;
  count: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-sm font-bold text-slate-700">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-slate-900">
        {count}
      </p>

      <p className="mt-1 truncate text-xs text-slate-400">
        {name}
      </p>

    </div>
  );
}
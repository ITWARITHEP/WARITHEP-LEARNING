"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ExamResult = {
  id: string;
  exam_id: string;
  member_id: string | null;
  member_name: string;
  department: string | null;
  score: number;
  total_score: number;
  percent: number;
  passed: boolean;
  created_at: string;
};

type Exam = {
  id: string;
  title: string;
  department: string | null;
};

type Member = {
  id: string;
  name: string | null;
  department: string | null;
};

type ResultRow = ExamResult & {
  exam_title: string;
  exam_department: string;
};

export default function ExamResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [departmentFilter, setDepartmentFilter] =
    useState("ทั้งหมด");

  const loadResults = useCallback(async () => {
    setLoading(true);

    try {
      // =====================================================
      // โหลดผลสอบ
      // =====================================================

      const {
        data: resultData,
        error: resultError,
      } = await supabase
        .from("exam_results")
        .select(
          "id,exam_id,member_id,member_name,department,score,total_score,percent,passed,created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (resultError) {
        console.error(
          "โหลดผลสอบไม่สำเร็จ:",
          resultError
        );

        setResults([]);
        return;
      }

      // =====================================================
      // โหลดแบบทดสอบ
      // =====================================================

      const {
        data: examData,
        error: examError,
      } = await supabase
        .from("exams")
        .select(
          "id,title,department"
        );

      if (examError) {
        console.error(
          "โหลดข้อมูลแบบทดสอบไม่สำเร็จ:",
          examError
        );
      }

      // =====================================================
      // สร้าง Map แบบทดสอบ
      // =====================================================

      const examMap = new Map<
        string,
        Exam
      >();

      (examData ?? []).forEach(
        (exam) => {
          examMap.set(
            exam.id,
            exam as Exam
          );
        }
      );

      // =====================================================
      // รวมข้อมูลผลสอบ + แบบทดสอบ
      // =====================================================

      const rows: ResultRow[] =
        (resultData ?? []).map(
          (result) => {
            const exam =
              examMap.get(
                result.exam_id
              );

            return {
              ...(result as ExamResult),
              exam_title:
                exam?.title ||
                "ไม่พบชื่อแบบทดสอบ",
              exam_department:
                exam?.department ||
                result.department ||
                "-",
            };
          }
        );

      setResults(rows);

      console.log(
        "ADMIN EXAM RESULTS:",
        rows
      );
    } catch (error) {
      console.error(
        "โหลดผลสอบไม่สำเร็จ:",
        error
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // โหลดครั้งแรก + รีเฟรชทุก 10 วินาที
  // =====================================================

  useEffect(() => {
    void loadResults();

    const timer =
      setInterval(() => {
        void loadResults();
      }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, [loadResults]);

  // =====================================================
  // รายชื่อฝ่าย
  // =====================================================

  const departments = useMemo(() => {
    const values = new Set<string>();

    results.forEach(
      (result) => {
        if (
          result.exam_department &&
          result.exam_department !== "-"
        ) {
          values.add(
            result.exam_department
          );
        }

        if (
          result.department
        ) {
          values.add(
            result.department
          );
        }
      }
    );

    return [
      "ทั้งหมด",
      ...Array.from(values).sort(),
    ];
  }, [results]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredResults =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return results.filter(
        (result) => {
          const matchSearch =
            !keyword ||
            result.member_name
              .toLowerCase()
              .includes(keyword) ||
            result.exam_title
              .toLowerCase()
              .includes(keyword) ||
            result.exam_department
              .toLowerCase()
              .includes(keyword);

          const matchStatus =
            statusFilter ===
              "ทั้งหมด" ||
            (statusFilter ===
              "ผ่าน" &&
              result.passed) ||
            (statusFilter ===
              "ไม่ผ่าน" &&
              !result.passed);

          const memberDepartment =
            result.department ||
            result.exam_department;

          const matchDepartment =
            departmentFilter ===
              "ทั้งหมด" ||
            memberDepartment ===
              departmentFilter ||
            result.exam_department ===
              departmentFilter;

          return (
            matchSearch &&
            matchStatus &&
            matchDepartment
          );
        }
      );
    }, [
      results,
      search,
      statusFilter,
      departmentFilter,
    ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalResults =
    results.length;

  const passedResults =
    results.filter(
      (result) =>
        result.passed
    ).length;

  const failedResults =
    results.filter(
      (result) =>
        !result.passed
    ).length;

  const uniqueMembers =
    new Set(
      results
        .map(
          (result) =>
            result.member_id
        )
        .filter(Boolean)
    ).size;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  function formatDate(
    value: string
  ) {
    try {
      return new Date(
        value
      ).toLocaleString(
        "th-TH",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return "-";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <Link
            href="/admin"
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
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            ← กลับ Admin
          </Link>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* TITLE */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-600">
              EXAM RESULTS
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              ผลการสอบสมาชิก
            </h1>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              ตรวจสอบคะแนนและสถานะการสอบของสมาชิกทั้งหมด
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              void loadResults()
            }
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 md:w-auto"
          >
            {loading
              ? "⏳ กำลังโหลด..."
              : "🔄 รีเฟรชผลสอบ"}
          </button>

        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="📝"
            title="ผลสอบทั้งหมด"
            value={
              loading
                ? "—"
                : totalResults
            }
            description="รายการการสอบ"
            bg="bg-blue-50"
          />

          <StatCard
            icon="🏆"
            title="ผ่าน"
            value={
              loading
                ? "—"
                : passedResults
            }
            description="ผลสอบที่ผ่าน"
            bg="bg-green-50"
          />

          <StatCard
            icon="❌"
            title="ไม่ผ่าน"
            value={
              loading
                ? "—"
                : failedResults
            }
            description="ผลสอบที่ยังไม่ผ่าน"
            bg="bg-orange-50"
          />

          <StatCard
            icon="👥"
            title="สมาชิกที่สอบ"
            value={
              loading
                ? "—"
                : uniqueMembers
            }
            description="สมาชิกที่มีผลสอบ"
            bg="bg-purple-50"
          />

        </section>

        {/* =================================================
            FILTER
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">

            {/* SEARCH */}

            <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4">

              <span className="mr-3 text-lg">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="ค้นหาชื่อสมาชิก หรือชื่อแบบทดสอบ..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
            >

              <option value="ทั้งหมด">
                ทุกสถานะ
              </option>

              <option value="ผ่าน">
                🏆 ผ่าน
              </option>

              <option value="ไม่ผ่าน">
                ❌ ไม่ผ่าน
              </option>

            </select>

            {/* DEPARTMENT */}

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(
                  e.target.value
                )
              }
              className="h-12 max-w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
            >

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department ===
                    "ทั้งหมด"
                      ? "ทุกฝ่าย"
                      : department}
                  </option>
                )
              )}

            </select>

          </div>

        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="mt-8">

          <div className="mb-5 flex items-end justify-between gap-3">

            <div>

              <p className="text-xs font-black tracking-[0.18em] text-blue-600">
                RESULTS
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                รายการผลสอบ
              </h2>

            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
              {loading
                ? "กำลังโหลด..."
                : `${filteredResults.length} รายการ`}
            </div>

          </div>

          {loading ? (

            <div className="grid gap-4">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  />
                )
              )}

            </div>

          ) : filteredResults.length ===
            0 ? (

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                📝
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                ยังไม่มีผลสอบ
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                เมื่อสมาชิกทำแบบทดสอบแล้ว ผลสอบจะปรากฏที่นี่
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredResults.map(
                (result) => (

                  <article
                    key={result.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                      result.passed
                        ? "border-green-200"
                        : "border-orange-200"
                    }`}
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* MEMBER */}

                      <div className="flex min-w-0 items-start gap-4">

                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                            result.passed
                              ? "bg-green-50"
                              : "bg-orange-50"
                          }`}
                        >
                          {result.passed
                            ? "🏆"
                            : "📝"}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-black text-slate-900 sm:text-lg">
                              {result.member_name ||
                                "ไม่ระบุชื่อ"}
                            </h3>

                            {result.member_id ? (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                                Member ID เชื่อมแล้ว
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                ไม่มี Member ID
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {result.exam_title}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500">
                              🏢{" "}
                              {result.department ||
                                result.exam_department ||
                                "-"}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500">
                              📅{" "}
                              {formatDate(
                                result.created_at
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* SCORE */}

                      <div className="flex items-center gap-5 lg:min-w-[330px] lg:justify-end">

                        <div className="text-right">

                          <p className="text-[10px] font-bold text-slate-400">
                            คะแนน
                          </p>

                          <p
                            className={`mt-1 text-2xl font-black ${
                              result.passed
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {Number(
                              result.percent
                            ).toFixed(0)}
                            %
                          </p>

                          <p className="text-xs font-semibold text-slate-400">
                            {result.score} /{" "}
                            {result.total_score}
                          </p>

                        </div>

                        <div
                          className={`flex h-12 min-w-[100px] items-center justify-center rounded-xl px-4 text-sm font-black ${
                            result.passed
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {result.passed
                            ? "🏆 ผ่าน"
                            : "❌ ไม่ผ่าน"}
                        </div>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6">

          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Exam Results Management
          </p>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  description,
  bg,
}: {
  icon: string;
  title: string;
  value: number | string;
  description: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${bg}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}
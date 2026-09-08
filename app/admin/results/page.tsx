"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  title: string;
  department: string | null;
};

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

type ResultRow = ExamResult & {
  exam_title: string;
};

export default function AdminResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] =
    useState("ทั้งหมด");
  const [selectedDepartment, setSelectedDepartment] =
    useState("ทั้งหมด");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        resultsResponse,
        examsResponse,
      ] = await Promise.all([
        supabase
          .from("exam_results")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("exams")
          .select(
            "id,title,department"
          )
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (resultsResponse.error) {
        throw new Error(
          resultsResponse.error.message
        );
      }

      if (examsResponse.error) {
        throw new Error(
          examsResponse.error.message
        );
      }

      setResults(
        (resultsResponse.data ||
          []) as ExamResult[]
      );

      setExams(
        (examsResponse.data ||
          []) as Exam[]
      );
    } catch (err) {
      console.error(
        "โหลดผลสอบไม่สำเร็จ:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดผลสอบได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const examMap = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    exams.forEach((exam) => {
      map.set(
        exam.id,
        exam.title
      );
    });

    return map;
  }, [exams]);

  const departments = useMemo(() => {
    const values = results
      .map(
        (item) =>
          item.department
      )
      .filter(
        (item): item is string =>
          Boolean(item)
      );

    return Array.from(
      new Set(values)
    ).sort();
  }, [results]);

  const filteredResults =
    useMemo<ResultRow[]>(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return results
        .filter((item) => {
          if (!keyword) {
            return true;
          }

          const examTitle =
            examMap.get(
              item.exam_id
            ) || "";

          return (
            item.member_name
              .toLowerCase()
              .includes(keyword) ||
            examTitle
              .toLowerCase()
              .includes(keyword) ||
            (
              item.department || ""
            )
              .toLowerCase()
              .includes(keyword)
          );
        })
        .filter((item) => {
          if (
            selectedExam ===
            "ทั้งหมด"
          ) {
            return true;
          }

          return (
            item.exam_id ===
            selectedExam
          );
        })
        .filter((item) => {
          if (
            selectedDepartment ===
            "ทั้งหมด"
          ) {
            return true;
          }

          return (
            item.department ===
            selectedDepartment
          );
        })
        .map((item) => ({
          ...item,
          exam_title:
            examMap.get(
              item.exam_id
            ) ||
            "ไม่พบชื่อแบบทดสอบ",
        }));
    }, [
      results,
      examMap,
      search,
      selectedExam,
      selectedDepartment,
    ]);

  const total = filteredResults.length;

  const passed = filteredResults.filter(
    (item) => item.passed
  ).length;

  const failed =
    total - passed;

  const average =
    total > 0
      ? filteredResults.reduce(
          (sum, item) =>
            sum +
            Number(
              item.percent || 0
            ),
          0
        ) / total
      : 0;

  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleString(
      "th-TH",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fd]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="font-bold text-blue-600">
              EXAM RESULTS
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              ผลการสอบ
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              ตรวจสอบผลการทำแบบทดสอบจากสมาชิก
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading
              ? "⏳ กำลังโหลด..."
              : "🔄 รีเฟรช"}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            icon="📝"
            label="ผลสอบทั้งหมด"
            value={total}
            description="รายการ"
          />

          <SummaryCard
            icon="✅"
            label="ผ่าน"
            value={passed}
            description="รายการ"
            valueClass="text-emerald-600"
          />

          <SummaryCard
            icon="❌"
            label="ไม่ผ่าน"
            value={failed}
            description="รายการ"
            valueClass="text-red-600"
          />

          <SummaryCard
            icon="📊"
            label="คะแนนเฉลี่ย"
            value={`${average.toFixed(
              1
            )}%`}
            description="จากรายการที่แสดง"
          />

        </section>

        {/* FILTER */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900">
              🔎 ค้นหาและกรอง
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              ค้นหาผู้สอบหรือเลือกแบบทดสอบที่ต้องการ
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="ค้นหาชื่อผู้สอบ / แบบทดสอบ / ฝ่าย"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={selectedExam}
              onChange={(e) =>
                setSelectedExam(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
            >
              <option value="ทั้งหมด">
                ทุกแบบทดสอบ
              </option>

              {exams.map((exam) => (
                <option
                  key={exam.id}
                  value={exam.id}
                >
                  {exam.title}
                </option>
              ))}
            </select>

            <select
              value={
                selectedDepartment
              }
              onChange={(e) =>
                setSelectedDepartment(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
            >
              <option value="ทั้งหมด">
                ทุกฝ่าย
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={
                      department
                    }
                  >
                    {department}
                  </option>
                )
              )}
            </select>

          </div>

        </section>

        {/* RESULTS */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black">
                  รายการผลสอบ
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  พบ {filteredResults.length} รายการ
                </p>
              </div>

            </div>

          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">

              <div className="text-5xl">
                📊
              </div>

              <p className="mt-4 text-sm font-black text-slate-500">
                กำลังโหลดข้อมูล...
              </p>

            </div>
          ) : filteredResults.length ===
            0 ? (
            <div className="px-6 py-20 text-center">

              <div className="text-5xl">
                📭
              </div>

              <h3 className="mt-4 text-lg font-black">
                ยังไม่มีผลการสอบ
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                เมื่อมีสมาชิกทำแบบทดสอบ
                ผลสอบจะแสดงที่หน้านี้
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">

                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400">
                      ผู้สอบ
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400">
                      แบบทดสอบ
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400">
                      ฝ่าย
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-black text-slate-400">
                      คะแนน
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-black text-slate-400">
                      เปอร์เซ็นต์
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-black text-slate-400">
                      สถานะ
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400">
                      วันที่สอบ
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredResults.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <div className="font-black text-slate-900">
                            {
                              item.member_name
                            }
                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <div className="max-w-xs text-sm font-bold text-slate-800">
                            {
                              item.exam_title
                            }
                          </div>

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {
                            item.department ||
                            "-"
                          }
                        </td>

                        <td className="px-6 py-5 text-center">

                          <span className="font-black text-slate-900">
                            {
                              item.score
                            }
                          </span>

                          <span className="text-slate-400">
                            {" "}
                            /{" "}
                            {
                              item.total_score
                            }
                          </span>

                        </td>

                        <td className="px-6 py-5 text-center">

                          <span className="text-lg font-black text-blue-600">
                            {Number(
                              item.percent
                            ).toFixed(
                              1
                            )}
                            %
                          </span>

                        </td>

                        <td className="px-6 py-5 text-center">

                          {item.passed ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
                              ✓ ผ่าน
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">
                              ✕ ไม่ผ่าน
                            </span>
                          )}

                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-xs font-semibold text-slate-500">
                          {formatDate(
                            item.created_at
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
  valueClass = "text-slate-900",
}: {
  icon: string;
  label: string;
  value: string | number;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-3xl font-black ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}
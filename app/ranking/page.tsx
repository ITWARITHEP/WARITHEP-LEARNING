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

type RankingMember = {
  member_id: string;
  name: string;
  department: string;
  total_score: number;
  passed_count: number;
  exam_count: number;
  average_percent: number;
};

type Period = "month" | "all";

function getCurrentMonthLabel() {
  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function RankingPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: resultError } = await supabase
        .from("exam_results")
        .select(
          "id,exam_id,member_id,member_name,department,score,total_score,percent,passed,created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (resultError) {
        throw new Error(resultError.message);
      }

      setResults((data ?? []) as ExamResult[]);
    } catch (err) {
      console.error("Ranking load error:", err);

      setResults([]);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูล Ranking ได้"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRanking();
  }, [loadRanking]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadRanking();
    }, 15000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadRanking]);

  const filteredResults = useMemo(() => {
    const now = new Date();

    return results.filter((result) => {
      if (period === "month") {
        const date = new Date(result.created_at);

        if (
          date.getFullYear() !== now.getFullYear() ||
          date.getMonth() !== now.getMonth()
        ) {
          return false;
        }
      }

      const keyword = search.trim().toLowerCase();

      if (!keyword) {
        return true;
      }

      return [
        result.member_name,
        result.department ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [results, period, search]);

  const ranking = useMemo<RankingMember[]>(() => {
    const map = new Map<string, RankingMember>();

    for (const result of filteredResults) {
      const key =
        result.member_id ||
        result.member_name.trim();

      if (!key) continue;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          member_id: key,
          name: result.member_name || "ไม่ระบุชื่อ",
          department: result.department || "ไม่ระบุฝ่าย",
          total_score: Number(result.score || 0),
          passed_count: result.passed ? 1 : 0,
          exam_count: 1,
          average_percent: Number(result.percent || 0),
        });

        continue;
      }

      existing.total_score += Number(result.score || 0);

      if (result.passed) {
        existing.passed_count += 1;
      }

      existing.exam_count += 1;

      existing.average_percent += Number(
        result.percent || 0
      );
    }

    const list = Array.from(map.values());

    for (const item of list) {
      item.average_percent =
        item.average_percent / item.exam_count;
    }

    return list.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }

      if (b.passed_count !== a.passed_count) {
        return b.passed_count - a.passed_count;
      }

      return b.average_percent - a.average_percent;
    });
  }, [filteredResults]);

  const topThree = ranking.slice(0, 3);
  const remaining = ranking.slice(3);

  const totalParticipants = ranking.length;

  const totalPassed = ranking.reduce(
    (sum, item) => sum + item.passed_count,
    0
  );

  const averageScore =
    ranking.length > 0
      ? ranking.reduce(
          (sum, item) => sum + item.average_percent,
          0
        ) / ranking.length
      : 0;

  function getRankStyle(rank: number) {
    if (rank === 1) {
      return {
        card: "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-yellow-50",
        badge: "bg-amber-400 text-white",
        icon: "🥇",
      };
    }

    if (rank === 2) {
      return {
        card: "border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100",
        badge: "bg-slate-400 text-white",
        icon: "🥈",
      };
    }

    return {
      card: "border-orange-300 bg-gradient-to-br from-orange-50 via-white to-amber-50",
      badge: "bg-orange-500 text-white",
      icon: "🥉",
    };
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f9fd] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-6 md:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl shadow-md shadow-blue-500/15 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">
              🎓
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

          <nav className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/courses"
              className="hidden text-sm font-semibold text-slate-500 hover:text-blue-600 sm:block"
            >
              📚 หลักสูตร
            </Link>

            <Link
              href="/exams"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 sm:text-sm"
            >
              📝 แบบทดสอบ
            </Link>

            <Link
              href="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-lg hover:bg-blue-100 sm:h-10 sm:w-10"
            >
              👤
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-sky-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-12 md:px-8 md:pb-14 md:pt-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-black text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            LEARNING RANKING
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[32px] font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                🏆 Ranking
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base md:text-lg">
                อันดับการเรียนรู้และผลการทำแบบทดสอบของสมาชิก
              </p>

              <p className="mt-2 text-xs font-bold text-blue-600 sm:text-sm">
                {period === "month"
                  ? getCurrentMonthLabel()
                  : "ข้อมูลทั้งหมด"}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
            >
              ← Dashboard
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mt-7 max-w-2xl">
            <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm sm:h-14">
              <span className="mr-3 text-xl">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ค้นหาชื่อสมาชิกหรือฝ่าย..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PERIOD */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6 sm:px-6 md:px-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`rounded-full px-5 py-2.5 text-xs font-black transition ${
              period === "month"
                ? "bg-blue-600 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
            }`}
          >
            📅 เดือนนี้
          </button>

          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`rounded-full px-5 py-2.5 text-xs font-black transition ${
              period === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
            }`}
          >
            🏆 ทั้งหมด
          </button>

          <button
            type="button"
            onClick={() => void loadRanking()}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
          >
            🔄 รีเฟรช
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6 md:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-bold text-slate-400">
              สมาชิกที่มีอันดับ
            </div>

            <div className="mt-1 text-2xl font-black text-blue-600 sm:text-3xl">
              {loading ? "—" : totalParticipants}
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-bold text-slate-400">
              จำนวนครั้งที่ผ่าน
            </div>

            <div className="mt-1 text-2xl font-black text-green-600 sm:text-3xl">
              {loading ? "—" : totalPassed}
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-bold text-slate-400">
              คะแนนเฉลี่ย
            </div>

            <div className="mt-1 text-2xl font-black text-purple-600 sm:text-3xl">
              {loading
                ? "—"
                : `${averageScore.toFixed(0)}%`}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1500px] px-4 pb-16 pt-7 sm:px-6 sm:pb-20 md:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[250px] animate-pulse rounded-[28px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="rounded-[30px] border border-blue-100 bg-white px-5 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-50 text-4xl">
              🏆
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              ยังไม่มีข้อมูล Ranking
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
              เมื่อสมาชิกทำแบบทดสอบและมีผลสอบในระบบ
              อันดับจะแสดงที่หน้านี้โดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <>
            {/* TOP 3 */}
            <div className="mb-8">
              <div className="mb-5">
                <div className="text-[10px] font-black tracking-[0.18em] text-blue-600 sm:text-xs">
                  TOP PERFORMERS
                </div>

                <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                  อันดับสูงสุด
                </h2>
              </div>

              <div className="grid items-end gap-5 md:grid-cols-3">
                {topThree.map((member, index) => {
                  const rank = index + 1;
                  const style = getRankStyle(rank);

                  return (
                    <article
                      key={member.member_id}
                      className={`relative overflow-hidden rounded-[28px] border-2 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                        rank === 1
                          ? "md:-translate-y-4"
                          : ""
                      } ${style.card}`}
                    >
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/70 blur-2xl" />

                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${style.badge}`}
                          >
                            {style.icon}
                          </div>

                          <div className="text-4xl font-black text-slate-200">
                            #{rank}
                          </div>
                        </div>

                        <div className="mt-5">
                          <h3 className="break-words text-lg font-black leading-7 text-slate-900 sm:text-xl">
                            {member.name}
                          </h3>

                          <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-500">
                            {member.department}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white/80 p-3">
                            <div className="text-[10px] font-bold text-slate-400">
                              คะแนนรวม
                            </div>

                            <div className="mt-1 text-2xl font-black text-blue-600">
                              {member.total_score}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/80 p-3">
                            <div className="text-[10px] font-bold text-slate-400">
                              ผ่าน
                            </div>

                            <div className="mt-1 text-2xl font-black text-green-600">
                              {member.passed_count}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
                          <span className="text-xs font-bold text-slate-400">
                            คะแนนเฉลี่ย
                          </span>

                          <span className="text-lg font-black text-slate-900">
                            {member.average_percent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* REST */}
            {remaining.length > 0 && (
              <div>
                <div className="mb-5">
                  <div className="text-[10px] font-black tracking-[0.18em] text-blue-600 sm:text-xs">
                    LEADERBOARD
                  </div>

                  <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                    อันดับสมาชิก
                  </h2>
                </div>

                <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                  {remaining.map((member, index) => {
                    const rank = index + 4;

                    return (
                      <div
                        key={member.member_id}
                        className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-6"
                      >
                        <div className="flex items-center gap-4 sm:w-[45%]">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-500">
                            {rank}
                          </div>

                          <div className="min-w-0">
                            <div className="break-words font-black text-slate-900">
                              {member.name}
                            </div>

                            <div className="mt-0.5 break-words text-xs font-semibold leading-5 text-slate-400">
                              {member.department}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:flex-1">
                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                            <div className="text-[9px] font-bold text-slate-400">
                              คะแนน
                            </div>

                            <div className="text-sm font-black text-blue-600">
                              {member.total_score}
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                            <div className="text-[9px] font-bold text-slate-400">
                              ผ่าน
                            </div>

                            <div className="text-sm font-black text-green-600">
                              {member.passed_count}
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                            <div className="text-[9px] font-bold text-slate-400">
                              เฉลี่ย
                            </div>

                            <div className="text-sm font-black text-slate-900">
                              {member.average_percent.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row sm:px-6 md:px-8">
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
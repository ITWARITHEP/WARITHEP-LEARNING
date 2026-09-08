"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const departments = [
  "ฝ่ายสำนักบริหารกลาง",
  "ฝ่ายบริหารทรัพยากรมนุษย์",
  "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
  "ฝ่ายจัดซื้อจัดจ้าง",
  "ฝ่ายวิศวกรรม",
  "ฝ่ายคลังสินค้า",
  "ฝ่ายการขายและการตลาด",
  "ฝ่ายการเงิน",
  "ฝ่ายบัญชี",
  "ฝ่ายการภาษี",
  "ฝ่ายเทคโนโลยีสารสนเทศ",
  "ฝ่ายตรวจสอบภายใน",
  "ฝ่ายบริหารโครงการ",
];

type Video = {
  id: string;
  cloudflare_video_id: string | null;
  title: string | null;
  category: string | null;
  department: string | null;
  speaker: string | null;
  training_date: string | null;
  duration: number | null;
  description: string | null;
  thumbnail: string | null;
  video_url: string | null;
  published: boolean | null;
  created_at: string | null;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("");

  async function loadVideos() {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } =
        await supabase
          .from("knowledge_videos")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (supabaseError) {
        console.error(
          "LOAD KNOWLEDGE VIDEOS ERROR:",
          supabaseError
        );

        setError(supabaseError.message);
        return;
      }

      setVideos((data ?? []) as Video[]);
    } catch (err) {
      console.error("LOAD VIDEOS ERROR:", err);
      setError("ไม่สามารถโหลดข้อมูลวิดีโอได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();

    const interval = setInterval(() => {
      loadVideos();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredVideos = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !keyword ||
        (video.title ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (video.department ?? "")
          .toLowerCase()
          .includes(keyword) ||
        (video.speaker ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesDepartment =
        !selectedDepartment ||
        video.department === selectedDepartment;

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "published" &&
          video.published === true) ||
        (selectedStatus === "draft" &&
          video.published !== true);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    videos,
    search,
    selectedDepartment,
    selectedStatus,
  ]);

  const publishedCount = videos.filter(
    (video) => video.published === true
  ).length;

  const departmentCount = new Set(
    videos
      .map((video) => video.department)
      .filter(Boolean)
  ).size;

  const cloudflareCount = videos.filter(
    (video) => video.cloudflare_video_id
  ).length;

  const departmentVideoCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const department of departments) {
      counts[department] = 0;
    }

    for (const video of videos) {
      if (video.department) {
        counts[video.department] =
          (counts[video.department] ?? 0) + 1;
      }
    }

    return counts;
  }, [videos]);

  function formatDuration(seconds: number | null) {
    if (!seconds || seconds <= 0) {
      return "-";
    }

    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "th-TH",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

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

          <div className="flex items-center gap-2">

            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← Admin
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 sm:block"
            >
              🌐 เว็บไซต์
            </Link>

          </div>

        </div>

      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-600">
              VIDEO MANAGEMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              จัดการวิดีโอ
            </h1>

            <p className="mt-3 text-slate-500">
              จัดการวิดีโอสอนงานของแต่ละฝ่าย
            </p>

          </div>

          <Link
            href="/admin/videos/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มวิดีโอ
          </Link>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
            ⚠️ ไม่สามารถโหลดข้อมูลวิดีโอได้
            <div className="mt-1 font-normal">
              {error}
            </div>
          </div>
        )}

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🎬
            </div>

            <p className="mt-4 text-xs text-slate-400">
              วิดีโอทั้งหมด
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : videos.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
              ▶️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              เปิดใช้งาน
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : publishedCount}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              📚
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ฝ่ายที่มีวิดีโอ
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : departmentCount}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              ☁️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Cloudflare Stream
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : cloudflareCount}
            </p>

          </div>

        </section>

        {/* FILTER */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ค้นหาวิดีโอ
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ค้นหาชื่อวิดีโอ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* DEPARTMENT */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                เลือกฝ่าย
              </label>

              <select
                value={selectedDepartment}
                onChange={(e) =>
                  setSelectedDepartment(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกฝ่าย
                </option>

                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ))}

              </select>

            </div>

            {/* STATUS */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                สถานะ
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกสถานะ
                </option>

                <option value="published">
                  เปิดใช้งาน
                </option>

                <option value="draft">
                  แบบร่าง
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* VIDEO LIST */}
        <section className="mt-8">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <p className="font-bold text-blue-600">
                VIDEO LIST
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                รายการวิดีโอ
              </h2>

            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">
              {loading
                ? "กำลังโหลด..."
                : `${filteredVideos.length} รายการ`}
            </div>

          </div>

          {loading ? (

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="text-4xl">
                ⏳
              </div>

              <p className="mt-4 font-bold text-slate-600">
                กำลังโหลดข้อมูลวิดีโอ...
              </p>

            </div>

          ) : filteredVideos.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                🎬
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900">
                {videos.length === 0
                  ? "ยังไม่มีวิดีโอ"
                  : "ไม่พบวิดีโอที่ค้นหา"}
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-slate-500">
                {videos.length === 0
                  ? "เมื่อเพิ่มวิดีโอในระบบ ข้อมูลจะแสดงที่หน้านี้"
                  : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
              </p>

              {videos.length === 0 && (
                <Link
                  href="/admin/videos/new"
                  className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  + เพิ่มวิดีโอแรก
                </Link>
              )}

            </div>

          ) : (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredVideos.map((video) => (

                <div
                  key={video.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">

                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title ?? "วิดีโอ"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-5xl">
                        🎬
                      </div>
                    )}

                    {/* STATUS */}
                    <div className="absolute right-3 top-3">

                      {video.published ? (
                        <span className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-black text-white shadow">
                          เปิดใช้งาน
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-700 px-3 py-1.5 text-xs font-black text-white shadow">
                          แบบร่าง
                        </span>
                      )}

                    </div>

                    {/* DURATION */}
                    {video.duration &&
                      video.duration > 0 && (
                        <div className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-white">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                  </div>

                  {/* INFO */}
                  <div className="p-5">

                    <div className="mb-3">

                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {video.department || "ไม่ระบุฝ่าย"}
                      </span>

                    </div>

                    <h3 className="line-clamp-2 text-lg font-black leading-7 text-slate-900">
                      {video.title || "ไม่มีชื่อวิดีโอ"}
                    </h3>

                    {video.speaker && (
                      <p className="mt-2 text-sm text-slate-500">
                        👤 {video.speaker}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">

                      <div className="flex justify-between gap-3 text-xs">

                        <span className="text-slate-400">
                          Cloudflare ID
                        </span>

                        <span className="max-w-[180px] truncate font-mono text-slate-500">
                          {video.cloudflare_video_id || "-"}
                        </span>

                      </div>

                      <div className="flex justify-between gap-3 text-xs">

                        <span className="text-slate-400">
                          เพิ่มเมื่อ
                        </span>

                        <span className="font-semibold text-slate-500">
                          {formatDate(video.created_at)}
                        </span>

                      </div>

                    </div>

                    {/* WATCH */}
                    {video.video_url && (
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-blue-700"
                      >
                        ▶ ดูวิดีโอ
                      </a>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* DEPARTMENTS */}
        <section className="mt-12">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              VIDEO LIBRARY
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              วิดีโอแยกตามฝ่าย
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              จำนวนวิดีโอจากข้อมูลจริงใน Supabase
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {departments.map((department, index) => {

              const count =
                departmentVideoCounts[department] ?? 0;

              return (
                <div
                  key={department}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-bold leading-6 text-slate-900">
                        {department}
                      </h3>

                      <div className="mt-2">

                        <span
                          className={
                            count > 0
                              ? "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400"
                          }
                        >
                          {count} วิดีโอ
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Video Management
          </p>

        </div>

      </footer>

    </main>
  );
}
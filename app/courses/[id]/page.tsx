"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Video = {
  id: string;
  cloudflare_video_id: string;
  title: string;
  department: string;
  category: string;
  speaker: string | null;
  training_date: string | null;
  duration_seconds: number | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean;
};

const departments: Record<string, string> = {
  "1": "ฝ่ายสำนักบริหารกลาง",
  "2": "ฝ่ายบริหารทรัพยากรมนุษย์",
  "3": "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
  "4": "ฝ่ายจัดซื้อจัดจ้าง",
  "5": "ฝ่ายวิศวกรรม",
  "6": "ฝ่ายคลังสินค้า",
  "7": "ฝ่ายการขายและการตลาด",
  "8": "ฝ่ายการเงิน",
  "9": "ฝ่ายบัญชี",
  "10": "ฝ่ายการภาษี",
  "11": "ฝ่ายเทคโนโลยีสารสนเทศ",
  "12": "ฝ่ายตรวจสอบภายใน",
  "13": "ฝ่ายบริหารโครงการ",
};

function getEpisodeNumber(title: string) {
  const match = title.match(/\bEP[\s._-]*(\d+)\b/i);

  if (match) {
    return Number(match[1]);
  }

  return 999999;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function cleanTitle(title: string) {
  return title.replace(/\.(mp4|mov|mkv|avi|webm)$/i, "");
}

function getThumbnail(video: Video) {
  if (video.thumbnail_url) {
    return video.thumbnail_url;
  }

  return `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${video.cloudflare_video_id}/thumbnails/thumbnail.jpg`;
}

export default function CourseDepartmentPage() {
  const params = useParams();

  const id = String(params?.id || "");
  const departmentName = departments[id];

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadVideos() {
      if (!departmentName) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("knowledge_videos")
        .select(`
          id,
          cloudflare_video_id,
          title,
          department,
          category,
          speaker,
          training_date,
          duration_seconds,
          description,
          thumbnail_url,
          video_url,
          published
        `)
        .eq("department", departmentName)
        .eq("published", true)
        .eq("category", "course");

      if (error) {
        console.error("โหลดวิดีโอไม่สำเร็จ:", error);
        setVideos([]);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    }

    loadVideos();
  }, [departmentName]);

  /*
   * เรียง EP อัตโนมัติ
   * EP.1
   * EP.02
   * EP.03
   * EP.04
   * EP.10
   */
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const epA = getEpisodeNumber(a.title);
      const epB = getEpisodeNumber(b.title);

      if (epA !== epB) {
        return epA - epB;
      }

      return a.title.localeCompare(b.title, "th");
    });
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return sortedVideos;
    }

    return sortedVideos.filter((video) =>
      cleanTitle(video.title).toLowerCase().includes(keyword)
    );
  }, [sortedVideos, search]);

  if (!departmentName) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xl">
          <div className="text-5xl mb-4">❌</div>

          <h1 className="text-xl font-black text-slate-900">
            ไม่พบฝ่ายที่ต้องการ
          </h1>

          <Link
            href="/courses"
            className="inline-flex mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            ← กลับหน้าหลักสูตร
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8">
          <div className="h-[72px] flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-2xl">🎓</span>
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

            {/* Navigation */}
            <nav className="flex items-center gap-2 md:gap-6">
              <Link
                href="/dashboard"
                className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/courses"
                className="hidden sm:block text-sm font-bold text-blue-600"
              >
                📚 หลักสูตร
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

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-20 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative max-w-[1500px] mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-9">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-7">
            <Link
              href="/courses"
              className="text-slate-400 hover:text-blue-600 transition"
            >
              หลักสูตร
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-semibold text-slate-700">
              {departmentName}
            </span>
          </div>

          {/* Main Hero */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7] shadow-2xl shadow-blue-900/20">
            {/* Ice watermark */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-8 -top-20 text-[220px] leading-none text-white/[0.055] rotate-12">
                
              </div>

              <div className="absolute right-[180px] -bottom-24 text-[180px] leading-none text-white/[0.035] -rotate-12">
                
              </div>

              <div className="absolute -left-10 -bottom-32 text-[200px] leading-none text-white/[0.025] rotate-12">
                
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -top-32 right-20 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative px-6 md:px-10 py-8 md:py-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-7">
                <div className="flex items-center gap-5">
                  {/* Icon */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[26px] bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-xl">
                    <span className="text-5xl md:text-6xl">
                      {id === "1"
                        ? "🏢"
                        : id === "2"
                        ? "👥"
                        : id === "3"
                        ? "🎓"
                        : id === "4"
                        ? "🛒"
                        : id === "5"
                        ? "⚙️"
                        : id === "6"
                        ? "📦"
                        : id === "7"
                        ? "📈"
                        : id === "8"
                        ? "💳"
                        : id === "9"
                        ? "🧾"
                        : id === "10"
                        ? "📑"
                        : id === "11"
                        ? "💻"
                        : id === "12"
                        ? "🔍"
                        : "📊"}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-black tracking-[0.25em] text-blue-100/80 mb-2">
                      DEPARTMENT LEARNING
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                      {departmentName}
                    </h1>

                    <p className="text-blue-100 mt-2 text-sm md:text-base">
                      ห้องเรียนวิดีโอสอนงานประจำฝ่าย
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3">
                  <div className="min-w-[100px] px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                    <div className="text-2xl font-black text-white">
                      {videos.length}
                    </div>

                    <div className="text-[11px] text-blue-100">
                      วิดีโอ
                    </div>
                  </div>

                  <div className="min-w-[100px] px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                    <div className="text-2xl font-black text-white">
                      {videos.length}
                    </div>

                    <div className="text-[11px] text-blue-100">
                      บทเรียน
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-20">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-black tracking-wider mb-2">
              <span>🎬</span>
              VIDEO LESSONS
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-950">
              วิดีโอสอนงาน
            </h2>

            <p className="text-sm text-slate-500 mt-1.5">
              เลือกบทเรียนที่ต้องการเรียนรู้
            </p>
          </div>

          {/* Search */}
          {videos.length > 0 && (
            <div className="relative w-full md:w-[320px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาวิดีโอ..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm"
              />
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* LOADING */}
        {/* ==================================================== */}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse"
              >
                <div className="aspect-video rounded-2xl bg-slate-200" />

                <div className="flex gap-3 mt-4">
                  <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />

                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-11/12" />
                    <div className="h-3 bg-slate-200 rounded w-7/12 mt-3" />
                    <div className="h-3 bg-slate-200 rounded w-5/12 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================== */}
        {/* EMPTY */}
        {/* ==================================================== */}

        {!loading && videos.length === 0 && (
          <div className="bg-white rounded-[32px] border border-slate-200 p-16 md:p-24 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-5xl mb-6">
              🎬
            </div>

            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              ยังไม่มีวิดีโอสอนงาน
            </h3>

            <p className="text-slate-500 mt-2">
              เมื่อมีการเพิ่มวิดีโอของฝ่ายนี้
              วิดีโอจะแสดงที่นี่อัตโนมัติ
            </p>

            <Link
              href="/courses"
              className="inline-flex mt-7 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              ← กลับหน้าหลักสูตร
            </Link>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIDEO GRID */}
        {/* ==================================================== */}

        {!loading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-7 gap-y-10">
            {filteredVideos.map((video, index) => {
              const episode = getEpisodeNumber(video.title);
              const displayEpisode =
                episode !== 999999 ? episode : index + 1;

              return (
                <article
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-[20px] overflow-hidden bg-slate-200 shadow-sm group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={getThumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-500"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                    {/* EP */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-black shadow-lg">
                        EP.{displayEpisode}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 rounded-md bg-black/85 text-white text-xs font-bold">
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </div>

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/95 shadow-2xl flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                        <span className="text-blue-600 text-2xl ml-1">
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex gap-3 mt-4">
                    {/* Logo */}
                    <div className="shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-sm">
                        ว
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-[15px] md:text-[16px] leading-6 text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                        {cleanTitle(video.title)}
                      </h3>

                      <div className="text-sm text-slate-500 mt-1">
                        {departmentName}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>
                          EP.{displayEpisode}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDuration(
                            video.duration_seconds
                          )}
                        </span>

                        {video.speaker && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {video.speaker}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Search no result */}
        {!loading &&
          videos.length > 0 &&
          filteredVideos.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center">
              <div className="text-5xl mb-4">
                🔎
              </div>

              <h3 className="font-black text-lg">
                ไม่พบวิดีโอที่ค้นหา
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                ลองค้นหาด้วยคำอื่น
              </p>
            </div>
          )}
      </section>

      {/* ====================================================== */}
      {/* VIDEO PLAYER MODAL */}
      {/* ====================================================== */}

      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-6xl bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player Header */}
            <div className="bg-white px-5 md:px-7 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs text-blue-600 font-black mb-1">
                  EP.
                  {getEpisodeNumber(selectedVideo.title) !==
                  999999
                    ? getEpisodeNumber(selectedVideo.title)
                    : ""}
                </div>

                <h2 className="font-black text-slate-900 text-base md:text-xl truncate">
                  {cleanTitle(selectedVideo.title)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedVideo(null)}
                className="w-10 h-10 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Cloudflare Player */}
            <div className="aspect-video bg-black">
              <iframe
                src={`https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.cloudflare_video_id}/iframe`}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Description */}
            <div className="bg-white p-5 md:p-7">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                  EP.
                  {getEpisodeNumber(selectedVideo.title) !==
                  999999
                    ? getEpisodeNumber(selectedVideo.title)
                    : ""}
                </span>

                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  ⏱️{" "}
                  {formatDuration(
                    selectedVideo.duration_seconds
                  )}
                </span>

                {selectedVideo.speaker && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    👨‍🏫 {selectedVideo.speaker}
                  </span>
                )}
              </div>

              {selectedVideo.description && (
                <p className="text-sm md:text-base text-slate-600 leading-7">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
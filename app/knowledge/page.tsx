"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Video = {
  id: string;
  cloudflare_video_id: string;
  title: string;
  category: string;
  department: string | null;
  speaker: string | null;
  training_date: string | null;
  duration_seconds: number | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean;
};

const categories = [
  {
    id: "all",
    name: "ทั้งหมด",
    icon: "🎬",
  },
  {
    id: "lecturer",
    name: "วิทยากร",
    icon: "👨‍🏫",
  },
  {
    id: "executive",
    name: "ผู้บริหารบรรยาย",
    icon: "👔",
  },
  {
    id: "knowledge",
    name: "แชร์ความรู้",
    icon: "💡",
  },
  {
    id: "training",
    name: "อบรมย้อนหลัง",
    icon: "📹",
  },
  {
    id: "course",
    name: "วิดีโอหลักสูตร",
    icon: "📚",
  },
];

const categoryInfo: Record<
  string,
  {
    name: string;
    icon: string;
  }
> = {
  lecturer: {
    name: "วิทยากร",
    icon: "👨‍🏫",
  },
  executive: {
    name: "ผู้บริหารบรรยาย",
    icon: "👔",
  },
  knowledge: {
    name: "แชร์ความรู้",
    icon: "💡",
  },
  training: {
    name: "อบรมย้อนหลัง",
    icon: "📹",
  },
  course: {
    name: "วิดีโอหลักสูตร",
    icon: "📚",
  },
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
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

function formatDate(date: string | null) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);

  /*
   * โหลดวิดีโอจาก Supabase
   *
   * แยกออกจาก useEffect เพื่อไม่ให้ ESLint
   * ฟ้อง react-hooks/set-state-in-effect
   */
  async function loadVideos() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("knowledge_videos")
        .select(`
          id,
          cloudflare_video_id,
          title,
          category,
          department,
          speaker,
          training_date,
          duration_seconds,
          description,
          thumbnail_url,
          video_url,
          published
        `)
        .eq("published", true)
        .neq("category", "course")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "โหลดคลังความรู้ไม่สำเร็จ:",
          error
        );

        setVideos([]);
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error("Knowledge Error:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVideos();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    videos.forEach((video) => {
      counts[video.category] =
        (counts[video.category] || 0) + 1;
    });

    return counts;
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return videos.filter((video) => {
      const categoryMatch =
        activeCategory === "all" ||
        video.category === activeCategory;

      if (!categoryMatch) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const text = [
        video.title,
        video.department || "",
        video.speaker || "",
        video.description || "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [videos, search, activeCategory]);

  const lecturerCount =
    categoryCounts["lecturer"] || 0;

  const executiveCount =
    categoryCounts["executive"] || 0;

  const totalViews = 0;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <div className="flex h-[72px] items-center justify-between">
            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20">
                <div className="absolute inset-0 bg-white/10" />

                <span className="relative text-2xl">
                  🎓
                </span>
              </div>

              <div className="leading-tight">
                <div className="text-lg font-black text-slate-900">
                  วารีเทพ
                </div>

                <div className="text-[10px] font-black tracking-[0.22em] text-blue-600">
                  LEARNING
                </div>
              </div>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex items-center gap-1 md:gap-3">
              <Link
                href="/dashboard"
                className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 sm:block"
              >
                Dashboard
              </Link>

              <Link
                href="/courses"
                className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 sm:block"
              >
                ห้องเรียน
              </Link>

              <Link
                href="/knowledge"
                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600"
              >
                🎤 ความรู้
              </Link>

              <Link
                href="/ranking"
                className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 sm:block"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition hover:bg-blue-100"
              >
                👤
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-20 -top-40 h-[550px] w-[550px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-10 md:px-8 md:pt-14">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7] shadow-2xl shadow-blue-900/20">
            {/* ICE WATERMARK */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-10 -top-24 rotate-12 text-[250px] leading-none text-white/[0.06]">
                ❄
              </div>

              <div className="absolute -bottom-32 right-[220px] -rotate-12 text-[190px] leading-none text-white/[0.035]">
                ❄
              </div>

              <div className="absolute -bottom-36 -left-10 rotate-12 text-[220px] leading-none text-white/[0.025]">
                ❄
              </div>

              {/* CRYSTAL LINES */}
              <div className="absolute right-20 top-0 h-full w-[320px] opacity-[0.07]">
                <div className="absolute right-20 top-5 h-56 w-px rotate-[35deg] bg-white" />

                <div className="absolute right-20 top-5 h-56 w-px rotate-[-35deg] bg-white" />

                <div className="absolute right-20 top-5 h-px w-56 rotate-[35deg] bg-white" />

                <div className="absolute right-20 top-5 h-px w-56 rotate-[-35deg] bg-white" />
              </div>

              {/* SPARKLES */}
              <div className="absolute right-28 top-14 h-2 w-2 rounded-full bg-white/40" />

              <div className="absolute right-52 top-28 h-1.5 w-1.5 rounded-full bg-white/30" />

              <div className="absolute bottom-12 right-32 h-2 w-2 rounded-full bg-white/30" />
            </div>

            {/* GLOW */}
            <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative px-6 py-9 md:px-10 md:py-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black tracking-wider text-white backdrop-blur-md">
                    🎤 KNOWLEDGE CENTER
                  </div>

                  <h1 className="mt-5 text-3xl font-black leading-tight text-white drop-shadow-lg md:text-5xl">
                    วิดีโอ อบรมและบรรยาย
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
                    ศูนย์รวมวิดีโอจากการอบรมจริง
                    การบรรยายจากผู้บริหาร วิทยากร
                    และการแบ่งปันความรู้ภายในองค์กร
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                      🎬 <b>{videos.length}</b> วิดีโอ
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                      👨‍🏫 <b>{lecturerCount}</b> วิทยากร
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                      👔 <b>{executiveCount}</b> ผู้บริหาร
                    </div>
                  </div>
                </div>

                {/* HERO ICON */}
                <div className="relative hidden h-36 w-36 shrink-0 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md md:flex">
                  <div className="absolute inset-0 rounded-[32px] bg-white/5 blur-xl" />

                  <span className="relative text-7xl drop-shadow-2xl">
                    🎤
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-[1500px] px-5 pb-8 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
          {/* VIDEOS */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
                🎬
              </div>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-500">
                VIDEO
              </span>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-black">
                {loading ? "—" : videos.length}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-500">
                วิดีโอทั้งหมด
              </div>
            </div>
          </div>

          {/* LECTURER */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl">
                👨‍🏫
              </div>

              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-black text-purple-600">
                LECTURER
              </span>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-black">
                {loading ? "—" : lecturerCount}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-500">
                วิดีโอวิทยากร
              </div>
            </div>
          </div>

          {/* EXECUTIVE */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                👔
              </div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600">
                EXECUTIVE
              </span>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-black">
                {loading ? "—" : executiveCount}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-500">
                ผู้บริหารบรรยาย
              </div>
            </div>
          </div>

          {/* VIEWS */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                👀
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                VIEWS
              </span>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-black">
                {totalViews}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-500">
                การรับชม
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ค้นหาวิดีโอ หัวข้อ วิทยากร หรือฝ่าย..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="h-12 rounded-2xl bg-slate-100 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => {
            const count =
              category.id === "all"
                ? videos.length
                : categoryCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategory(category.id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all md:px-5 ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <span>{category.icon}</span>

                <span>{category.name}</span>

                <span
                  className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[10px] ${
                    activeCategory === category.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* LIBRARY TITLE */}
      <section className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-black tracking-[0.2em] text-blue-600">
              KNOWLEDGE LIBRARY
            </div>

            <h2 className="mt-1 text-2xl font-black md:text-3xl">
              คลังวิดีโอความรู้
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              รับชมวิดีโอการอบรมและการบรรยายย้อนหลัง
            </p>
          </div>

          <div className="text-sm font-semibold text-slate-400">
            {loading
              ? "กำลังโหลด..."
              : `${filteredVideos.length} รายการ`}
          </div>
        </div>
      </section>

      {/* VIDEO LIBRARY */}
      <section className="mx-auto max-w-[1500px] px-5 pb-20 md:px-8">
        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse"
              >
                <div className="aspect-video rounded-[20px] bg-slate-200" />

                <div className="mt-4 flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-4 w-11/12 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-7/12 rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-5/12 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIDEOS */}
        {!loading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => {
              const info =
                categoryInfo[video.category] || {
                  name: "ความรู้",
                  icon: "💡",
                };

              return (
                <article
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    setSelectedVideo(video)
                  }
                >
                  {/* THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden rounded-[20px] bg-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl">
                    <img
                      src={getThumbnail(video)}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* CATEGORY */}
                    <div className="absolute left-3 top-3">
                      <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                        {info.icon} {info.name}
                      </span>
                    </div>

                    {/* DURATION */}
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-md bg-black/85 px-2 py-1 text-xs font-black text-white">
                        {formatDuration(
                          video.duration_seconds
                        )}
                      </span>
                    </div>

                    {/* PLAY */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <span className="ml-1 text-2xl text-blue-600">
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="mt-4 flex gap-3">
                    <div className="shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 font-black text-white shadow-sm">
                        VDO
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[15px] font-black leading-6 text-slate-900 transition group-hover:text-blue-600 md:text-[16px]">
                        {cleanTitle(video.title)}
                      </h3>

                      <div className="mt-1 text-sm text-slate-500">
                        {video.department ||
                          "วารีเทพ Learning"}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        {video.speaker && (
                          <span className="max-w-[150px] truncate">
                            👨‍🏫 {video.speaker}
                          </span>
                        )}

                        {video.training_date && (
                          <>
                            {video.speaker && (
                              <span>•</span>
                            )}

                            <span>
                              {formatDate(
                                video.training_date
                              )}
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

        {/* EMPTY */}
        {!loading && filteredVideos.length === 0 && (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-14 text-center md:p-20">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-blue-50 text-5xl">
              <div className="absolute -right-4 -top-6 text-7xl opacity-10">
                ❄
              </div>

              🎬
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-800">
              {videos.length === 0
                ? "ยังไม่มีวิดีโอ"
                : "ไม่พบวิดีโอที่ค้นหา"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
              {videos.length === 0
                ? "เมื่อมีการบันทึกการอบรม การบรรยายจากผู้บริหาร วิทยากร หรือการแบ่งปันความรู้ วิดีโอจะถูกเพิ่มเข้ามาที่นี่"
                : "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น"}
            </p>

            {videos.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                ดูวิดีโอทั้งหมด
              </button>
            )}
          </div>
        )}
      </section>

      {/* VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm md:p-8"
          onClick={() =>
            setSelectedVideo(null)
          }
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-2xl bg-black shadow-2xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 bg-white px-5 py-4 md:px-7">
              <div className="min-w-0">
                <div className="mb-1 text-xs font-black text-blue-600">
                  {categoryInfo[
                    selectedVideo.category
                  ]?.icon || "🎬"}{" "}
                  {categoryInfo[
                    selectedVideo.category
                  ]?.name || "ความรู้"}
                </div>

                <h2 className="truncate text-base font-black text-slate-900 md:text-xl">
                  {cleanTitle(
                    selectedVideo.title
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVideo(null)
                }
                className="h-10 w-10 shrink-0 rounded-full bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* PLAYER */}
            <div className="aspect-video bg-black">
              <iframe
                src={`https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.cloudflare_video_id}/iframe`}
                className="h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedVideo.title}
              />
            </div>

            {/* INFO */}
            <div className="bg-white p-5 md:p-7">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  🎬{" "}
                  {categoryInfo[
                    selectedVideo.category
                  ]?.name || "ความรู้"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  ⏱️{" "}
                  {formatDuration(
                    selectedVideo.duration_seconds
                  )}
                </span>

                {selectedVideo.department && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    🏢 {selectedVideo.department}
                  </span>
                )}

                {selectedVideo.speaker && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    👨‍🏫 {selectedVideo.speaker}
                  </span>
                )}
              </div>

              {selectedVideo.description && (
                <p className="text-sm leading-7 text-slate-600 md:text-base">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="font-black text-slate-700">
              🎓 วารีเทพ Learning
            </div>

            <div className="text-xs text-slate-400">
              Learning • Training • Knowledge
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(
    null
  );

  useEffect(() => {
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
        console.error(
          "Knowledge Error:",
          error
        );

        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
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

            <nav className="flex items-center gap-1 md:gap-3">

              <Link
                href="/dashboard"
                className="hidden sm:block rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/courses"
                className="hidden sm:block rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
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
                className="hidden sm:block rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
              >
                🏆 Ranking
              </Link>

              <Link
                href="/profile"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition"
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

        {/* Glow */}

        <div className="absolute -top-40 -right-20 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute top-20 -left-40 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="max-w-[1500px] mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-10">

          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#063bcf] via-[#155eef] to-[#1736b7] shadow-2xl shadow-blue-900/20">

            {/* ================================================= */}
            {/* ICE WATERMARK */}
            {/* ================================================= */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

              <div className="absolute -right-10 -top-24 text-[250px] leading-none text-white/[0.06] rotate-12">
                ❄
              </div>

              <div className="absolute right-[220px] -bottom-32 text-[190px] leading-none text-white/[0.035] -rotate-12">
                ❄
              </div>

              <div className="absolute -left-10 -bottom-36 text-[220px] leading-none text-white/[0.025] rotate-12">
                ❄
              </div>

              {/* Crystal lines */}

              <div className="absolute right-20 top-0 w-[320px] h-full opacity-[0.07]">

                <div className="absolute right-20 top-5 w-px h-56 bg-white rotate-[35deg]" />

                <div className="absolute right-20 top-5 w-px h-56 bg-white rotate-[-35deg]" />

                <div className="absolute right-20 top-5 w-56 h-px bg-white rotate-[35deg]" />

                <div className="absolute right-20 top-5 w-56 h-px bg-white rotate-[-35deg]" />

              </div>

              {/* Sparkles */}

              <div className="absolute top-14 right-28 w-2 h-2 rounded-full bg-white/40" />

              <div className="absolute top-28 right-52 w-1.5 h-1.5 rounded-full bg-white/30" />

              <div className="absolute bottom-12 right-32 w-2 h-2 rounded-full bg-white/30" />

            </div>


            {/* Glow */}

            <div className="absolute -top-32 right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />


            <div className="relative px-6 md:px-10 py-9 md:py-12">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                <div className="max-w-3xl">

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-black tracking-wider">

                    🎤 KNOWLEDGE CENTER

                  </div>

                  <h1 className="mt-5 text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-lg">
                    วิดีโอ อบรมและบรรยาย
                  </h1>

                  <p className="mt-4 text-sm md:text-base leading-7 text-blue-100 max-w-2xl">
                    ศูนย์รวมวิดีโอจากการอบรมจริง
                    การบรรยายจากผู้บริหาร วิทยากร
                    และการแบ่งปันความรู้ภายในองค์กร
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm">
                      🎬{" "}
                      <b>{videos.length}</b>{" "}
                      วิดีโอ
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm">
                      👨‍🏫{" "}
                      <b>{lecturerCount}</b>{" "}
                      วิทยากร
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm">
                      👔{" "}
                      <b>{executiveCount}</b>{" "}
                      ผู้บริหาร
                    </div>

                  </div>

                </div>


                {/* HERO ICON */}

                <div className="hidden md:flex relative shrink-0 w-36 h-36 rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-md items-center justify-center shadow-2xl">

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


      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-8">

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">

          {/* Videos */}

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                🎬
              </div>

              <span className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                VIDEO
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl font-black">
                {loading ? "—" : videos.length}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                วิดีโอทั้งหมด
              </div>

            </div>

          </div>


          {/* Lecturer */}

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                👨‍🏫
              </div>

              <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                LECTURER
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl font-black">
                {loading ? "—" : lecturerCount}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                วิดีโอวิทยากร
              </div>

            </div>

          </div>


          {/* Executive */}

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                👔
              </div>

              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                EXECUTIVE
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl font-black">
                {loading ? "—" : executiveCount}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                ผู้บริหารบรรยาย
              </div>

            </div>

          </div>


          {/* Views */}

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                👀
              </div>

              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                VIEWS
              </span>

            </div>

            <div className="mt-5">

              <div className="text-3xl font-black">
                {totalViews}
              </div>

              <div className="text-sm font-semibold text-slate-500 mt-1">
                การรับชม
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* SEARCH */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8">

        <div className="bg-white rounded-[26px] border border-slate-200 p-4 shadow-sm">

          <div className="flex flex-col md:flex-row gap-3">

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
                className="w-full h-12 pl-12 pr-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm"
              />

            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition"
            >
              รีเซ็ต
            </button>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* CATEGORY */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 py-7">

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

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
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 md:px-5 py-3 text-sm font-bold transition-all ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >

                <span>
                  {category.icon}
                </span>

                <span>
                  {category.name}
                </span>

                <span
                  className={`min-w-6 px-1.5 py-0.5 rounded-full text-[10px] text-center ${
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


      {/* ===================================================== */}
      {/* LIBRARY TITLE */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">

          <div>

            <div className="text-xs font-black tracking-[0.2em] text-blue-600">
              KNOWLEDGE LIBRARY
            </div>

            <h2 className="text-2xl md:text-3xl font-black mt-1">
              คลังวิดีโอความรู้
            </h2>

            <p className="text-sm text-slate-500 mt-1.5">
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


      {/* ===================================================== */}
      {/* VIDEO LIBRARY */}
      {/* ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-5 md:px-8 pb-20">

        {/* LOADING */}

        {loading && (

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-7 gap-y-10">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (

                <div
                  key={item}
                  className="animate-pulse"
                >

                  <div className="aspect-video rounded-[20px] bg-slate-200" />

                  <div className="flex gap-3 mt-4">

                    <div className="w-11 h-11 rounded-full bg-slate-200" />

                    <div className="flex-1">

                      <div className="h-4 bg-slate-200 rounded w-11/12" />

                      <div className="h-3 bg-slate-200 rounded w-7/12 mt-3" />

                      <div className="h-3 bg-slate-200 rounded w-5/12 mt-2" />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}


        {/* VIDEOS */}

        {!loading &&
          filteredVideos.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-7 gap-y-10">

              {filteredVideos.map(
                (video) => {

                  const info =
                    categoryInfo[
                      video.category
                    ] || {
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

                      <div className="relative aspect-video rounded-[20px] overflow-hidden bg-slate-200 shadow-sm group-hover:shadow-xl transition-all duration-300">

                        <img
                          src={getThumbnail(video)}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-500"
                        />

                        {/* Overlay */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />


                        {/* Category */}

                        <div className="absolute top-3 left-3">

                          <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-black shadow-lg">
                            {info.icon}{" "}
                            {info.name}
                          </span>

                        </div>


                        {/* Duration */}

                        <div className="absolute bottom-3 right-3">

                          <span className="px-2 py-1 rounded-md bg-black/85 text-white text-xs font-black">
                            {formatDuration(
                              video.duration_seconds
                            )}
                          </span>

                        </div>


                        {/* PLAY */}

                        <div className="absolute inset-0 flex items-center justify-center">

                          <div className="w-16 h-16 rounded-full bg-white/95 shadow-2xl flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">

                            <span className="text-blue-600 text-2xl ml-1">
                              ▶
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* INFO */}

                      <div className="flex gap-3 mt-4">

                        {/* Avatar */}

                        <div className="shrink-0">

                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-sm">
                            ว
                          </div>

                        </div>


                        <div className="min-w-0 flex-1">

                          <h3 className="font-black text-[15px] md:text-[16px] leading-6 text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                            {cleanTitle(
                              video.title
                            )}
                          </h3>

                          <div className="text-sm text-slate-500 mt-1">
                            {video.department ||
                              "วารีเทพ Learning"}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">

                            {video.speaker && (
                              <span className="truncate max-w-[150px]">
                                👨‍🏫{" "}
                                {video.speaker}
                              </span>
                            )}

                            {video.training_date && (
                              <>
                                {video.speaker && (
                                  <span>
                                    •
                                  </span>
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
                }
              )}

            </div>

          )}


        {/* EMPTY */}

        {!loading &&
          filteredVideos.length === 0 && (

            <div className="bg-white rounded-[32px] border border-dashed border-slate-300 p-14 md:p-20 text-center">

              <div className="relative w-24 h-24 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-5xl overflow-hidden">

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
                  className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                >
                  ดูวิดีโอทั้งหมด
                </button>
              )}

            </div>

          )}

      </section>


      {/* ===================================================== */}
      {/* VIDEO PLAYER MODAL */}
      {/* ===================================================== */}

      {selectedVideo && (

        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() =>
            setSelectedVideo(null)
          }
        >

          <div
            className="w-full max-w-6xl bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="bg-white px-5 md:px-7 py-4 flex items-center justify-between gap-4">

              <div className="min-w-0">

                <div className="text-xs text-blue-600 font-black mb-1">

                  {categoryInfo[
                    selectedVideo.category
                  ]?.icon || "🎬"}{" "}

                  {categoryInfo[
                    selectedVideo.category
                  ]?.name || "ความรู้"}

                </div>

                <h2 className="font-black text-slate-900 text-base md:text-xl truncate">
                  {cleanTitle(
                    selectedVideo.title
                  )}
                </h2>

              </div>


              <button
                onClick={() =>
                  setSelectedVideo(null)
                }
                className="w-10 h-10 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                ✕
              </button>

            </div>


            {/* PLAYER */}

            <div className="aspect-video bg-black">

              <iframe
                src={`https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.cloudflare_video_id}/iframe`}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

            </div>


            {/* INFO */}

            <div className="bg-white p-5 md:p-7">

              <div className="flex flex-wrap items-center gap-2 mb-4">

                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                  🎬{" "}
                  {categoryInfo[
                    selectedVideo.category
                  ]?.name || "ความรู้"}
                </span>

                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  ⏱️{" "}
                  {formatDuration(
                    selectedVideo.duration_seconds
                  )}
                </span>

                {selectedVideo.department && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    🏢{" "}
                    {selectedVideo.department}
                  </span>
                )}

                {selectedVideo.speaker && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    👨‍🏫{" "}
                    {selectedVideo.speaker}
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


      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-8">

          <div className="flex flex-col md:flex-row items-center justify-between gap-3">

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
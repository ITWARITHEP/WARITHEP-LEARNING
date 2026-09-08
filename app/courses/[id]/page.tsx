"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type VideoProgress = {
  progress_percent: number;
  completed: boolean;
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

const departmentIcons: Record<string, string> = {
  "1": "🏢",
  "2": "👥",
  "3": "🎓",
  "4": "🛒",
  "5": "⚙️",
  "6": "📦",
  "7": "📈",
  "8": "💳",
  "9": "🧾",
  "10": "📑",
  "11": "💻",
  "12": "🔍",
  "13": "📊",
};

function getEpisodeNumber(title: string) {
  const match = title.match(/\bEP[\s._-]*(\d+)\b/i);

  if (match) {
    return Number(match[1]);
  }

  return 999999;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return "00:00";
  }

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
  return title
    .replace(/\.(mp4|mov|mkv|avi|webm)$/i, "")
    .trim();
}

function getThumbnail(video: Video) {
  if (video.thumbnail_url) {
    return video.thumbnail_url;
  }

  return `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${video.cloudflare_video_id}/thumbnails/thumbnail.jpg`;
}

export default function CourseDepartmentPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params?.id || "");
  const departmentName = departments[id];

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [progressMap, setProgressMap] = useState<
    Record<string, VideoProgress>
  >({});

  /*
  |--------------------------------------------------------------------------
  | โหลดวิดีโอ
  |--------------------------------------------------------------------------
  */

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
        console.error(
          "โหลดวิดีโอไม่สำเร็จ:",
          error
        );

        setVideos([]);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    }

    loadVideos();
  }, [departmentName]);

  /*
  |--------------------------------------------------------------------------
  | โหลดความคืบหน้าของสมาชิก
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadProgress() {
      try {
        const savedMember =
          localStorage.getItem(
            "warithep_learning_member"
          );

        if (!savedMember) {
          return;
        }

        const member = JSON.parse(savedMember);

        let memberId = member?.id;

        /*
        | ถ้า localStorage ยังไม่มี id
        | ให้ค้นจากชื่อสมาชิก
        */

        if (!memberId && member?.name) {
          const { data, error } =
            await supabase
              .from("members")
              .select("id")
              .eq(
                "name",
                member.name.trim()
              )
              .maybeSingle();

          if (!error && data?.id) {
            memberId = data.id;

            localStorage.setItem(
              "warithep_learning_member",
              JSON.stringify({
                ...member,
                id: data.id,
              })
            );
          }
        }

        if (!memberId) {
          return;
        }

        const { data, error } =
          await supabase
            .from("video_progress")
            .select(
              "video_id, progress_percent, completed"
            )
            .eq(
              "member_id",
              memberId
            );

        if (error) {
          console.error(
            "โหลดความคืบหน้าไม่สำเร็จ:",
            error
          );

          return;
        }

        const map: Record<
          string,
          VideoProgress
        > = {};

        (data || []).forEach((item) => {
          map[item.video_id] = {
            progress_percent: Number(
              item.progress_percent || 0
            ),
            completed: Boolean(
              item.completed
            ),
          };
        });

        setProgressMap(map);
      } catch (error) {
        console.error(
          "Progress Error:",
          error
        );
      }
    }

    loadProgress();
  }, [videos]);

  /*
  |--------------------------------------------------------------------------
  | เรียง EP
  |--------------------------------------------------------------------------
  */

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const epA = getEpisodeNumber(a.title);
      const epB = getEpisodeNumber(b.title);

      if (epA !== epB) {
        return epA - epB;
      }

      return a.title.localeCompare(
        b.title,
        "th"
      );
    });
  }, [videos]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredVideos = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return sortedVideos;
    }

    return sortedVideos.filter((video) =>
      cleanTitle(video.title)
        .toLowerCase()
        .includes(keyword)
    );
  }, [sortedVideos, search]);

  /*
  |--------------------------------------------------------------------------
  | ไม่พบฝ่าย
  |--------------------------------------------------------------------------
  */

  if (!departmentName) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-6">

        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">

          <div className="mb-4 text-5xl">
            ❌
          </div>

          <h1 className="text-xl font-black text-slate-900">
            ไม่พบฝ่ายที่ต้องการ
          </h1>

          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            ← กลับหน้าหลักสูตร
          </Link>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto max-w-[1500px] px-4 md:px-8">

          <div className="flex h-[68px] items-center justify-between gap-3">

            {/* LOGO */}

            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20">
                <span className="text-xl">
                  🎓
                </span>
              </div>

              <div className="hidden leading-tight sm:block">

                <div className="text-base font-black text-slate-900">
                  วารีเทพ
                </div>

                <div className="text-[9px] font-black tracking-[0.22em] text-blue-600">
                  LEARNING
                </div>

              </div>

            </Link>

            {/* NAVIGATION */}

            <nav className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-lg">
                  ←
                </span>

                <span className="hidden sm:inline">
                  ย้อนกลับ
                </span>
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                <span>⌂</span>

                <span className="hidden sm:inline">
                  หน้าหลัก
                </span>
              </Link>

              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl transition hover:bg-blue-100"
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

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-4 pb-9 pt-6 md:px-8 md:pt-8">

          {/* BREADCRUMB */}

          <div className="mb-6 flex items-center gap-2 text-sm">

            <Link
              href="/courses"
              className="font-semibold text-slate-400 transition hover:text-blue-600"
            >
              หลักสูตร
            </Link>

            <span className="text-slate-300">
              /
            </span>

            <span className="truncate font-bold text-slate-700">
              {departmentName}
            </span>

          </div>

          {/* HERO CARD */}

          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#06318f] via-[#0b4fc4] to-[#082b78] shadow-2xl shadow-blue-900/20">

            {/* SOFT GLOW */}

            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="relative px-5 py-7 md:px-10 md:py-10">

              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">

                {/* DEPARTMENT */}

                <div className="flex items-center gap-4 md:gap-5">

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-md md:h-24 md:w-24">

                    <span className="text-5xl md:text-6xl">
                      {departmentIcons[id] ||
                        "📚"}
                    </span>

                  </div>

                  <div className="min-w-0">

                    <div className="mb-2 text-[10px] font-black tracking-[0.25em] text-blue-100/80 md:text-xs">
                      DEPARTMENT LEARNING
                    </div>

                    <h1 className="text-2xl font-black leading-tight text-white drop-shadow-lg md:text-4xl">
                      {departmentName}
                    </h1>

                    <p className="mt-2 text-sm text-blue-100 md:text-base">
                      ห้องเรียนวิดีโอสอนงานประจำฝ่าย
                    </p>

                  </div>

                </div>

                {/* STATS */}

                <div className="flex gap-3">

                  <div className="min-w-[95px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-md">

                    <div className="text-2xl font-black text-white">
                      {videos.length}
                    </div>

                    <div className="text-[11px] text-blue-100">
                      วิดีโอ
                    </div>

                  </div>

                  <div className="min-w-[95px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-md">

                    <div className="text-2xl font-black text-white">
                      {
                        Object.values(
                          progressMap
                        ).filter(
                          (item) =>
                            item.completed
                        ).length
                      }
                    </div>

                    <div className="text-[11px] text-blue-100">
                      เรียนจบ
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

      <section className="mx-auto max-w-[1500px] px-4 pb-20 md:px-8">

        {/* SECTION HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <div className="mb-2 inline-flex items-center gap-2 text-xs font-black tracking-wider text-blue-600">

              <span>🎬</span>

              VIDEO LESSONS

            </div>

            <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
              วิดีโอสอนงาน
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              เลือกบทเรียนที่ต้องการเรียนรู้
            </p>

          </div>

          {/* SEARCH */}

          {videos.length > 0 && (

            <div className="relative w-full md:w-[320px]">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
                placeholder="ค้นหาวิดีโอ..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          )}

        </div>

        {/* ==================================================== */}
        {/* LOADING */}
        {/* ==================================================== */}

        {loading && (

          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (

                <div
                  key={item}
                  className="animate-pulse"
                >

                  <div className="aspect-video rounded-2xl bg-slate-200" />

                  <div className="mt-4 flex gap-3">

                    <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />

                    <div className="flex-1">

                      <div className="h-4 w-11/12 rounded bg-slate-200" />

                      <div className="mt-3 h-3 w-7/12 rounded bg-slate-200" />

                      <div className="mt-2 h-3 w-5/12 rounded bg-slate-200" />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

        {/* ==================================================== */}
        {/* EMPTY */}
        {/* ==================================================== */}

        {!loading &&
          videos.length === 0 && (

            <div className="rounded-[32px] border border-slate-200 bg-white p-16 text-center shadow-sm md:p-24">

              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                🎬
              </div>

              <h3 className="text-xl font-black text-slate-900 md:text-2xl">
                ยังไม่มีวิดีโอสอนงาน
              </h3>

              <p className="mt-2 text-slate-500">
                เมื่อมีการเพิ่มวิดีโอของฝ่ายนี้
                วิดีโอจะแสดงที่นี่อัตโนมัติ
              </p>

              <Link
                href="/courses"
                className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                ← กลับหน้าหลักสูตร
              </Link>

            </div>

          )}

        {/* ==================================================== */}
        {/* VIDEO GRID */}
        {/* ==================================================== */}

        {!loading &&
          filteredVideos.length > 0 && (

            <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">

              {filteredVideos.map(
                (video, index) => {

                  const episode =
                    getEpisodeNumber(
                      video.title
                    );

                  const displayEpisode =
                    episode !== 999999
                      ? episode
                      : index + 1;

                  const videoProgress =
                    progressMap[
                      video.id
                    ];

                  const progress =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          videoProgress?.progress_percent ||
                            0
                        )
                      )
                    );

                  const isCompleted =
                    Boolean(
                      videoProgress?.completed
                    );

                  return (
                    <Link
                      key={video.id}
                      href={`/videos/${video.id}`}
                      className="group block"
                    >

                      {/* THUMBNAIL */}

                      <div className="relative aspect-video overflow-hidden rounded-[20px] bg-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl">

                        <img
                          src={getThumbnail(
                            video
                          )}
                          alt={cleanTitle(
                            video.title
                          )}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                        />

                        {/* GRADIENT */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                        {/* EP */}

                        <div className="absolute left-3 top-3">

                          <span className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                            EP.{displayEpisode}
                          </span>

                        </div>

                        {/* DURATION */}

                        <div className="absolute bottom-3 right-3">

                          <span className="rounded-md bg-black/85 px-2 py-1 text-xs font-bold text-white">
                            {formatDuration(
                              video.duration_seconds
                            )}
                          </span>

                        </div>

                        {/* PLAY */}

                        <div className="absolute inset-0 flex items-center justify-center">

                          <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-white/95 text-2xl opacity-0 shadow-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">

                            <span className="ml-1 text-blue-600">
                              ▶
                            </span>

                          </div>

                        </div>

                        {/* COMPLETED */}

                        {isCompleted && (

                          <div className="absolute bottom-3 left-3">

                            <span className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                              ✓ เรียนจบแล้ว
                            </span>

                          </div>

                        )}

                        {/* PROGRESS BAR */}

                        {progress > 0 &&
                          !isCompleted && (

                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">

                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />

                            </div>

                          )}

                      </div>

                      {/* VIDEO INFO */}

                      <div className="mt-4 flex gap-3">

                        {/* LOGO */}

                        <div className="shrink-0">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 font-black text-white shadow-sm">
                            ว
                          </div>

                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">

                          <h3 className="line-clamp-2 text-[15px] font-black leading-6 text-slate-900 transition group-hover:text-blue-600 md:text-[16px]">
                            {cleanTitle(
                              video.title
                            )}
                          </h3>

                          <div className="mt-1 text-sm text-slate-500">
                            {departmentName}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                            <span>
                              EP.{displayEpisode}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {formatDuration(
                                video.duration_seconds
                              )}
                            </span>

                            {video.speaker && (
                              <>
                                <span>
                                  •
                                </span>

                                <span className="truncate">
                                  {
                                    video.speaker
                                  }
                                </span>
                              </>
                            )}

                          </div>

                          {/* PROGRESS TEXT */}

                          {progress > 0 && (
                            <div className="mt-2 flex items-center gap-2">

                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className={`h-full rounded-full ${
                                    isCompleted
                                      ? "bg-green-500"
                                      : "bg-blue-600"
                                  }`}
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />

                              </div>

                              <span
                                className={`shrink-0 text-[11px] font-black ${
                                  isCompleted
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {isCompleted
                                  ? "จบแล้ว"
                                  : `${progress}%`}
                              </span>

                            </div>
                          )}

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          )}

        {/* ==================================================== */}
        {/* SEARCH NO RESULT */}
        {/* ==================================================== */}

        {!loading &&
          videos.length > 0 &&
          filteredVideos.length === 0 && (

            <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center">

              <div className="mb-4 text-5xl">
                🔎
              </div>

              <h3 className="text-lg font-black">
                ไม่พบวิดีโอที่ค้นหา
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                ลองค้นหาด้วยคำอื่น
              </p>

            </div>

          )}

      </section>

    </main>
  );
}
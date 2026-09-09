"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id?: string;
  name: string;
  position: string;
  branch: string;
  department: string;
};

type ProgressRow = {
  id?: string;
  video_id: string;
  watched_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  completed: boolean;
  last_watched_at?: string;
};

type Video = {
  id: string;
  title: string;
  cloudflare_video_id: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  department: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [member, setMember] =
    useState<Member | null>(null);

  const [progressRows, setProgressRows] =
    useState<ProgressRow[]>([]);

  const [videos, setVideos] =
    useState<Video[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | หา Member ปัจจุบัน
  |--------------------------------------------------------------------------
  */

  async function getCurrentMember(): Promise<Member | null> {
    try {
      /*
      |--------------------------------------------------------------------------
      | 1. ลองหา Member ID จาก localStorage
      |--------------------------------------------------------------------------
      */

      const memberIdKeys = [
        "warithep_learning_member_id",
        "warithep_member_id",
        "member_id",
        "current_member_id",
      ];

      for (const key of memberIdKeys) {
        const storedId =
          localStorage.getItem(key);

        if (!storedId) continue;

        const { data, error } =
          await supabase
            .from("members")
            .select(
              "id, name, position, branch, department"
            )
            .eq("id", storedId)
            .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name || "",
            position: data.position || "",
            branch: data.branch || "",
            department: data.department || "",
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | 2. ลองอ่านข้อมูลสมาชิกแบบ JSON
      |--------------------------------------------------------------------------
      */

      const memberKeys = [
        "warithep_learning_member",
        "warithep_learning_user",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      for (const key of memberKeys) {
        const savedValue =
          localStorage.getItem(key);

        if (!savedValue) continue;

        let parsedValue: any = null;

        try {
          parsedValue =
            JSON.parse(savedValue);
        } catch {
          parsedValue = null;
        }

        /*
        | ถ้าเป็น Object
        */

        if (
          parsedValue &&
          typeof parsedValue === "object"
        ) {
          /*
          | ถ้ามี ID ให้ใช้ ID
          */

          if (parsedValue.id) {
            const { data, error } =
              await supabase
                .from("members")
                .select(
                  "id, name, position, branch, department"
                )
                .eq(
                  "id",
                  parsedValue.id
                )
                .maybeSingle();

            if (!error && data) {
              return {
                id: data.id,
                name: data.name || "",
                position:
                  data.position || "",
                branch:
                  data.branch || "",
                department:
                  data.department || "",
              };
            }
          }

          /*
          | ถ้ามีชื่อ ให้ใช้ชื่อค้นหา
          */

          const savedName =
            parsedValue.name ||
            parsedValue.full_name ||
            parsedValue.member_name ||
            "";

          if (savedName) {
            const { data, error } =
              await supabase
                .from("members")
                .select(
                  "id, name, position, branch, department"
                )
                .eq(
                  "name",
                  String(savedName).trim()
                )
                .maybeSingle();

            if (!error && data) {
              return {
                id: data.id,
                name:
                  data.name || "",
                position:
                  data.position || "",
                branch:
                  data.branch || "",
                department:
                  data.department || "",
              };
            }
          }
        }

        /*
        | ถ้าเป็นข้อความธรรมดา
        */

        const plainName =
          typeof parsedValue === "string"
            ? parsedValue.trim()
            : savedValue.trim();

        if (!plainName) continue;

        const { data, error } =
          await supabase
            .from("members")
            .select(
              "id, name, position, branch, department"
            )
            .eq(
              "name",
              plainName
            )
            .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name || "",
            position:
              data.position || "",
            branch:
              data.branch || "",
            department:
              data.department || "",
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | 3. ใช้ชื่อจาก Login โดยตรง
      |--------------------------------------------------------------------------
      */

      const loginNameKeys = [
        "warithep_learning_login_name",
        "warithep_login_name",
        "login_name",
      ];

      for (const key of loginNameKeys) {
        const loginName =
          localStorage.getItem(key);

        if (!loginName?.trim()) continue;

        const cleanName =
          loginName.trim();

        const { data, error } =
          await supabase
            .from("members")
            .select(
              "id, name, position, branch, department"
            )
            .eq(
              "name",
              cleanName
            )
            .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name || "",
            position:
              data.position || "",
            branch:
              data.branch || "",
            department:
              data.department || "",
          };
        }
      }

      return null;
    } catch (err) {
      console.error(
        "Get current member error:",
        err
      );

      return null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | โหลดสมาชิก + ความคืบหน้า
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        /*
        |--------------------------------------------------------------------------
        | หา Member ปัจจุบัน
        |--------------------------------------------------------------------------
        */

        const memberData =
          await getCurrentMember();

        /*
        |--------------------------------------------------------------------------
        | ไม่พบสมาชิก
        |--------------------------------------------------------------------------
        */

        if (!memberData) {
          setMember(null);

          console.log(
            "ไม่พบข้อมูลสมาชิกจาก Login"
          );

          setLoading(false);
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | พบสมาชิก
        |--------------------------------------------------------------------------
        */

        setMember(memberData);

        /*
        |--------------------------------------------------------------------------
        | บันทึกข้อมูลกลับ localStorage
        |--------------------------------------------------------------------------
        */

        localStorage.setItem(
          "warithep_learning_member",
          JSON.stringify(memberData)
        );

        if (memberData.id) {
          localStorage.setItem(
            "warithep_learning_member_id",
            memberData.id
          );
        }

        /*
        |--------------------------------------------------------------------------
        | โหลดความคืบหน้า
        |--------------------------------------------------------------------------
        */

        if (memberData.id) {
          await loadLearningProgress(
            memberData.id
          );
        }
      } catch (err) {
        console.error(
          "Load Profile Error:",
          err
        );

        setError(
          "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | โหลดความคืบหน้า
  |--------------------------------------------------------------------------
  */

  async function loadLearningProgress(
    memberId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    const {
      data: progressData,
      error: progressError,
    } = await supabase
      .from("video_progress")
      .select(
        "id, video_id, watched_seconds, duration_seconds, progress_percent, completed, last_watched_at"
      )
      .eq(
        "member_id",
        memberId
      )
      .order(
        "last_watched_at",
        {
          ascending: false,
        }
      );

    if (progressError) {
      console.error(
        "โหลด video_progress ไม่สำเร็จ:",
        progressError
      );

      return;
    }

    const rows =
      (progressData || []) as ProgressRow[];

    setProgressRows(rows);

    /*
    |--------------------------------------------------------------------------
    | ไม่มีประวัติวิดีโอ
    |--------------------------------------------------------------------------
    */

    if (rows.length === 0) {
      setVideos([]);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | เอา video_id ไปหาข้อมูลวิดีโอ
    |--------------------------------------------------------------------------
    */

    const videoIds = rows.map(
      (item) => item.video_id
    );

    const {
      data: videoData,
      error: videoError,
    } = await supabase
      .from("knowledge_videos")
      .select(
        "id, title, cloudflare_video_id, thumbnail_url, duration_seconds, department"
      )
      .in("id", videoIds);

    if (videoError) {
      console.error(
        "โหลดข้อมูลวิดีโอไม่สำเร็จ:",
        videoError
      );

      return;
    }

    setVideos(
      (videoData || []) as Video[]
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Progress Stats
  |--------------------------------------------------------------------------
  */

  const startedVideos =
    progressRows.length;

  const completedVideos =
    progressRows.filter(
      (item) => item.completed
    ).length;

  const averageProgress =
    startedVideos > 0
      ? Math.round(
          progressRows.reduce(
            (sum, item) =>
              sum +
              Number(
                item.progress_percent || 0
              ),
            0
          ) / startedVideos
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">

        <header className="border-b border-slate-200 bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-md">
                🎓
              </div>

              <div>

                <div className="font-black text-slate-900">
                  วารีเทพ
                </div>

                <div className="text-xs font-bold tracking-widest text-blue-600">
                  LEARNING
                </div>

              </div>

            </Link>

          </div>

        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              👤
            </div>

            <p className="mt-4 font-bold text-slate-600">
              กำลังโหลดข้อมูลสมาชิก...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl shadow-md">
              🎓
            </div>

            <div className="hidden sm:block">

              <div className="font-black text-slate-900">
                วารีเทพ
              </div>

              <div className="text-xs font-bold tracking-widest text-blue-600">
                LEARNING
              </div>

            </div>

          </Link>

          <nav className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                router.back()
              }
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
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl shadow-md"
            >
              👤
            </Link>

          </nav>

        </div>

      </header>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">

        {/* TITLE */}

        <div className="mb-8">

          <p className="font-bold tracking-widest text-blue-600">
            MY PROFILE
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            โปรไฟล์ของฉัน
          </h1>

          <p className="mt-3 text-slate-500">
            ข้อมูลสมาชิกและความคืบหน้าการเรียนรู้ของคุณ
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="h-36 bg-gradient-to-br from-[#06318f] via-[#0b4fc4] to-[#082b78] md:h-44" />

          <div className="px-5 pb-8 sm:px-6 md:px-8">

            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 text-5xl shadow-lg">
                  👤
                </div>

                <div className="pb-1">

                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                    {member?.name ||
                      "ยังไม่มีข้อมูล"}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {member?.position ||
                      "ยังไม่ได้เข้าสู่ระบบ"}
                  </p>

                </div>

              </div>

              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                ← กลับ Dashboard
              </Link>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* PERSONAL INFO */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">

          <div className="mb-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              👤
            </div>

            <h2 className="mt-4 text-xl font-black">
              ข้อมูลสมาชิก
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              ข้อมูลสมาชิกจากระบบวารีเทพ Learning
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ชื่อ-นามสกุล
              </p>

              <p className="mt-2 break-words font-black text-slate-900">
                {member?.name || "-"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ตำแหน่ง
              </p>

              <p className="mt-2 break-words font-black text-slate-900">
                {member?.position || "-"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                สาขา
              </p>

              <p className="mt-2 break-words font-black text-slate-900">
                {member?.branch || "-"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ฝ่าย
              </p>

              <p className="mt-2 break-words font-black text-slate-900">
                {member?.department || "-"}
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* LEARNING STATS */}
        {/* ================================================= */}

        <section className="mt-6">

          <div className="mb-5">

            <p className="font-bold tracking-widest text-blue-600">
              LEARNING STATS
            </p>

            <h2 className="mt-1 text-2xl font-black">
              สถิติการเรียน
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📚
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                วิดีโอที่เริ่มเรียน
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900">
                {startedVideos}
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                🎬
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                วิดีโอที่เรียนจบ
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900">
                {completedVideos}
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
                ⭐
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                ความคืบหน้า
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900">
                {averageProgress}%
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                🏆
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                อันดับเดือนนี้
              </p>

              <p className="mt-1 text-3xl font-black text-slate-300">
                -
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* MY PROGRESS */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="font-bold text-blue-600">
                MY PROGRESS
              </p>

              <h2 className="mt-1 text-xl font-black">
                ความคืบหน้าการเรียน
              </h2>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-3xl font-black text-blue-600">
                {averageProgress}%
              </p>

              <p className="text-xs font-bold text-slate-400">
                ความคืบหน้าเฉลี่ย
              </p>

            </div>

          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${averageProgress}%`,
              }}
            />

          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">

            <span>
              เริ่มเรียน {startedVideos} วิดีโอ
            </span>

            <span>
              เรียนจบ {completedVideos} วิดีโอ
            </span>

          </div>

        </section>

        {/* ================================================= */}
        {/* CONTINUE LEARNING */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">

          <div className="mb-6">

            <p className="font-bold tracking-widest text-blue-600">
              CONTINUE LEARNING
            </p>

            <h2 className="mt-1 text-2xl font-black">
              เรียนต่อจากที่ค้างไว้
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              วิดีโอที่คุณเคยเปิดดู ระบบจะบันทึกความคืบหน้าไว้
            </p>

          </div>

          {videos.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">

              <div className="text-5xl">
                🎬
              </div>

              <h3 className="mt-4 font-black text-slate-800">
                ยังไม่มีประวัติการเรียน
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                เริ่มดูวิดีโอสอนงาน แล้วความคืบหน้าจะแสดงที่นี่
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
              >
                📚 เข้าห้องเรียน
              </Link>

            </div>

          ) : (

            <div className="space-y-4">

              {progressRows
                .slice(0, 10)
                .map((progress) => {

                  const video =
                    videos.find(
                      (item) =>
                        item.id ===
                        progress.video_id
                    );

                  if (!video) {
                    return null;
                  }

                  const percent =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          progress.progress_percent ||
                            0
                        )
                      )
                    );

                  return (
                    <Link
                      key={
                        progress.id ||
                        progress.video_id
                      }
                      href={`/videos/${video.id}`}
                      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-md sm:flex-row"
                    >

                      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-48 sm:aspect-auto">

                        {video.thumbnail_url ? (

                          <img
                            src={
                              video.thumbnail_url
                            }
                            alt={video.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-4xl">
                            🎬
                          </div>

                        )}

                        <div className="absolute inset-0 flex items-center justify-center">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-lg">
                            ▶
                          </div>

                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">

                          <div
                            className={`h-full ${
                              progress.completed
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div className="min-w-0 flex-1 py-1">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h3 className="line-clamp-2 font-black text-slate-900 transition group-hover:text-blue-600">
                              {video.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              {video.department}
                            </p>

                          </div>

                          <div className="shrink-0">

                            {progress.completed ? (

                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black text-green-700">
                                ✓ จบแล้ว
                              </span>

                            ) : (

                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black text-blue-700">
                                {percent}%
                              </span>

                            )}

                          </div>

                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className={`h-full rounded-full ${
                              progress.completed
                                ? "bg-green-500"
                                : "bg-blue-600"
                            }`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />

                        </div>

                        <p className="mt-2 text-xs font-bold text-slate-400">

                          {progress.completed
                            ? "✓ เรียนจบแล้ว"
                            : `ดูไปแล้ว ${percent}% • กดเพื่อเรียนต่อ`}

                        </p>

                      </div>

                    </Link>
                  );
                })}

            </div>

          )}

        </section>

        {/* ================================================= */}
        {/* QUICK ACTION */}
        {/* ================================================= */}

        <section className="mt-6 grid gap-4 md:grid-cols-2">

          <Link
            href="/courses"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                📚
              </div>

              <div>

                <h3 className="font-black">
                  เข้าห้องเรียน
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  ดูหลักสูตรและวิดีโอสอนงาน
                </p>

              </div>

            </div>

          </Link>

          <Link
            href="/ranking"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-yellow-300 hover:shadow-lg"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-3xl">
                🏆
              </div>

              <div>

                <h3 className="font-black">
                  Ranking ประจำเดือน
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  ดูอันดับและคะแนนของคุณ
                </p>

              </div>

            </div>

          </Link>

        </section>

      </div>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-6 py-8 text-center">

          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Learning • Training • Development
          </p>

        </div>

      </footer>

    </main>
  );
}
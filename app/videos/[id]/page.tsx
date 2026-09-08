"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import PageNavigation from "@/components/PageNavigation";
import ProgressVideoPlayer from "@/components/ProgressVideoPlayer";

type Video = {
  id: string;
  cloudflare_video_id: string;
  title: string;
  description: string | null;
  department: string | null;
  speaker: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
};

export default function VideoPage() {
  const params = useParams();

  const id = String(params.id);

  const [video, setVideo] =
    useState<Video | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      setError("");

      const { data, error } =
        await supabase
          .from("knowledge_videos")
          .select(
            `
            id,
            cloudflare_video_id,
            title,
            description,
            department,
            speaker,
            duration_seconds,
            thumbnail_url
          `
          )
          .eq("id", id)
          .maybeSingle();

      if (error) {
        console.error(error);

        setError(
          "ไม่สามารถโหลดวิดีโอได้"
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          "ไม่พบวิดีโอนี้"
        );

        setLoading(false);
        return;
      }

      setVideo(data);
      setLoading(false);
    }

    loadVideo();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">

        <PageNavigation />

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🎬
            </div>

            <p className="mt-4 font-bold text-slate-600">
              กำลังโหลดวิดีโอ...
            </p>

          </div>

        </div>

      </main>
    );
  }

  if (!video) {
    return (
      <main className="min-h-screen bg-slate-50">

        <PageNavigation />

        <div className="mx-auto max-w-4xl px-6 py-20 text-center">

          <div className="text-6xl">
            🎬
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            {error || "ไม่พบวิดีโอ"}
          </h1>

          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 font-black text-white"
          >
            ← กลับห้องเรียน
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <PageNavigation
        title={video.title}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* HEADER */}

        <div className="mb-6">

          {video.department && (
            <p className="text-sm font-black text-blue-600">
              {video.department}
            </p>
          )}

          <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {video.title}
          </h1>

          {video.speaker && (
            <p className="mt-2 text-sm text-slate-500">
              วิทยากร:{" "}
              <span className="font-bold">
                {video.speaker}
              </span>
            </p>
          )}

        </div>

        {/* PLAYER */}

        <ProgressVideoPlayer
          videoId={video.id}
          cloudflareVideoId={
            video.cloudflare_video_id
          }
          title={video.title}
          durationSeconds={
            video.duration_seconds
          }
        />

        {/* DESCRIPTION */}

        {video.description && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-black text-slate-900">
              รายละเอียด
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {video.description}
            </p>

          </section>
        )}

      </div>

    </main>
  );
}
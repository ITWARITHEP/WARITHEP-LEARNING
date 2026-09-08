"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Stream?: (
      iframe: HTMLIFrameElement
    ) => CloudflarePlayer;
  }
}

type CloudflarePlayer = {
  currentTime: number;
  duration: number;
  ended: boolean;
  play: () => Promise<void>;
  pause: () => void;
  addEventListener: (
    event: string,
    callback: () => void
  ) => void;
  removeEventListener: (
    event: string,
    callback: () => void
  ) => void;
};

type Props = {
  videoId: string;
  cloudflareVideoId: string;
  title: string;
  durationSeconds?: number | null;
};

export default function ProgressVideoPlayer({
  videoId,
  cloudflareVideoId,
  title,
  durationSeconds,
}: Props) {
  const iframeRef =
    useRef<HTMLIFrameElement | null>(null);

  const playerRef =
    useRef<CloudflarePlayer | null>(null);

  const saveTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const memberIdRef =
    useRef<string | null>(null);

  const [progress, setProgress] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(durationSeconds || 0);

  const [saving, setSaving] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | โหลด Cloudflare Stream SDK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const existing =
      document.querySelector(
        'script[src="https://embed.cloudflarestream.com/embed/sdk.latest.js"]'
      );

    if (existing) {
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://embed.cloudflarestream.com/embed/sdk.latest.js";

    script.async = true;

    document.body.appendChild(script);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | หา Member
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadMember() {
      try {
        const saved =
          localStorage.getItem(
            "warithep_learning_member"
          );

        if (!saved) {
          return;
        }

        const localMember =
          JSON.parse(saved);

        if (localMember?.id) {
          memberIdRef.current =
            localMember.id;

          return;
        }

        if (!localMember?.name) {
          return;
        }

        const { data, error } =
          await supabase
            .from("members")
            .select("id")
            .eq(
              "name",
              localMember.name.trim()
            )
            .maybeSingle();

        if (!error && data?.id) {
          memberIdRef.current =
            data.id;

          localStorage.setItem(
            "warithep_learning_member",
            JSON.stringify({
              ...localMember,
              id: data.id,
            })
          );
        }
      } catch (error) {
        console.error(
          "Load member error:",
          error
        );
      }
    }

    loadMember();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | โหลดความคืบหน้าเดิม
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadProgress() {
      if (!memberIdRef.current) {
        return;
      }

      const { data, error } =
        await supabase
          .from("video_progress")
          .select(
            "watched_seconds, duration_seconds, progress_percent, completed"
          )
          .eq(
            "member_id",
            memberIdRef.current
          )
          .eq("video_id", videoId)
          .maybeSingle();

      if (error) {
        console.error(
          "Load video progress error:",
          error
        );
        return;
      }

      if (data) {
        const savedDuration =
          Number(
            data.duration_seconds || 0
          );

        const savedSeconds =
          Number(
            data.watched_seconds || 0
          );

        const savedProgress =
          Number(
            data.progress_percent || 0
          );

        if (savedDuration > 0) {
          setDuration(savedDuration);
        }

        setCurrentTime(savedSeconds);
        setProgress(savedProgress);
        setCompleted(
          Boolean(data.completed)
        );
      }
    }

    const timer = setTimeout(
      loadProgress,
      500
    );

    return () =>
      clearTimeout(timer);
  }, [videoId]);

  /*
  |--------------------------------------------------------------------------
  | บันทึกความคืบหน้า
  |--------------------------------------------------------------------------
  */

  async function saveProgress(
    force = false
  ) {
    const player =
      playerRef.current;

    const memberId =
      memberIdRef.current;

    if (!player || !memberId) {
      return;
    }

    const current =
      Math.floor(
        Number(player.currentTime || 0)
      );

    const total =
      Math.floor(
        Number(
          player.duration ||
            duration ||
            durationSeconds ||
            0
        )
      );

    if (!total || total <= 0) {
      return;
    }

    const percent = Math.min(
      100,
      Math.round(
        (current / total) * 100
      )
    );

    const isCompleted =
      player.ended ||
      percent >= 95;

    setCurrentTime(current);
    setDuration(total);
    setProgress(percent);
    setCompleted(isCompleted);

    if (!force && current <= 0) {
      return;
    }

    setSaving(true);

    const { error } =
      await supabase
        .from("video_progress")
        .upsert(
          {
            member_id: memberId,
            video_id: videoId,
            watched_seconds: current,
            duration_seconds: total,
            progress_percent: percent,
            completed: isCompleted,
            last_watched_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "member_id,video_id",
          }
        );

    if (error) {
      console.error(
        "Save video progress error:",
        error
      );
    }

    setSaving(false);
  }

  /*
  |--------------------------------------------------------------------------
  | เชื่อม Cloudflare Player
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function connectPlayer() {
      if (!iframeRef.current) {
        return;
      }

      /*
      | รอ SDK โหลด
      */

      for (let i = 0; i < 30; i++) {
        if (window.Stream) {
          break;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 300)
        );
      }

      if (
        cancelled ||
        !window.Stream ||
        !iframeRef.current
      ) {
        return;
      }

      const player =
        window.Stream(
          iframeRef.current
        );

      playerRef.current = player;

      /*
      | โหลดเวลาเดิม
      */

      const handleLoaded = () => {
        const total =
          Number(player.duration || 0);

        if (total > 0) {
          setDuration(total);
        }
      };

      /*
      | อัปเดตหน้าจอ
      */

      const handleTimeUpdate = () => {
        const current =
          Number(
            player.currentTime || 0
          );

        const total =
          Number(
            player.duration ||
              duration ||
              durationSeconds ||
              0
          );

        setCurrentTime(
          Math.floor(current)
        );

        if (total > 0) {
          setDuration(
            Math.floor(total)
          );

          setProgress(
            Math.min(
              100,
              Math.round(
                (current / total) *
                  100
              )
            )
          );
        }
      };

      /*
      | บันทึกเมื่อดูจบ
      */

      const handleEnded = () => {
        saveProgress(true);
      };

      player.addEventListener(
        "loadedmetadata",
        handleLoaded
      );

      player.addEventListener(
        "durationchange",
        handleLoaded
      );

      player.addEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      player.addEventListener(
        "ended",
        handleEnded
      );

      /*
      | บันทึกทุก 10 วินาที
      */

      saveTimerRef.current =
        setInterval(() => {
          saveProgress();
        }, 10000);
    }

    connectPlayer();

    return () => {
      cancelled = true;

      if (saveTimerRef.current) {
        clearInterval(
          saveTimerRef.current
        );
      }

      saveProgress(true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  /*
  |--------------------------------------------------------------------------
  | เริ่มดูต่อจากจุดเดิม
  |--------------------------------------------------------------------------
  */

  async function resumeVideo() {
    const player =
      playerRef.current;

    if (!player) {
      return;
    }

    if (
      currentTime > 0 &&
      duration > 0 &&
      currentTime < duration - 5
    ) {
      try {
        player.currentTime =
          currentTime;

        await player.play();
      } catch {
        // ผู้ใช้ต้องกด Play เองบนมือถือ
      }
    }
  }

  function formatTime(seconds: number) {
    if (!seconds || seconds < 0) {
      return "00:00";
    }

    const mins = Math.floor(
      seconds / 60
    );

    const secs =
      Math.floor(seconds % 60);

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  const iframeUrl =
    `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${cloudflareVideoId}/iframe`;

  return (
    <div className="space-y-5">

      {/* VIDEO */}

      <div className="overflow-hidden rounded-3xl bg-black shadow-xl">

        <div className="relative aspect-video w-full">

          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />

        </div>

      </div>

      {/* PROGRESS */}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between gap-4">

          <div className="min-w-0">

            <p className="truncate text-sm font-black text-slate-900">
              {title}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {formatTime(currentTime)}
              {" / "}
              {formatTime(duration)}
            </p>

          </div>

          <div className="shrink-0 text-right">

            {completed ? (
              <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-700">
                ✓ เรียนจบแล้ว
              </span>
            ) : (
              <span className="text-lg font-black text-blue-600">
                {progress}%
              </span>
            )}

          </div>

        </div>

        {/* BAR */}

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex items-center justify-between">

          <p className="text-xs font-medium text-slate-400">
            {completed
              ? "คุณดูวิดีโอนี้จบแล้ว"
              : `ดูไปแล้ว ${progress}%`}
          </p>

          {saving && (
            <p className="text-xs font-bold text-blue-500">
              กำลังบันทึก...
            </p>
          )}

        </div>

        {/* RESUME */}

        {currentTime > 5 &&
          !completed && (
            <button
              type="button"
              onClick={resumeVideo}
              className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
            >
              ▶ เล่นต่อจาก{" "}
              {formatTime(currentTime)}
            </button>
          )}

      </div>

    </div>
  );
}
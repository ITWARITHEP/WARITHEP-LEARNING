"use client";

import {
  useCallback,
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

type SavedMember = {
  id?: string;
  name?: string;
  full_name?: string;
  member_name?: string;
};

export default function ProgressVideoPlayer({
  videoId,
  cloudflareVideoId,
  title,
  durationSeconds,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(
    null
  );

  const playerRef =
    useRef<CloudflarePlayer | null>(null);

  const saveTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const memberIdRef =
    useRef<string | null>(null);

  const savedTimeRef = useRef(0);

  const loadedProgressRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    durationSeconds || 0
  );
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [memberReady, setMemberReady] =
    useState(false);
  const [progressLoaded, setProgressLoaded] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | หา Member ID
  |--------------------------------------------------------------------------
  */

  const getMemberId = useCallback(async () => {
    try {
      const idKeys = [
        "warithep_learning_member_id",
        "warithep_member_id",
        "member_id",
        "current_member_id",
      ];

      for (const key of idKeys) {
        const storedId =
          localStorage.getItem(key);

        if (!storedId) continue;

        const { data, error } = await supabase
          .from("members")
          .select("id")
          .eq("id", storedId)
          .maybeSingle();

        if (!error && data?.id) {
          memberIdRef.current = data.id;
          setMemberReady(true);

          localStorage.setItem(
            "warithep_learning_member_id",
            data.id
          );

          return data.id;
        }
      }

      const memberKeys = [
        "warithep_learning_member",
        "warithep_learning_user",
        "current_member",
        "currentMember",
        "member",
        "user",
      ];

      for (const key of memberKeys) {
        const saved =
          localStorage.getItem(key);

        if (!saved) continue;

        let parsed: unknown = null;

        try {
          parsed = JSON.parse(saved);
        } catch {
          parsed = null;
        }

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const localMember =
            parsed as SavedMember;

          if (localMember.id) {
            const { data, error } =
              await supabase
                .from("members")
                .select("id")
                .eq("id", localMember.id)
                .maybeSingle();

            if (!error && data?.id) {
              memberIdRef.current = data.id;
              setMemberReady(true);

              localStorage.setItem(
                "warithep_learning_member_id",
                data.id
              );

              return data.id;
            }
          }

          const name =
            localMember.name ||
            localMember.full_name ||
            localMember.member_name ||
            "";

          if (name.trim()) {
            const { data, error } =
              await supabase
                .from("members")
                .select("id")
                .eq("name", name.trim())
                .maybeSingle();

            if (!error && data?.id) {
              memberIdRef.current = data.id;
              setMemberReady(true);

              localStorage.setItem(
                "warithep_learning_member_id",
                data.id
              );

              localStorage.setItem(
                "warithep_learning_member",
                JSON.stringify({
                  ...localMember,
                  id: data.id,
                })
              );

              return data.id;
            }
          }
        }

        if (typeof parsed === "string") {
          const name = parsed.trim();

          if (name) {
            const { data, error } =
              await supabase
                .from("members")
                .select("id")
                .eq("name", name)
                .maybeSingle();

            if (!error && data?.id) {
              memberIdRef.current = data.id;
              setMemberReady(true);

              localStorage.setItem(
                "warithep_learning_member_id",
                data.id
              );

              return data.id;
            }
          }
        }
      }

      const loginNameKeys = [
        "warithep_learning_login_name",
        "warithep_login_name",
        "login_name",
      ];

      for (const key of loginNameKeys) {
        const name =
          localStorage.getItem(key);

        if (!name?.trim()) continue;

        const { data, error } =
          await supabase
            .from("members")
            .select("id")
            .eq("name", name.trim())
            .maybeSingle();

        if (!error && data?.id) {
          memberIdRef.current = data.id;
          setMemberReady(true);

          localStorage.setItem(
            "warithep_learning_member_id",
            data.id
          );

          return data.id;
        }
      }

      return null;
    } catch (error) {
      console.error(
        "Get member ID error:",
        error
      );

      return null;
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | โหลด Progress เดิม
  |--------------------------------------------------------------------------
  */

  const loadProgress = useCallback(
    async (memberId: string) => {
      try {
        const { data, error } =
          await supabase
            .from("video_progress")
            .select(
              "watched_seconds, duration_seconds, progress_percent, completed"
            )
            .eq("member_id", memberId)
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
          const savedSeconds = Number(
            data.watched_seconds || 0
          );

          const savedDuration = Number(
            data.duration_seconds || 0
          );

          const savedPercent = Number(
            data.progress_percent || 0
          );

          savedTimeRef.current =
            savedSeconds;

          setCurrentTime(savedSeconds);
          setProgress(savedPercent);

          if (savedDuration > 0) {
            setDuration(savedDuration);
          }

          setCompleted(
            Boolean(data.completed)
          );

          console.log(
            "Loaded video progress:",
            {
              memberId,
              videoId,
              savedSeconds,
              savedDuration,
              savedPercent,
            }
          );
        } else {
          savedTimeRef.current = 0;
        }

        loadedProgressRef.current = true;
        setProgressLoaded(true);
      } catch (error) {
        console.error(
          "Load progress error:",
          error
        );
      }
    },
    [videoId]
  );

  /*
  |--------------------------------------------------------------------------
  | หา Member แล้วโหลด Progress
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function initializeMember() {
      const memberId =
        await getMemberId();

      if (
        cancelled ||
        !memberId
      ) {
        setProgressLoaded(true);
        return;
      }

      await loadProgress(memberId);
    }

    void initializeMember();

    return () => {
      cancelled = true;
    };
  }, [getMemberId, loadProgress]);

  /*
  |--------------------------------------------------------------------------
  | บันทึก Progress
  |--------------------------------------------------------------------------
  */

  const saveProgress = useCallback(
    async (force = false) => {
      const player =
        playerRef.current;

      const memberId =
        memberIdRef.current;

      if (!player || !memberId) {
        return;
      }

      const current = Math.floor(
        Number(player.currentTime || 0)
      );

      const total = Math.floor(
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

      const now =
        new Date().toISOString();

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
              last_watched_at: now,
              updated_at: now,
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
      } else {
        savedTimeRef.current =
          current;
      }

      setSaving(false);
    },
    [duration, durationSeconds, videoId]
  );

  /*
  |--------------------------------------------------------------------------
  | โหลด Cloudflare Stream SDK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const scriptSrc =
      "https://embed.cloudflarestream.com/embed/sdk.latest.js";

    const existing =
      document.querySelector(
        `script[src="${scriptSrc}"]`
      );

    if (existing) {
      return;
    }

    const script =
      document.createElement("script");

    script.src = scriptSrc;
    script.async = true;

    document.body.appendChild(script);
  }, []);

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
      | รอ SDK
      */

      for (let i = 0; i < 40; i++) {
        if (window.Stream) {
          break;
        }

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 250)
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
      | Metadata
      */

      const handleLoaded = () => {
        const total = Number(
          player.duration || 0
        );

        if (total > 0) {
          setDuration(
            Math.floor(total)
          );
        }

        /*
        | เมื่อ Player พร้อมแล้ว
        | ให้เลื่อนไปยังจุดเดิม
        */

        if (
          loadedProgressRef.current &&
          savedTimeRef.current > 5 &&
          savedTimeRef.current <
            total - 5
        ) {
          try {
            player.currentTime =
              savedTimeRef.current;

            setCurrentTime(
              Math.floor(
                savedTimeRef.current
              )
            );
          } catch (error) {
            console.error(
              "Resume position error:",
              error
            );
          }
        }
      };

      /*
      | Time Update
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

          const percent =
            Math.min(
              100,
              Math.round(
                (current / total) *
                  100
              )
            );

          setProgress(percent);
        }
      };

      /*
      | จบวิดีโอ
      */

      const handleEnded = () => {
        void saveProgress(true);
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
          void saveProgress();
        }, 10000);
    }

    void connectPlayer();

    return () => {
      cancelled = true;

      if (saveTimerRef.current) {
        clearInterval(
          saveTimerRef.current
        );

        saveTimerRef.current = null;
      }

      /*
      | ก่อนออกจากหน้า
      | บันทึกตำแหน่งล่าสุด
      */

      void saveProgress(true);

      playerRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  /*
  |--------------------------------------------------------------------------
  | เล่นต่อจากจุดเดิม
  |--------------------------------------------------------------------------
  */

  async function resumeVideo() {
    const player =
      playerRef.current;

    if (!player) {
      return;
    }

    if (
      currentTime > 5 &&
      duration > 0 &&
      currentTime < duration - 5
    ) {
      try {
        player.currentTime =
          currentTime;

        await player.play();
      } catch {
        /*
        | มือถือบางเครื่อง
        | ต้องกด Play จากตัว Player
        */
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Format เวลา
  |--------------------------------------------------------------------------
  */

  function formatTime(seconds: number) {
    if (
      !seconds ||
      seconds < 0
    ) {
      return "00:00";
    }

    const mins = Math.floor(
      seconds / 60
    );

    const secs = Math.floor(
      seconds % 60
    );

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

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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

        {/* PROGRESS BAR */}

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completed
                ? "bg-green-500"
                : "bg-blue-600"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex items-center justify-between gap-3">

          <p className="text-xs font-medium text-slate-400">

            {!memberReady
              ? "กำลังตรวจสอบสมาชิก..."
              : !progressLoaded
                ? "กำลังโหลดความคืบหน้า..."
                : completed
                  ? "คุณดูวิดีโอนี้จบแล้ว"
                  : `ดูไปแล้ว ${progress}%`}

          </p>

          {saving && (
            <p className="shrink-0 text-xs font-bold text-blue-500">
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
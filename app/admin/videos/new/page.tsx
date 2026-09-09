"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const trainingGroups = [
  "วิทยากร",
  "ผู้บริหารบรรยาย",
  "แชร์ความรู้",
  "อบรมย้อนหลัง",
];

type CloudflareVideo = {
  uid: string;
  thumbnail?: string;
  preview?: string;
  duration?: number;
  readyToStream?: boolean;
  meta?: {
    filename?: string;
    name?: string;
  };
  status?: {
    state?: string;
  };
};

type SavedVideo = {
  id: string;
  cloudflare_video_id: string | null;
  title: string | null;
  department: string | null;
  training_group: string | null;
  video_type: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean | null;
};

export default function NewVideoPage() {
  const router = useRouter();

  const [videos, setVideos] = useState<CloudflareVideo[]>([]);
  const [selectedVideo, setSelectedVideo] =
    useState<CloudflareVideo | null>(null);

  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);

  const [title, setTitle] = useState("");
  const [videoType, setVideoType] = useState<
    "course" | "training"
  >("course");

  const [department, setDepartment] = useState("");
  const [trainingGroup, setTrainingGroup] = useState("");

  const [description, setDescription] = useState("");
  const [published, setPublished] = useState("published");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // โหลดวิดีโอ
  // =====================================================

  async function loadVideos() {
    setLoading(true);
    setError("");

    try {
      const {
        data: supabaseVideos,
        error: supabaseError,
      } = await supabase
        .from("knowledge_videos")
        .select(
          "id,cloudflare_video_id,title,department,training_group,video_type,duration_seconds,thumbnail_url,video_url,published"
        )
        .order("created_at", {
          ascending: false,
        });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setSavedVideos(
        (supabaseVideos ?? []) as SavedVideo[]
      );

      try {
        const response = await fetch(
          "/api/cloudflare-videos",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Cloudflare API ไม่สามารถใช้งานได้"
          );
        }

        const data = await response.json();

        if (
          !data?.success ||
          !Array.isArray(data.videos)
        ) {
          throw new Error(
            data?.error ||
              "ไม่สามารถโหลดวิดีโอจาก Cloudflare"
          );
        }

        setVideos(data.videos);
      } catch (cloudflareError) {
        console.error(
          "CLOUDFLARE ERROR:",
          cloudflareError
        );

        setVideos([]);
      }
    } catch (err) {
      console.error("LOAD VIDEOS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดข้อมูลวิดีโอได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVideos();
  }, []);

  // =====================================================
  // เลือกวิดีโอ
  // =====================================================

  function selectVideo(video: CloudflareVideo) {
    setSelectedVideo(video);

    const existing = savedVideos.find(
      (item) =>
        item.cloudflare_video_id === video.uid
    );

    if (existing) {
      setTitle(
        existing.title ||
          video.meta?.name ||
          video.meta?.filename ||
          ""
      );

      setVideoType(
        existing.video_type === "training"
          ? "training"
          : "course"
      );

      setDepartment(
        existing.department || ""
      );

      setTrainingGroup(
        existing.training_group || ""
      );

      setPublished(
        existing.published
          ? "published"
          : "draft"
      );
    } else {
      setTitle(
        video.meta?.name ||
          video.meta?.filename ||
          ""
      );

      setVideoType("course");
      setDepartment("");
      setTrainingGroup("");
      setPublished("published");
    }

    setError("");
    setSuccess("");
  }

  // =====================================================
  // เปลี่ยนประเภทวิดีโอ
  // =====================================================

  function changeVideoType(
    type: "course" | "training"
  ) {
    setVideoType(type);

    if (type === "course") {
      setTrainingGroup("");
    } else {
      setDepartment("");
    }

    setError("");
  }

  // =====================================================
  // เวลา
  // =====================================================

  function formatDuration(seconds?: number) {
    if (!seconds || seconds <= 0) {
      return "ไม่ระบุ";
    }

    const total = Math.floor(seconds);

    const hours = Math.floor(total / 3600);

    const minutes = Math.floor(
      (total % 3600) / 60
    );

    const secs = total % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  // =====================================================
  // บันทึก
  // =====================================================

  async function saveVideo() {
    setError("");
    setSuccess("");

    if (!selectedVideo) {
      setError(
        "กรุณาเลือกวิดีโอจาก Cloudflare Stream"
      );
      return;
    }

    if (!title.trim()) {
      setError("กรุณาระบุชื่อวิดีโอ");
      return;
    }

    if (
      videoType === "course" &&
      !department
    ) {
      setError(
        "กรุณาเลือกฝ่ายสำหรับวิดีโอหลักสูตรสอนงาน"
      );
      return;
    }

    if (
      videoType === "training" &&
      !trainingGroup
    ) {
      setError(
        "กรุณาเลือกกลุ่มสำหรับวิดีโออบรมและบรรยาย"
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("knowledge_videos")
        .select("id")
        .eq(
          "cloudflare_video_id",
          selectedVideo.uid
        )
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      const videoUrl =
        selectedVideo.preview ||
        `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.uid}/watch`;

      const payload = {
        cloudflare_video_id:
          selectedVideo.uid,

        title: title.trim(),

        category:
          videoType === "training"
            ? "training"
            : "course",

        video_type: videoType,

        department:
  videoType === "course"
    ? department
    : trainingGroup,

        training_group:
          videoType === "training"
            ? trainingGroup
            : null,

        speaker: null,

        training_date: null,

        duration_seconds:
          selectedVideo.duration || null,

        description:
          description.trim() || null,

        thumbnail_url:
          selectedVideo.thumbnail || null,

        video_url: videoUrl,

        published:
          published === "published",

        updated_at:
          new Date().toISOString(),
      };

      let result;

      if (existing?.id) {
        result = await supabase
          .from("knowledge_videos")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("knowledge_videos")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setSuccess(
        existing?.id
          ? "อัปเดตวิดีโอเรียบร้อยแล้ว"
          : "เพิ่มวิดีโอเรียบร้อยแล้ว"
      );

      window.setTimeout(() => {
        router.push("/admin/videos");
        router.refresh();
      }, 900);
    } catch (err) {
      console.error(
        "SAVE VIDEO ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถบันทึกวิดีโอได้"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

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

          <Link
            href="/admin/videos"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:px-4"
          >
            ← กลับวิดีโอ
          </Link>

        </div>

      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

        <div className="mb-8">

          <p className="font-bold text-blue-600">
            VIDEO MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            เพิ่มวิดีโอ
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            เลือกวิดีโอจาก Cloudflare Stream
            แล้วกำหนดประเภทการเรียนรู้
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            ❌ {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            ✅ {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* ================================================= */}
          {/* VIDEO LIST */}
          {/* ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  ☁️
                </div>

                <h2 className="mt-4 text-xl font-black">
                  วิดีโอจาก Cloudflare Stream
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  เลือกวิดีโอที่อัปโหลดไว้แล้ว
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  void loadVideos()
                }
                disabled={loading}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:px-4"
              >
                🔄 รีเฟรช
              </button>

            </div>

            {loading && (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-5 font-bold text-slate-700">
                  กำลังโหลดวิดีโอ...
                </p>

              </div>
            )}

            {!loading &&
              videos.length === 0 &&
              savedVideos.length > 0 && (
                <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">

                  <p className="text-sm font-bold text-yellow-800">
                    ⚠️ ไม่สามารถดึงรายการใหม่จาก Cloudflare Stream ได้
                  </p>

                  <p className="mt-1 text-xs text-yellow-700">
                    แต่ระบบพบวิดีโอที่บันทึกไว้ใน Supabase แล้ว
                  </p>

                </div>
              )}

            {!loading &&
              videos.length === 0 &&
              savedVideos.length === 0 && (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">

                  <div className="text-5xl">
                    🎥
                  </div>

                  <h3 className="mt-5 font-black text-slate-800">
                    ไม่พบวิดีโอ
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    ตรวจสอบว่าวิดีโอถูกอัปโหลดเข้า Cloudflare Stream แล้ว
                  </p>

                </div>
              )}

            {!loading &&
              videos.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">

                  {videos.map((video) => {

                    const name =
                      video.meta?.name ||
                      video.meta?.filename ||
                      "ไม่มีชื่อวิดีโอ";

                    const selected =
                      selectedVideo?.uid ===
                      video.uid;

                    const existing =
                      savedVideos.find(
                        (item) =>
                          item.cloudflare_video_id ===
                          video.uid
                      );

                    return (
                      <button
                        key={video.uid}
                        type="button"
                        onClick={() =>
                          selectVideo(video)
                        }
                        className={`overflow-hidden rounded-2xl border-2 text-left transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >

                        <div className="relative aspect-video overflow-hidden bg-slate-900">

                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-5xl">
                              🎥
                            </div>
                          )}

                          <div className="absolute bottom-2 right-2 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-white">
                            {formatDuration(
                              video.duration
                            )}
                          </div>

                          <div
                            className={`absolute left-2 top-2 rounded-lg px-2 py-1 text-xs font-bold text-white ${
                              video.status?.state ===
                              "ready"
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                          >
                            {video.status?.state ===
                            "ready"
                              ? "● READY"
                              : video.status?.state ||
                                "PROCESSING"}
                          </div>

                          {existing && (
                            <div className="absolute right-2 top-2 rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                              ✓ บันทึกแล้ว
                            </div>
                          )}

                        </div>

                        <div className="p-4">

                          <div className="flex items-start gap-3">

                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100"
                              }`}
                            >
                              {selected
                                ? "✓"
                                : "🎥"}
                            </div>

                            <div className="min-w-0">

                              <h3 className="line-clamp-2 font-bold leading-6 text-slate-800">
                                {name}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {video.uid}
                              </p>

                              {existing?.video_type ===
                                "training" ? (
                                <p className="mt-2 text-xs font-bold text-violet-600">
                                  🎤 วิดีโออบรม
                                  {existing.training_group
                                    ? ` • ${existing.training_group}`
                                    : ""}
                                </p>
                              ) : existing?.department ? (
                                <p className="mt-2 text-xs font-bold text-blue-600">
                                  📂{" "}
                                  {existing.department}
                                </p>
                              ) : null}

                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  })}

                </div>
              )}

          </section>

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            <div className="mb-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                🎥
              </div>

              <h2 className="mt-4 text-xl font-black">
                ข้อมูลวิดีโอ
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                เลือกประเภทก่อนกำหนดหน่วยงาน
              </p>

            </div>

            {/* SELECTED */}

            <div className="mb-6 rounded-2xl bg-slate-50 p-4">

              <p className="text-xs font-bold text-slate-400">
                วิดีโอที่เลือก
              </p>

              {selectedVideo ? (
                <div className="mt-2">

                  <p className="font-bold text-slate-800">
                    {selectedVideo.meta?.name ||
                      selectedVideo.meta?.filename ||
                      "ไม่มีชื่อ"}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    Cloudflare ID:{" "}
                    {selectedVideo.uid}
                  </p>

                </div>
              ) : (
                <p className="mt-2 font-semibold text-orange-500">
                  กรุณาเลือกวิดีโอจากด้านซ้าย
                </p>
              )}

            </div>

            {/* TITLE */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ชื่อวิดีโอ
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="เช่น ขั้นตอนการรับเงินสด"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* ================================================= */}
            {/* VIDEO TYPE */}
            {/* ================================================= */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ประเภทวิดีโอ
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    changeVideoType("course")
                  }
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    videoType === "course"
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                      videoType === "course"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    📚
                  </div>

                  <div className="mt-3 text-sm font-black">
                    หลักสูตรสอนงาน
                  </div>

                  <div className="mt-1 text-[10px] leading-4 text-slate-500">
                    วิดีโอแยกตาม 13 ฝ่าย
                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeVideoType("training")
                  }
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    videoType === "training"
                      ? "border-violet-600 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-violet-200"
                  }`}
                >

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                      videoType === "training"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    🎤
                  </div>

                  <div className="mt-3 text-sm font-black">
                    วิดีโออบรมและบรรยาย
                  </div>

                  <div className="mt-1 text-[10px] leading-4 text-slate-500">
                    สำหรับอบรมและสัมมนา
                  </div>

                </button>

              </div>

            </div>

            {/* ================================================= */}
            {/* COURSE DEPARTMENT */}
            {/* ================================================= */}

            {videoType === "course" && (
              <div className="mb-5">

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ฝ่าย
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="">
                    เลือกฝ่าย
                  </option>

                  {departments.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <p className="mt-2 text-xs text-slate-400">
                  วิดีโอจะแสดงในห้องเรียนของฝ่ายที่เลือก
                </p>

              </div>
            )}

            {/* ================================================= */}
            {/* TRAINING GROUP */}
            {/* ================================================= */}

            {videoType === "training" && (
              <div className="mb-5">

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  กลุ่มสำหรับการอบรม
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={trainingGroup}
                  onChange={(e) =>
                    setTrainingGroup(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-violet-200 bg-violet-50/40 px-4 py-3.5 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-50"
                >

                  <option value="">
                    เลือกกลุ่มสำหรับการอบรม
                  </option>

                  {trainingGroups.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <p className="mt-2 text-xs text-violet-500">
                  🎤 วิดีโอจะถูกจัดไว้ในหมวดวิดีโออบรมและบรรยาย
                </p>

              </div>
            )}

            {/* DESCRIPTION */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                รายละเอียด
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="รายละเอียดเกี่ยวกับวิดีโอ..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* STATUS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                สถานะ
              </label>

              <select
                value={published}
                onChange={(e) =>
                  setPublished(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="published">
                  🟢 เปิดใช้งาน
                </option>

                <option value="draft">
                  ⚪ แบบร่าง
                </option>

              </select>

            </div>

            {/* ACTION */}

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href="/admin/videos"
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center font-bold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </Link>

              <button
                type="button"
                onClick={() =>
                  void saveVideo()
                }
                disabled={
                  saving ||
                  !selectedVideo
                }
                className="flex-1 rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "💾 บันทึกวิดีโอ"}
              </button>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}
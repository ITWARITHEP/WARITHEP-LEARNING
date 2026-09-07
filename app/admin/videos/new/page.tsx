"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function NewVideoPage() {
  const [videos, setVideos] = useState<CloudflareVideo[]>([]);
  const [selectedVideo, setSelectedVideo] =
    useState<CloudflareVideo | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState("published");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // โหลดวิดีโอจาก Cloudflare
  // =====================================================
  async function loadCloudflareVideos() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cloudflare-videos", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            "ไม่สามารถดึงวิดีโอจาก Cloudflare Stream ได้"
        );
      }

      setVideos(data.videos || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถโหลดวิดีโอจาก Cloudflare ได้"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCloudflareVideos();
  }, []);

  // =====================================================
  // เลือกวิดีโอ
  // =====================================================
  function selectVideo(video: CloudflareVideo) {
    setSelectedVideo(video);

    setTitle(
      video.meta?.name ||
        video.meta?.filename ||
        ""
    );

    setError("");
    setSuccess("");
  }

  // =====================================================
  // เวลา
  // =====================================================
  function formatDuration(seconds?: number) {
    if (!seconds) return "ไม่ระบุ";

    const total = Math.floor(seconds);

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  // =====================================================
  // บันทึกวิดีโอ
  // =====================================================
  async function saveVideo() {
    setError("");
    setSuccess("");

    if (!selectedVideo) {
      setError("กรุณาเลือกวิดีโอจาก Cloudflare Stream");
      return;
    }

    if (!title.trim()) {
      setError("กรุณาระบุชื่อวิดีโอ");
      return;
    }

    if (!department) {
      setError("กรุณาเลือกฝ่าย");
      return;
    }

    setSaving(true);

    try {
      // -----------------------------------------------
      // ตรวจสอบว่ามีวิดีโอนี้ในระบบแล้วหรือยัง
      // -----------------------------------------------
      const { data: existing, error: existingError } =
        await supabase
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

      const payload = {
        cloudflare_video_id: selectedVideo.uid,

        title: title.trim(),

        // สำคัญ:
        // course = วิดีโอสอนงาน
        category: "course",

        department,

        speaker: null,

        training_date: null,

        duration_seconds:
          selectedVideo.duration || null,

        description:
          description.trim() || null,

        thumbnail_url:
          selectedVideo.thumbnail || null,

        video_url: `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.uid}/watch`,

        published: published === "published",

        updated_at: new Date().toISOString(),
      };

      let result;

      // -----------------------------------------------
      // ถ้ามีแล้ว = อัปเดต
      // ถ้ายังไม่มี = เพิ่มใหม่
      // -----------------------------------------------
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
          ? "อัปเดตวิดีโอสอนงานเรียบร้อยแล้ว"
          : "เพิ่มวิดีโอสอนงานเรียบร้อยแล้ว"
      );

      setTimeout(() => {
        window.location.href = "/admin/videos";
      }, 900);
    } catch (err) {
      console.error(err);

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

      {/* =====================================================
          HEADER
      ===================================================== */}
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

          <Link
            href="/admin/videos"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← กลับวิดีโอ
          </Link>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-8">

          <p className="font-bold text-blue-600">
            VIDEO MANAGEMENT
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            เพิ่มวิดีโอสอนงาน
          </h1>

          <p className="mt-3 text-slate-500">
            เลือกวิดีโอที่มีอยู่ใน Cloudflare Stream
            แล้วกำหนดฝ่ายสำหรับวิดีโอสอนงาน
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
            ❌ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
            ✅ {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* =================================================
              CLOUDFLARE VIDEOS
          ================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

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
                onClick={loadCloudflareVideos}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                🔄 รีเฟรช
              </button>

            </div>

            {/* LOADING */}
            {loading && (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-5 font-bold text-slate-700">
                  กำลังดึงวิดีโอจาก Cloudflare...
                </p>

              </div>
            )}

            {/* NO VIDEOS */}
            {!loading && videos.length === 0 && (
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

            {/* VIDEO LIST */}
            {!loading && videos.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">

                {videos.map((video) => {

                  const name =
                    video.meta?.name ||
                    video.meta?.filename ||
                    "ไม่มีชื่อวิดีโอ";

                  const selected =
                    selectedVideo?.uid === video.uid;

                  return (
                    <button
                      key={video.uid}
                      type="button"
                      onClick={() => selectVideo(video)}
                      className={`overflow-hidden rounded-2xl border-2 text-left transition ${
                        selected
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >

                      {/* THUMBNAIL */}
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
                          {formatDuration(video.duration)}
                        </div>

                        <div
                          className={`absolute left-2 top-2 rounded-lg px-2 py-1 text-xs font-bold text-white ${
                            video.status?.state === "ready"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {video.status?.state === "ready"
                            ? "● READY"
                            : video.status?.state ||
                              "PROCESSING"}
                        </div>

                      </div>

                      {/* INFO */}
                      <div className="p-4">

                        <div className="flex items-start gap-3">

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100"
                            }`}
                          >
                            {selected ? "✓" : "🎥"}
                          </div>

                          <div className="min-w-0">

                            <h3 className="line-clamp-2 font-bold leading-6 text-slate-800">
                              {name}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {video.uid}
                            </p>

                          </div>

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>
            )}

          </section>

          {/* =================================================
              FORM
          ================================================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                🎥
              </div>

              <h2 className="mt-4 text-xl font-black">
                ข้อมูลวิดีโอสอนงาน
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                กำหนดข้อมูลก่อนบันทึก
              </p>

            </div>

            {/* SELECTED VIDEO */}
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

            {/* DEPARTMENT */}
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
                  setDepartment(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  เลือกฝ่าย
                </option>

                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* CATEGORY */}
            <div className="mb-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ประเภท
              </label>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5">

                <div className="font-black text-blue-700">
                  🎥 วิดีโอสอนงาน
                </div>

                <p className="mt-1 text-xs text-blue-500">
                  วิดีโอประเภทนี้จะแสดงเป็นวิดีโอสอนงานของฝ่าย
                </p>

              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="mb-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                รายละเอียด
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
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
                  setPublished(e.target.value)
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
            <div className="flex gap-3">

              <Link
                href="/admin/videos"
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center font-bold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </Link>

              <button
                type="button"
                onClick={saveVideo}
                disabled={
                  saving || !selectedVideo
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
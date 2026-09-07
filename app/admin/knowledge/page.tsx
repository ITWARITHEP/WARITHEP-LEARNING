"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  { value: "all", label: "ทั้งหมด" },
  { value: "lecturer", label: "👨‍🏫 วิทยากร" },
  { value: "executive", label: "👔 ผู้บริหารบรรยาย" },
  { value: "knowledge", label: "💡 แชร์ความรู้" },
  { value: "training", label: "📹 อบรมย้อนหลัง" },
];

const departments = [
  "ทั่วไป / ทุกฝ่าย",
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
  readyToStream?: boolean;
  duration?: number;
  created?: string;
  modified?: string;
  meta?: {
    filename?: string;
    name?: string;
  };
  status?: {
    state?: string;
  };
  preview?: string;
};

type SavedVideo = {
  id: string;
  cloudflare_video_id: string;
  title: string;
  category: string;
  department: string;
  speaker: string | null;
  training_date: string | null;
  duration_seconds: number | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean;
};

export default function AdminKnowledgePage() {
  const [videos, setVideos] = useState<CloudflareVideo[]>([]);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedVideo, setSelectedVideo] =
    useState<CloudflareVideo | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [form, setForm] = useState({
    title: "",
    category: "training",
    department: "ฝ่ายการเงิน",
    speaker: "",
    trainingDate: "",
    description: "",
    published: true,
  });

  async function loadVideos() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cloudflare-videos", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "ไม่สามารถดึงวิดีโอจาก Cloudflare ได้"
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

  async function loadSavedVideos() {
    const { data, error } = await supabase
      .from("knowledge_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase load error:", error);
      return;
    }

    setSavedVideos(data || []);
  }

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadVideos();
    void loadSavedVideos();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, []);

  const savedIds = useMemo(() => {
    return new Set(
      savedVideos.map((video) => video.cloudflare_video_id)
    );
  }, [savedVideos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const title =
        video.meta?.name ||
        video.meta?.filename ||
        "";

      const searchMatch =
        title.toLowerCase().includes(search.toLowerCase());

      if (category === "all") {
        return searchMatch;
      }

      const saved = savedVideos.find(
        (item) => item.cloudflare_video_id === video.uid
      );

      return (
        searchMatch &&
        saved?.category === category
      );
    });
  }, [videos, search, category, savedVideos]);

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

  function openForm(video: CloudflareVideo) {
    const existing = savedVideos.find(
      (item) => item.cloudflare_video_id === video.uid
    );

    setSelectedVideo(video);

    setForm({
      title:
        existing?.title ||
        video.meta?.name ||
        video.meta?.filename ||
        "",
      category: existing?.category || "training",
      department: existing?.department || "ฝ่ายการเงิน",
      speaker: existing?.speaker || "",
      trainingDate: existing?.training_date || "",
      description: existing?.description || "",
      published: existing?.published ?? true,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function saveVideo() {
    if (!selectedVideo) return;

    if (!form.title.trim()) {
      setError("กรุณาระบุชื่อวิดีโอ");
      return;
    }

    if (!form.category) {
      setError("กรุณาเลือกประเภทวิดีโอ");
      return;
    }

    if (!form.department) {
      setError("กรุณาเลือกฝ่าย");
      return;
    }

    setSavingId(selectedVideo.uid);
    setError("");
    setSuccess("");

    try {
      const payload = {
        cloudflare_video_id: selectedVideo.uid,
        title: form.title.trim(),
        category: form.category,
        department: form.department,
        speaker: form.speaker.trim() || null,
        training_date: form.trainingDate || null,
        duration_seconds: selectedVideo.duration || null,
        description: form.description.trim() || null,
        thumbnail_url: selectedVideo.thumbnail || null,
        video_url:
          selectedVideo.preview ||
          `https://customer-xv4jsdza59p3njyz.cloudflarestream.com/${selectedVideo.uid}/watch`,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("knowledge_videos")
        .select("id")
        .eq("cloudflare_video_id", selectedVideo.uid)
        .maybeSingle();

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

      await loadSavedVideos();

      setSuccess("บันทึกข้อมูลวิดีโอเรียบร้อยแล้ว");

      setTimeout(() => {
        setShowForm(false);
        setSelectedVideo(null);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถบันทึกวิดีโอได้"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function togglePublished(video: SavedVideo) {
    const { error } = await supabase
      .from("knowledge_videos")
      .update({
        published: !video.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadSavedVideos();
  }

  async function deleteVideo(video: SavedVideo) {
    const confirmed = window.confirm(
      `ต้องการลบ "${video.title}" ออกจากคลังความรู้ใช่หรือไม่?\n\nวิดีโอใน Cloudflare จะไม่ถูกลบ`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("knowledge_videos")
      .delete()
      .eq("id", video.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadSavedVideos();
  }

  const publishedCount = savedVideos.filter(
    (video) => video.published
  ).length;

  const lecturerCount = savedVideos.filter(
    (video) => video.category === "lecturer"
  ).length;

  const executiveCount = savedVideos.filter(
    (video) => video.category === "executive"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              WARITHEP LEARNING
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              จัดการวิดีโออบรมและบรรยาย
            </h1>
          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← กลับ Admin
            </Link>

            <button
              type="button"
              onClick={loadVideos}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              🔄 รีเฟรช
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* INTRO */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-lg">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              🎥 CLOUDFLARE STREAM
            </div>

            <h2 className="text-3xl font-bold md:text-4xl">
              จัดการวิดีโออบรมและบรรยาย
            </h2>

            <p className="mt-3 text-sm leading-7 text-blue-100 md:text-base">
              วิดีโอจะถูกดึงจาก Cloudflare Stream โดยตรง
              จากนั้น Admin สามารถจัดฝ่าย ประเภท วิทยากร
              และรายละเอียด ก่อนเผยแพร่ให้พนักงานรับชม
            </p>

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            ✅ {success}
          </div>
        )}

        {/* STATS */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">

          <StatCard
            icon="🎥"
            title="วิดีโอใน Cloudflare"
            value={String(videos.length)}
          />

          <StatCard
            icon="💾"
            title="จัดหมวดหมู่แล้ว"
            value={String(savedVideos.length)}
          />

          <StatCard
            icon="👨‍🏫"
            title="วิทยากร"
            value={String(lecturerCount)}
          />

          <StatCard
            icon="🟢"
            title="เผยแพร่แล้ว"
            value={String(publishedCount)}
          />

        </section>

        {/* TOOLBAR */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h3 className="text-lg font-bold">
                วิดีโอจาก Cloudflare Stream
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                พบ {videos.length} วิดีโอ • จัดหมวดหมู่แล้ว{" "}
                {savedVideos.length} รายการ
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔎 ค้นหาวิดีโอ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white sm:w-72"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
              >
                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

            </div>

          </div>

        </section>

        {/* VIDEO LIST */}
        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-5 font-bold text-slate-700">
              กำลังดึงวิดีโอจาก Cloudflare Stream...
            </p>

          </section>
        ) : filteredVideos.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              🎥
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-800">
              ไม่พบวิดีโอ
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              ลองเปลี่ยนคำค้นหา หรือตรวจสอบวิดีโอใน Cloudflare Stream
            </p>

          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredVideos.map((video) => {

              const title =
                video.meta?.name ||
                video.meta?.filename ||
                "ไม่มีชื่อวิดีโอ";

              const saved = savedVideos.find(
                (item) =>
                  item.cloudflare_video_id === video.uid
              );

              return (
                <article
                  key={video.uid}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden bg-slate-900">

                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🎥
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-white">
                      {formatDuration(video.duration)}
                    </div>

                    <div className="absolute left-3 top-3 rounded-lg bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
                      {video.status?.state === "ready"
                        ? "● READY"
                        : video.status?.state || "PROCESSING"}
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-5">

                    <div className="mb-2 flex items-center justify-between gap-3">

                      <span className="text-xs font-bold text-blue-600">
                        CLOUDFLARE STREAM
                      </span>

                      {saved ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                          ✓ จัดหมวดหมู่แล้ว
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                          ยังไม่ได้จัดหมวด
                        </span>
                      )}

                    </div>

                    <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-slate-800">
                      {saved?.title || title}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex gap-2">
                        <span>🆔</span>
                        <span className="truncate text-slate-400">
                          {video.uid}
                        </span>
                      </div>

                      {saved && (
                        <>
                          <div className="flex gap-2">
                            <span>🏢</span>
                            <span className="font-semibold text-slate-600">
                              {saved.department}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span>📚</span>
                            <span className="font-semibold text-slate-600">
                              {getCategoryLabel(saved.category)}
                            </span>
                          </div>
                        </>
                      )}

                    </div>

                    <div className="mt-5 flex gap-2">

                      <button
                        type="button"
                        onClick={() => openForm(video)}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        {saved
                          ? "✏️ แก้ไขข้อมูล"
                          : "⚙️ จัดหมวดหมู่"}
                      </button>

                      {saved && (
                        <button
                          type="button"
                          onClick={() => togglePublished(saved)}
                          className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                            saved.published
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {saved.published ? "เผยแพร่" : "ซ่อน"}
                        </button>
                      )}

                    </div>

                    {saved && (
                      <button
                        type="button"
                        onClick={() => deleteVideo(saved)}
                        className="mt-2 w-full rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        🗑️ ลบออกจากคลังความรู้
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </section>
        )}

        {/* INFO */}
        <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex gap-4">

            <div className="text-3xl">
              💡
            </div>

            <div>

              <h3 className="font-black text-slate-800">
                ระบบทำงานอย่างไร?
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                วิดีโอถูกอัปโหลดไว้ที่ Cloudflare Stream
                แล้วระบบจะดึงข้อมูลเข้ามาแสดงในหน้านี้
                Admin เพียงเลือกวิดีโอและกำหนดข้อมูลประกอบ
                ระบบจะเก็บข้อมูลการจัดหมวดหมู่ไว้ใน Supabase
                โดยไม่ต้องอัปโหลดวิดีโอซ้ำ
              </p>

            </div>

          </div>

        </section>

      </div>

      {/* MODAL */}
      {showForm && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-bold text-blue-600">
                  CLOUDFLARE VIDEO
                </p>

                <h2 className="mt-1 text-xl font-black">
                  จัดข้อมูลวิดีโอ
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* PREVIEW */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">

                {selectedVideo.thumbnail && (
                  <img
                    src={selectedVideo.thumbnail}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                )}

                <div className="flex items-center justify-between px-4 py-3 text-xs text-white">

                  <span>
                    🆔 {selectedVideo.uid}
                  </span>

                  <span>
                    ⏱ {formatDuration(selectedVideo.duration)}
                  </span>

                </div>

              </div>

              <FormField label="ชื่อวิดีโอ" required>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  type="text"
                  className="input"
                  placeholder="ชื่อวิดีโอ"
                />

              </FormField>

              <div className="grid gap-5 md:grid-cols-2">

                <FormField label="ฝ่าย" required>

                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department: e.target.value,
                      })
                    }
                    className="input"
                  >
                    {departments.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                </FormField>

                <FormField label="ประเภทวิดีโอ" required>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="input"
                  >
                    <option value="lecturer">
                      👨‍🏫 วิทยากร
                    </option>

                    <option value="executive">
                      👔 ผู้บริหารบรรยาย
                    </option>

                    <option value="knowledge">
                      💡 แชร์ความรู้
                    </option>

                    <option value="training">
                      📹 อบรมย้อนหลัง
                    </option>
                  </select>

                </FormField>

              </div>

              <FormField label="ชื่อวิทยากร / ผู้บรรยาย">

                <input
                  value={form.speaker}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      speaker: e.target.value,
                    })
                  }
                  type="text"
                  className="input"
                  placeholder="ระบุชื่อวิทยากรหรือผู้บรรยาย"
                />

              </FormField>

              <FormField label="วันที่อบรม / บรรยาย">

                <input
                  value={form.trainingDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trainingDate: e.target.value,
                    })
                  }
                  type="date"
                  className="input"
                />

              </FormField>

              <FormField label="คำอธิบาย">

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="input resize-none"
                  placeholder="รายละเอียดเกี่ยวกับวิดีโอ..."
                />

              </FormField>

              <FormField label="สถานะ">

                <select
                  value={form.published ? "published" : "hidden"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      published: e.target.value === "published",
                    })
                  }
                  className="input"
                >
                  <option value="published">
                    🟢 เผยแพร่
                  </option>

                  <option value="hidden">
                    ⚪ ซ่อน
                  </option>
                </select>

              </FormField>

              {/* BUTTONS */}
              <div className="flex gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={saveVideo}
                  disabled={savingId === selectedVideo.uid}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingId === selectedVideo.uid
                    ? "กำลังบันทึก..."
                    : "💾 บันทึกวิดีโอ"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* INPUT STYLE */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .input:focus {
          border-color: rgb(59 130 246);
          background: white;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }
      `}</style>

    </main>
  );
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "lecturer":
      return "👨‍🏫 วิทยากร";

    case "executive":
      return "👔 ผู้บริหารบรรยาย";

    case "knowledge":
      return "💡 แชร์ความรู้";

    case "training":
      return "📹 อบรมย้อนหลัง";

    default:
      return category;
  }
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          {icon}
        </div>

        <span className="text-3xl font-bold text-slate-800">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {title}
      </p>

    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

    </div>
  );
}
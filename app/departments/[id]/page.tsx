"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Standard = {
  id: string;
  department: string;
  standard_code: string | null;
  title: string;
  description: string | null;
  level: string;
  published: boolean;
};

type StandardFile = {
  id: string;
  standard_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
};

const departments = [
  {
    id: "1",
    name: "ฝ่ายสำนักบริหารกลาง",
    icon: "🏢",
  },
  {
    id: "2",
    name: "ฝ่ายบริหารทรัพยากรมนุษย์",
    icon: "👥",
  },
  {
    id: "3",
    name: "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
    icon: "🎓",
  },
  {
    id: "4",
    name: "ฝ่ายจัดซื้อจัดจ้าง",
    icon: "🛒",
  },
  {
    id: "5",
    name: "ฝ่ายวิศวกรรม",
    icon: "⚙️",
  },
  {
    id: "6",
    name: "ฝ่ายคลังสินค้า",
    icon: "📦",
  },
  {
    id: "7",
    name: "ฝ่ายการขายและการตลาด",
    icon: "📈",
  },
  {
    id: "8",
    name: "ฝ่ายการเงิน",
    icon: "💰",
  },
  {
    id: "9",
    name: "ฝ่ายบัญชี",
    icon: "🧾",
  },
  {
    id: "10",
    name: "ฝ่ายการภาษี",
    icon: "🏦",
  },
  {
    id: "11",
    name: "ฝ่ายเทคโนโลยีสารสนเทศ",
    icon: "💻",
  },
  {
    id: "12",
    name: "ฝ่ายตรวจสอบภายใน",
    icon: "🔍",
  },
  {
    id: "13",
    name: "ฝ่ายบริหารโครงการ",
    icon: "📋",
  },
];

function formatFileSize(size: number | null) {
  if (!size) return "";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension === "pdf") return "📕";

  if (
    extension === "doc" ||
    extension === "docx"
  ) {
    return "📘";
  }

  if (
    extension === "xls" ||
    extension === "xlsx" ||
    extension === "csv"
  ) {
    return "📗";
  }

  if (
    extension === "ppt" ||
    extension === "pptx"
  ) {
    return "📙";
  }

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "gif" ||
    extension === "webp"
  ) {
    return "🖼️";
  }

  return "📄";
}

export default function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [departmentId, setDepartmentId] =
    useState<string | null>(null);

  const [standards, setStandards] =
    useState<Standard[]>([]);

  const [files, setFiles] =
    useState<StandardFile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedFile, setSelectedFile] =
    useState<StandardFile | null>(null);

  const [selectedStandard, setSelectedStandard] =
    useState<Standard | null>(null);

  const [viewerOpen, setViewerOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | รับ ID
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    params.then((value) => {
      setDepartmentId(value.id);
    });
  }, [params]);

  /*
  |--------------------------------------------------------------------------
  | ป้องกันคลิกขวา + ปุ่มลัด
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function preventContextMenu(
      event: MouseEvent
    ) {
      event.preventDefault();
    }

    function preventShortcuts(
      event: KeyboardEvent
    ) {
      const key =
        event.key.toLowerCase();

      if (
        (event.ctrlKey &&
          ["s", "u", "p"].includes(key)) ||
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(key))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    document.addEventListener(
      "contextmenu",
      preventContextMenu
    );

    document.addEventListener(
      "keydown",
      preventShortcuts
    );

    return () => {
      document.removeEventListener(
        "contextmenu",
        preventContextMenu
      );

      document.removeEventListener(
        "keydown",
        preventShortcuts
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | โหลดข้อมูล
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!departmentId) return;

    loadData(departmentId);
  }, [departmentId]);

  async function loadData(id: string) {
    setLoading(true);

    const department =
      departments.find(
        (item) => item.id === id
      );

    if (!department) {
      setLoading(false);
      return;
    }

    const {
      data: standardsData,
      error: standardsError,
    } = await supabase
      .from("department_standards")
      .select("*")
      .eq(
        "department",
        department.name
      )
      .eq("published", true)
      .order("created_at", {
        ascending: true,
      });

    if (standardsError) {
      console.error(
        standardsError
      );
    }

    const loadedStandards =
      (standardsData ||
        []) as Standard[];

    setStandards(
      loadedStandards
    );

    const standardIds =
      loadedStandards.map(
        (standard) =>
          standard.id
      );

    if (standardIds.length > 0) {
      const {
        data: filesData,
        error: filesError,
      } = await supabase
        .from("standard_files")
        .select("*")
        .in(
          "standard_id",
          standardIds
        )
        .order("created_at", {
          ascending: true,
        });

      if (filesError) {
        console.error(
          filesError
        );
      }

      setFiles(
        (filesData ||
          []) as StandardFile[]
      );
    } else {
      setFiles([]);
    }

    setLoading(false);
  }

  /*
  |--------------------------------------------------------------------------
  | เปิด Viewer
  |--------------------------------------------------------------------------
  */

  function openDocument(
    file: StandardFile,
    standard: Standard
  ) {
    setSelectedFile(file);
    setSelectedStandard(standard);
    setViewerOpen(true);

    document.body.style.overflow =
      "hidden";
  }

  /*
  |--------------------------------------------------------------------------
  | ปิด Viewer
  |--------------------------------------------------------------------------
  */

  function closeViewer() {
    setViewerOpen(false);
    setSelectedFile(null);
    setSelectedStandard(null);

    document.body.style.overflow =
      "";
  }

  /*
  |--------------------------------------------------------------------------
  | หา Department
  |--------------------------------------------------------------------------
  */

  const department =
    departments.find(
      (item) =>
        item.id === departmentId
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    loading ||
    !departmentId
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">

          <div className="text-3xl">
            ⏳
          </div>

          <div className="mt-3 text-sm font-bold text-slate-600">
            กำลังโหลดมาตรฐาน...
          </div>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ไม่พบฝ่าย
  |--------------------------------------------------------------------------
  */

  if (!department) {
    return (
      <main className="min-h-screen bg-[#f5f8fc] px-6 py-20">

        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            🔎
          </div>

          <h1 className="mt-5 text-2xl font-black">
            ไม่พบฝ่ายนี้
          </h1>

          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            ← กลับหน้าหลักสูตร
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#f5f8fc] text-[#172033] select-none"
      onContextMenu={(event) =>
        event.preventDefault()
      }
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">

          <Link
            href="/courses"
            className="text-sm font-bold text-slate-600 hover:text-blue-600"
          >
            ← หลักสูตร
          </Link>

          <div className="flex items-center gap-2">

            <span className="text-xs">
              🔒
            </span>

            <span className="text-xs font-black tracking-[0.16em] text-blue-600">
              WARITHEP LEARNING
            </span>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="mx-auto max-w-[1200px] px-6 py-8">

        {/* HERO */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-7 py-9 text-white">

            <div className="flex items-start gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                {department.icon}
              </div>

              <div>

                <div className="text-xs font-bold tracking-[0.14em] text-blue-100">
                  DEPARTMENT STANDARD
                </div>

                <h1 className="mt-2 text-2xl font-black md:text-3xl">
                  {department.name}
                </h1>

                <p className="mt-2 text-sm leading-6 text-blue-100">
                  มาตรฐานความรู้และเอกสารที่เกี่ยวข้อง
                  สำหรับบุคลากรของฝ่ายนี้
                </p>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="grid grid-cols-2 divide-x border-t border-slate-100 md:grid-cols-3">

            <div className="px-6 py-5">

              <div className="text-xs text-slate-400">
                มาตรฐาน
              </div>

              <div className="mt-1 text-2xl font-black text-blue-600">
                {standards.length}
              </div>

            </div>

            <div className="px-6 py-5">

              <div className="text-xs text-slate-400">
                เอกสาร
              </div>

              <div className="mt-1 text-2xl font-black text-purple-600">
                {files.length}
              </div>

            </div>

            <div className="hidden px-6 py-5 md:block">

              <div className="text-xs text-slate-400">
                การเข้าถึง
              </div>

              <div className="mt-1 text-sm font-black text-emerald-600">
                🔒 สำหรับการศึกษา
              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* STANDARDS */}
        {/* ================================================= */}

        <section className="mt-8">

          <div className="mb-5">

            <div className="text-xs font-black tracking-[0.14em] text-blue-600">
              STANDARD
            </div>

            <h2 className="mt-1 text-2xl font-black">
              มาตรฐานของฝ่าย
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              เอกสารมาตรฐานที่บุคลากรสามารถศึกษาได้
            </p>

          </div>

          {standards.length ===
          0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="text-5xl">
                📋
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-700">
                ยังไม่มีมาตรฐาน
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                ขณะนี้ยังไม่มีมาตรฐานที่เปิดให้ศึกษา
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {standards.map(
                (standard, index) => {

                  const standardFiles =
                    files.filter(
                      (file) =>
                        file.standard_id ===
                        standard.id
                    );

                  return (
                    <article
                      key={standard.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                      {/* STANDARD */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            {standard.standard_code && (
                              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-black text-blue-700">
                                {
                                  standard.standard_code
                                }
                              </span>
                            )}

                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                              {
                                standard.level
                              }
                            </span>

                          </div>

                          <h3 className="mt-3 text-lg font-black md:text-xl">
                            {
                              standard.title
                            }
                          </h3>

                          {standard.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {
                                standard.description
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      {/* FILES */}

                      <div className="mt-6 border-t border-slate-100 pt-5">

                        <div className="mb-3 flex items-center justify-between">

                          <div className="text-sm font-black text-slate-700">
                            📎 เอกสารประกอบ
                          </div>

                          <div className="text-xs text-slate-400">
                            {
                              standardFiles.length
                            }{" "}
                            ไฟล์
                          </div>

                        </div>

                        {standardFiles.length ===
                        0 ? (

                          <div className="rounded-xl bg-slate-50 px-4 py-4 text-center text-xs text-slate-400">
                            ยังไม่มีเอกสารแนบ
                          </div>

                        ) : (

                          <div className="grid gap-3 md:grid-cols-2">

                            {standardFiles.map(
                              (file) => (

                                <button
                                  key={
                                    file.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    openDocument(
                                      file,
                                      standard
                                    )
                                  }
                                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                                >

                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm transition group-hover:scale-105">
                                    {getFileIcon(
                                      file.file_name
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <div className="truncate text-sm font-bold text-slate-700">
                                      {
                                        file.file_name
                                      }
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">

                                      <span>
                                        {formatFileSize(
                                          file.file_size
                                        )}
                                      </span>

                                      <span>
                                        •
                                      </span>

                                      <span>
                                        🔒 อ่านออนไลน์
                                      </span>

                                    </div>

                                  </div>

                                  <div className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition group-hover:bg-blue-700">
                                    อ่าน
                                  </div>

                                </button>

                              )
                            )}

                          </div>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* ================================================= */}
      {/* DOCUMENT VIEWER */}
      {/* ================================================= */}

      {viewerOpen &&
        selectedFile && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/95"
            onContextMenu={(event) =>
              event.preventDefault()
            }
          >

            {/* VIEWER HEADER */}

            <div className="absolute left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 backdrop-blur md:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                  {getFileIcon(
                    selectedFile.file_name
                  )}
                </div>

                <div className="min-w-0">

                  <div className="truncate text-sm font-bold text-white">
                    {
                      selectedFile.file_name
                    }
                  </div>

                  <div className="truncate text-[11px] text-slate-400">
                    {selectedStandard?.title}
                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={closeViewer}
                className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-white transition hover:bg-white/20"
                aria-label="ปิดเอกสาร"
              >
                ✕
              </button>

            </div>

            {/* DOCUMENT */}

            <div className="absolute inset-0 top-16">

              <div className="h-full w-full overflow-hidden bg-slate-800 p-2 md:p-4">

                <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-2xl">

                  <iframe
                    src={`${selectedFile.file_url}#toolbar=0&navpanes=0&scrollbar=1`}
                    title={
                      selectedFile.file_name
                    }
                    className="h-full w-full border-0"
                    onContextMenu={(
                      event
                    ) =>
                      event.preventDefault()
                    }
                  />

                  {/* ชั้นป้องกันการลาก/เลือก */}
                  <div className="pointer-events-none absolute inset-0" />

                </div>

              </div>

            </div>

            {/* SECURITY NOTICE */}

            <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">

              <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[10px] font-semibold text-slate-300 backdrop-blur">
                🔒 เอกสารสำหรับการศึกษา •
                ห้ามเผยแพร่หรือทำซ้ำ
              </div>

            </div>

          </div>
        )}

    </main>
  );
}
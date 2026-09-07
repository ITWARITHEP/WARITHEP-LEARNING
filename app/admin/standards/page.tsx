"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

type Standard = {
  id: string;
  department: string;
  standard_code: string | null;
  title: string;
  description: string | null;
  level: string;
  published: boolean;
  created_at: string;
};

type StandardFile = {
  id: string;
  standard_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

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

const levels = [
  "พื้นฐาน",
  "ปานกลาง",
  "สูง",
  "ผู้เชี่ยวชาญ",
];

const emptyForm = {
  department: departments[0],
  standard_code: "",
  title: "",
  description: "",
  level: "พื้นฐาน",
  published: true,
};

export default function StandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [files, setFiles] = useState<StandardFile[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStandard, setEditingStandard] =
    useState<Standard | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const [standardResult, fileResult] =
        await Promise.all([
          supabase
            .from("department_standards")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("standard_files")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),
        ]);

      if (standardResult.error) {
        console.error(
          "Load standards error:",
          standardResult.error
        );

        alert(
          "โหลดมาตรฐานไม่สำเร็จ\n\n" +
            standardResult.error.message
        );
      }

      if (fileResult.error) {
        console.error(
          "Load files error:",
          fileResult.error
        );
      }

      setStandards(
        standardResult.data || []
      );

      setFiles(
        fileResult.data || []
      );
    } catch (error) {
      console.error(
        "Load data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     MODAL
  ===================================================== */

  function openAddModal() {
    setEditingStandard(null);
    setForm({
      ...emptyForm,
    });
    setSelectedFiles([]);
    setShowModal(true);
  }

  function openEditModal(
    standard: Standard
  ) {
    setEditingStandard(standard);

    setForm({
      department: standard.department,
      standard_code:
        standard.standard_code || "",
      title: standard.title,
      description:
        standard.description || "",
      level: standard.level,
      published: standard.published,
    });

    setSelectedFiles([]);
    setShowModal(true);
  }

  function closeModal() {
    if (saving || uploading) {
      return;
    }

    setShowModal(false);
    setEditingStandard(null);
    setForm({
      ...emptyForm,
    });
    setSelectedFiles([]);
  }

  /* =====================================================
     FILE SELECT
  ===================================================== */

  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const pickedFiles = Array.from(
      event.target.files || []
    );

    if (pickedFiles.length === 0) {
      return;
    }

    const maxSize =
      50 * 1024 * 1024;

    const validFiles = pickedFiles.filter(
      (file) => {
        if (file.size > maxSize) {
          alert(
            `ไฟล์ "${file.name}" มีขนาดเกิน 50 MB`
          );

          return false;
        }

        return true;
      }
    );

    setSelectedFiles(
      (current) => [
        ...current,
        ...validFiles,
      ]
    );

    event.target.value = "";
  }

  function removeSelectedFile(
    index: number
  ) {
    setSelectedFiles(
      (current) =>
        current.filter(
          (_, i) => i !== index
        )
    );
  }

  /* =====================================================
     SAVE STANDARD
  ===================================================== */

  async function saveStandard() {
    if (!form.title.trim()) {
      alert(
        "กรุณากรอกชื่อมาตรฐาน"
      );
      return;
    }

    if (!form.department) {
      alert("กรุณาเลือกฝ่าย");
      return;
    }

    setSaving(true);

    try {
      let standardId =
        editingStandard?.id;

      /* =========================
         UPDATE
      ========================= */

      if (editingStandard) {
        const { error } =
          await supabase
            .from(
              "department_standards"
            )
            .update({
              department:
                form.department,

              standard_code:
                form.standard_code.trim() ||
                null,

              title:
                form.title.trim(),

              description:
                form.description.trim() ||
                null,

              level:
                form.level,

              published:
                form.published,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              editingStandard.id
            );

        if (error) {
          throw error;
        }
      }

      /* =========================
         INSERT
      ========================= */

      else {
        const { data, error } =
          await supabase
            .from(
              "department_standards"
            )
            .insert({
              department:
                form.department,

              standard_code:
                form.standard_code.trim() ||
                null,

              title:
                form.title.trim(),

              description:
                form.description.trim() ||
                null,

              level:
                form.level,

              published:
                form.published,
            })
            .select()
            .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "ไม่สามารถสร้างมาตรฐานได้"
          );
        }

        standardId = data.id;
      }

      /* =========================
         UPLOAD FILES
      ========================= */

      if (
        standardId &&
        selectedFiles.length > 0
      ) {
        await uploadFilesToStandard(
          standardId,
          selectedFiles
        );
      }

      /* =========================
         SUCCESS
      ========================= */

      if (editingStandard) {
        alert(
          "บันทึกการแก้ไขเรียบร้อยแล้ว"
        );
      } else if (
        selectedFiles.length > 0
      ) {
        alert(
          `เพิ่มมาตรฐานเรียบร้อยแล้ว\nอัปโหลด ${selectedFiles.length} ไฟล์เรียบร้อยแล้ว`
        );
      } else {
        alert(
          "เพิ่มมาตรฐานเรียบร้อยแล้ว"
        );
      }

      setShowModal(false);
      setEditingStandard(null);
      setForm({
        ...emptyForm,
      });
      setSelectedFiles([]);

      await loadData();
    } catch (error) {
      console.error(
        "Save standard error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถบันทึกข้อมูลได้";

      alert(
        "เกิดข้อผิดพลาด\n\n" +
          message
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UPLOAD FILES
  ===================================================== */

  async function uploadFilesToStandard(
    standardId: string,
    fileList: File[]
  ) {
    setUploading(true);

    try {
      for (const file of fileList) {
        const extension =
          file.name.includes(".")
            ? file.name
                .split(".")
                .pop()
                ?.toLowerCase() || ""
            : "";

        const randomName =
          crypto.randomUUID();

        const storageFileName =
          extension
            ? `${randomName}.${extension}`
            : randomName;

        const filePath =
          `${standardId}/${storageFileName}`;

        console.log(
          "Uploading:",
          file.name,
          "=>",
          filePath
        );

        /* =========================
           STORAGE UPLOAD
        ========================= */

        const {
          error: uploadError,
        } = await supabase.storage
          .from("standard-files")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                "application/octet-stream",
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        /* =========================
           PUBLIC URL
        ========================= */

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("standard-files")
          .getPublicUrl(
            filePath
          );

        /* =========================
           DATABASE
        ========================= */

        const {
          error: dbError,
        } = await supabase
          .from("standard_files")
          .insert({
            standard_id:
              standardId,

            file_name:
              file.name,

            file_path:
              filePath,

            file_url:
              publicUrlData.publicUrl,

            file_type:
              file.type || null,

            file_size:
              file.size,
          });

        /* =========================
           ROLLBACK STORAGE
        ========================= */

        if (dbError) {
          await supabase.storage
            .from("standard-files")
            .remove([
              filePath,
            ]);

          throw dbError;
        }
      }
    } finally {
      setUploading(false);
    }
  }

  /* =====================================================
     DELETE FILE
  ===================================================== */

  async function deleteFile(
    file: StandardFile
  ) {
    const confirmed =
      window.confirm(
        `ต้องการลบไฟล์\n\n"${file.file_name}"\n\nใช่หรือไม่?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const {
        error: storageError,
      } = await supabase.storage
        .from("standard-files")
        .remove([
          file.file_path,
        ]);

      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError
        );
      }

      const { error } =
        await supabase
          .from("standard_files")
          .delete()
          .eq(
            "id",
            file.id
          );

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(
        "Delete file error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      alert(
        "ลบไฟล์ไม่สำเร็จ\n\n" +
          message
      );
    }
  }

  /* =====================================================
     DELETE STANDARD
  ===================================================== */

  async function deleteStandard(
    standard: Standard
  ) {
    const confirmed =
      window.confirm(
        `ต้องการลบมาตรฐาน\n\n"${standard.title}"\n\nไฟล์เอกสารทั้งหมดจะถูกลบด้วย`
      );

    if (!confirmed) {
      return;
    }

    try {
      const standardFiles =
        files.filter(
          (file) =>
            file.standard_id ===
            standard.id
        );

      /* =========================
         DELETE STORAGE FILES
      ========================= */

      if (
        standardFiles.length > 0
      ) {
        const filePaths =
          standardFiles.map(
            (file) =>
              file.file_path
          );

        const {
          error: storageError,
        } = await supabase.storage
          .from("standard-files")
          .remove(filePaths);

        if (storageError) {
          console.error(
            "Storage delete error:",
            storageError
          );
        }

        /* =========================
           DELETE FILE RECORDS
        ========================= */

        const {
          error: fileDbError,
        } = await supabase
          .from("standard_files")
          .delete()
          .eq(
            "standard_id",
            standard.id
          );

        if (fileDbError) {
          throw fileDbError;
        }
      }

      /* =========================
         DELETE STANDARD
      ========================= */

      const { error } =
        await supabase
          .from(
            "department_standards"
          )
          .delete()
          .eq(
            "id",
            standard.id
          );

      if (error) {
        throw error;
      }

      alert(
        "ลบมาตรฐานเรียบร้อยแล้ว"
      );

      await loadData();
    } catch (error) {
      console.error(
        "Delete standard error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      alert(
        "ลบมาตรฐานไม่สำเร็จ\n\n" +
          message
      );
    }
  }

  /* =====================================================
     TOGGLE PUBLISHED
  ===================================================== */

  async function togglePublished(
    standard: Standard
  ) {
    try {
      const { error } =
        await supabase
          .from(
            "department_standards"
          )
          .update({
            published:
              !standard.published,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            standard.id
          );

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(
        "Toggle published error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      alert(
        "เปลี่ยนสถานะไม่สำเร็จ\n\n" +
          message
      );
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function getFilesForStandard(
    standardId: string
  ) {
    return files.filter(
      (file) =>
        file.standard_id ===
        standardId
    );
  }

  function getDepartmentCount(
    department: string
  ) {
    return standards.filter(
      (item) =>
        item.department ===
        department
    ).length;
  }

  function getDepartmentFileCount(
    department: string
  ) {
    const ids = standards
      .filter(
        (item) =>
          item.department ===
          department
      )
      .map(
        (item) => item.id
      );

    return files.filter(
      (file) =>
        ids.includes(
          file.standard_id
        )
    ).length;
  }

  function formatFileSize(
    size: number | null
  ) {
    if (!size) {
      return "-";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function getFileIcon(
    fileName: string
  ) {
    const extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension === "pdf") {
      return "📕";
    }

    if (
      ["doc", "docx"].includes(
        extension || ""
      )
    ) {
      return "📘";
    }

    if (
      ["xls", "xlsx", "csv"].includes(
        extension || ""
      )
    ) {
      return "📗";
    }

    if (
      ["ppt", "pptx"].includes(
        extension || ""
      )
    ) {
      return "📙";
    }

    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
      ].includes(
        extension || ""
      )
    ) {
      return "🖼️";
    }

    return "📄";
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#172033]">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">

          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.18em] text-blue-600 sm:text-xs">
              WARITHEP LEARNING
            </div>

            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              มาตรฐานของแต่ละฝ่าย
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              จัดการมาตรฐานและเอกสารประกอบของแต่ละฝ่าย
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
          >
            ＋ เพิ่มมาตรฐาน
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">
              มาตรฐานทั้งหมด
            </div>

            <div className="mt-2 text-3xl font-black text-blue-600">
              {standards.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">
              เปิดใช้งาน
            </div>

            <div className="mt-2 text-3xl font-black text-emerald-600">
              {
                standards.filter(
                  (item) =>
                    item.published
                ).length
              }
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 md:col-span-1">
            <div className="text-sm text-slate-500">
              ไฟล์เอกสารทั้งหมด
            </div>

            <div className="mt-2 text-3xl font-black text-purple-600">
              {files.length}
            </div>
          </div>

        </div>

        {/* DEPARTMENTS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {departments.map(
            (department, index) => {

              const departmentStandards =
                standards.filter(
                  (standard) =>
                    standard.department ===
                    department
                );

              return (
                <section
                  key={department}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* DEPARTMENT HEADER */}
                  <div className="border-b border-slate-100 p-5">

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-bold leading-6">
                          {department}
                        </h2>

                        <div className="mt-1 text-xs text-slate-400">
                          {
                            getDepartmentCount(
                              department
                            )
                          }{" "}
                          มาตรฐาน ·{" "}
                          {
                            getDepartmentFileCount(
                              department
                            )
                          }{" "}
                          ไฟล์
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* STANDARDS */}
                  <div className="p-4">

                    {departmentStandards.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">

                        <div className="text-3xl">
                          📋
                        </div>

                        <div className="mt-2 text-sm font-semibold text-slate-500">
                          ยังไม่มีมาตรฐาน
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          กดเพิ่มมาตรฐานเพื่อเริ่มต้น
                        </div>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {departmentStandards.map(
                          (standard) => {

                            const standardFiles =
                              getFilesForStandard(
                                standard.id
                              );

                            return (
                              <div
                                key={
                                  standard.id
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                  <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">

                                      {standard.standard_code && (
                                        <span className="rounded-md bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                                          {
                                            standard.standard_code
                                          }
                                        </span>
                                      )}

                                      <span className="rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                        {
                                          standard.level
                                        }
                                      </span>

                                    </div>

                                    <h3 className="mt-2 font-bold">
                                      {
                                        standard.title
                                      }
                                    </h3>

                                    {standard.description && (
                                      <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {
                                          standard.description
                                        }
                                      </p>
                                    )}

                                  </div>

                                  <span
                                    className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                      standard.published
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {standard.published
                                      ? "เปิดใช้งาน"
                                      : "ปิดใช้งาน"}
                                  </span>

                                </div>

                                {/* FILE LIST */}
                                {standardFiles.length >
                                  0 && (
                                  <div className="mt-4 space-y-2">

                                    <div className="text-xs font-bold text-slate-500">
                                      📎 เอกสาร (
                                      {
                                        standardFiles.length
                                      }
                                      )
                                    </div>

                                    {standardFiles.map(
                                      (file) => (
                                        <div
                                          key={
                                            file.id
                                          }
                                          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:flex-nowrap"
                                        >

                                          <span className="text-lg">
                                            {getFileIcon(
                                              file.file_name
                                            )}
                                          </span>

                                          <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-semibold">
                                              {
                                                file.file_name
                                              }
                                            </div>

                                            <div className="text-[10px] text-slate-400">
                                              {formatFileSize(
                                                file.file_size
                                              )}
                                            </div>
                                          </div>

                                          <a
                                            href={
                                              file.file_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                                          >
                                            เปิด
                                          </a>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              void deleteFile(
                                                file
                                              )
                                            }
                                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                                          >
                                            ลบ
                                          </button>

                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                                {/* ACTIONS */}
                                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-3">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditModal(
                                        standard
                                      )
                                    }
                                    className="min-w-[100px] flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                                  >
                                    ✏️ แก้ไข
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void togglePublished(
                                        standard
                                      )
                                    }
                                    className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                                  >
                                    {standard.published
                                      ? "ปิด"
                                      : "เปิด"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void deleteStandard(
                                        standard
                                      )
                                    }
                                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-100"
                                  >
                                    🗑️
                                  </button>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                </section>
              );
            }
          )}

        </div>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4">

          <div className="flex max-h-[94vh] w-full max-w-[620px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">

              <div className="min-w-0">

                <div className="text-[10px] font-black tracking-[0.16em] text-blue-600">
                  {editingStandard
                    ? "EDIT STANDARD"
                    : "NEW STANDARD"}
                </div>

                <h2 className="mt-1 text-lg font-black sm:text-xl">
                  {editingStandard
                    ? "แก้ไขมาตรฐาน"
                    : "เพิ่มมาตรฐาน"}
                </h2>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {form.department}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  uploading
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto px-4 py-5 sm:px-6">

              <div className="space-y-5">

                {/* DEPARTMENT */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    ฝ่าย{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      form.department
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {departments.map(
                      (department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* CODE */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    รหัสมาตรฐาน
                  </label>

                  <input
                    value={
                      form.standard_code
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        standard_code:
                          e.target.value,
                      })
                    }
                    placeholder="เช่น FIN-01"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    ชื่อมาตรฐาน{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title:
                          e.target.value,
                      })
                    }
                    placeholder="เช่น มาตรฐานความรู้ด้านการเงิน"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    รายละเอียด
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="อธิบายรายละเอียดของมาตรฐาน..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* LEVEL */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    ระดับ
                  </label>

                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        level:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {levels.map(
                      (level) => (
                        <option
                          key={level}
                          value={level}
                        >
                          {level}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    สถานะ
                  </label>

                  <select
                    value={
                      form.published
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        published:
                          e.target.value ===
                          "true",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="true">
                      🟢 เปิดใช้งาน
                    </option>

                    <option value="false">
                      ⚪ ปิดใช้งาน
                    </option>
                  </select>
                </div>

                {/* FILE UPLOAD */}
                <div className="border-t border-slate-200 pt-5">

                  <div className="mb-3">
                    <div className="text-sm font-black text-slate-800">
                      📎 ไฟล์เอกสารมาตรฐาน
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      สามารถเลือกไฟล์ได้หลายไฟล์
                      สูงสุด 50 MB ต่อไฟล์
                    </div>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50">

                    <div className="text-3xl">
                      📁
                    </div>

                    <div className="mt-2 text-sm font-bold text-blue-700">
                      ＋ เพิ่มไฟล์
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      PDF, Word, Excel,
                      PowerPoint, CSV
                      และรูปภาพ
                    </div>

                    <input
                      type="file"
                      multiple
                      onChange={
                        handleFileSelect
                      }
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                    />

                  </label>

                  {/* SELECTED FILES */}
                  {selectedFiles.length >
                    0 && (
                    <div className="mt-4 space-y-2">

                      <div className="text-xs font-bold text-slate-500">
                        📥 ไฟล์ที่จะอัปโหลด (
                        {
                          selectedFiles.length
                        }
                        )
                      </div>

                      {selectedFiles.map(
                        (file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3"
                          >

                            <div className="text-xl">
                              {getFileIcon(
                                file.name
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="truncate text-xs font-bold text-slate-700">
                                {file.name}
                              </div>

                              <div className="mt-0.5 text-[10px] text-slate-400">
                                {formatFileSize(
                                  file.size
                                )}
                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedFile(
                                  index
                                )
                              }
                              className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-red-500 shadow-sm ring-1 ring-slate-200 hover:bg-red-50"
                            >
                              ลบ
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  )}

                  {/* EXISTING FILES */}
                  {editingStandard &&
                    getFilesForStandard(
                      editingStandard.id
                    ).length > 0 && (
                    <div className="mt-5">

                      <div className="mb-2 text-xs font-bold text-slate-500">
                        📂 ไฟล์ที่มีอยู่แล้ว
                      </div>

                      <div className="space-y-2">

                        {getFilesForStandard(
                          editingStandard.id
                        ).map((file) => (
                          <div
                            key={file.id}
                            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-nowrap"
                          >

                            <div className="text-xl">
                              {getFileIcon(
                                file.file_name
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="truncate text-xs font-bold">
                                {
                                  file.file_name
                                }
                              </div>

                              <div className="text-[10px] text-slate-400">
                                {formatFileSize(
                                  file.file_size
                                )}
                              </div>

                            </div>

                            <a
                              href={
                                file.file_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600"
                            >
                              เปิด
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                void deleteFile(
                                  file
                                )
                              }
                              className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500"
                            >
                              ลบ
                            </button>

                          </div>
                        ))}

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">

              {uploading && (
                <div className="mb-3 rounded-xl bg-blue-50 px-4 py-3 text-center text-xs font-bold text-blue-600">
                  ⏳ กำลังอัปโหลดไฟล์...
                </div>
              )}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    saving ||
                    uploading
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void saveStandard()
                  }
                  disabled={
                    saving ||
                    uploading
                  }
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "⏳ กำลังบันทึก..."
                    : editingStandard
                    ? "💾 บันทึกการแก้ไข"
                    : "💾 บันทึกมาตรฐาน"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="fixed bottom-5 right-5 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-500 shadow-xl ring-1 ring-slate-200">
          ⏳ กำลังโหลดข้อมูล...
        </div>
      )}

    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Member = {
  name: string;
  position: string;
  branch: string;
  department: string;
};

export default function ProfilePage() {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("warithep_learning_member");

    if (saved) {
      try {
        setMember(JSON.parse(saved));
      } catch {
        setMember(null);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
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

          {/* MENU */}
          <nav className="flex items-center gap-1">

            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/courses"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 sm:block"
            >
              หลักสูตร
            </Link>

            <Link
              href="/ranking"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              🏆 Ranking
            </Link>

            <Link
              href="/profile"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl shadow-md"
            >
              👤
            </Link>

          </nav>

        </div>

      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">

          <p className="font-bold tracking-widest text-blue-600">
            MY PROFILE
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            โปรไฟล์ของฉัน
          </h1>

          <p className="mt-3 text-slate-500">
            ข้อมูลสมาชิกและสถิติการเรียนรู้ของคุณ
          </p>

        </div>

        {/* PROFILE HEADER */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="h-36 bg-gradient-to-r from-blue-600 to-blue-800 md:h-44" />

          <div className="px-6 pb-8 md:px-8">

            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 text-5xl shadow-lg">
                  👤
                </div>

                <div className="pb-1">

                  <h2 className="text-2xl font-black text-slate-900">
                    {member?.name || "ยังไม่มีข้อมูล"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {member?.position || "ยังไม่ได้เข้าสู่ระบบ"}
                  </p>

                </div>

              </div>

              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center font-bold text-slate-600 hover:bg-slate-50"
              >
                ← กลับ Dashboard
              </Link>

            </div>

          </div>

        </section>

        {/* PERSONAL INFO */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              👤
            </div>

            <h2 className="mt-4 text-xl font-black">
              ข้อมูลสมาชิก
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              ข้อมูลที่ใช้สำหรับห้องเรียนวารีเทพ
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* NAME */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ชื่อ-นามสกุล
              </p>

              <p className="mt-2 font-black text-slate-900">
                {member?.name || "-"}
              </p>

            </div>

            {/* POSITION */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ตำแหน่ง
              </p>

              <p className="mt-2 font-black text-slate-900">
                {member?.position || "-"}
              </p>

            </div>

            {/* BRANCH */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                สาขา
              </p>

              <p className="mt-2 font-black text-slate-900">
                {member?.branch || "-"}
              </p>

            </div>

            {/* DEPARTMENT */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ฝ่าย
              </p>

              <p className="mt-2 font-black text-slate-900">
                {member?.department || "-"}
              </p>

            </div>

          </div>

        </section>

        {/* LEARNING STATS */}
        <section className="mt-6">

          <div className="mb-5">

            <p className="font-bold tracking-widest text-blue-600">
              LEARNING STATS
            </p>

            <h2 className="mt-1 text-2xl font-black">
              สถิติการเรียน
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📚
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                หลักสูตรที่เรียน
              </p>

              <p className="mt-1 text-3xl font-black">
                0
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                🎬
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                วิดีโอที่เรียน
              </p>

              <p className="mt-1 text-3xl font-black">
                0
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
                ⭐
              </div>

              <p className="mt-4 text-xs font-bold text-slate-400">
                คะแนนสะสม
              </p>

              <p className="mt-1 text-3xl font-black">
                0
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
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

        {/* PROGRESS */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex items-center justify-between">

            <div>

              <p className="font-bold text-blue-600">
                MY PROGRESS
              </p>

              <h2 className="mt-1 text-xl font-black">
                ความคืบหน้าการเรียน
              </h2>

            </div>

            <div className="text-right">

              <p className="text-3xl font-black text-blue-600">
                0%
              </p>

            </div>

          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: "0%" }}
            />

          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">

            <span>
              เรียนแล้ว 0 บทเรียน
            </span>

            <span>
              จบแล้ว 0 บทเรียน
            </span>

          </div>

        </section>

        {/* QUICK ACTION */}
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

      {/* FOOTER */}
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
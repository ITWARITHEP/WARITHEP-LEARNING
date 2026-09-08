"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const positions = [
  "หัวหน้าฝ่าย",
  "ผู้จัดการฝ่าย",
  "ผู้จัดการสาขา",
  "ผู้จัดการเขต",
  "ผู้อำนวยการฝ่าย",
  "ผู้บริหารระดับสูง",
];

const branches = [
  "วารีเทพ สำนักงานใหญ่",
  "วารีเทพ คำเขื่อนแก้ว",
  "วารีเทพ เขื่องใน",
  "วารีเทพ มหาชนะชัย",
  "วารีเทพ ศรีสะเกษ",
  "วารีเทพ สังขะ",
  "วารีเทพ นางรอง",
  "วารีเทพ สว่างแดนดิน",
  "วารีเทพ จักราช",
  "วารีเทพ บางละมุง",
  "วารีเทพ มหานคร",
  "วารีเทพ สกลนคร",
  "วารีเทพ ปราสาท",
  "วารีเทพ อุดรธานี",
  "วารีเทพ กาญจนบุรี",
  "วารีเทพ ครบุรี",
  "วารีเทพ บ้านม่วง",
  "วารีเทพ สุรินทร์",
  "วารีเทพ เชียงใหม่",
  "วารีเทพ บุรีรัมย์",
  "วารีเทพ บ้านผือ",
  "วารีเทพ เพชรบูรณ์",
  "วารีเทพ ทองผาภูมิ",
  "วารีเทพ ลำปาง",
  "วารีเทพ ชุมแสง",
  "วารีเทพ ยางชุมน้อย",
  "วารีเทพ นครพนม",
  "วารีเทพ ศรีราชา",
  "วารีเทพ ขุขันธ์",
  "วารีเทพ คลองขลุง",
  "วารีเทพ อุตรดิตถ์",
  "วารีเทพ ภูเรือ",
  "วารีเทพ หนองบัวลำภู",
  "วารีเทพ จอมพระ",
  "วารีเทพ อู่ทอง",
  "วารีเทพ วังทอง",
  "วารีเทพ มุกดาหาร",
  "วารีเทพ สุโขทัย",
  "วารีเทพ โพธิ์ทอง",
  "วารีเทพ แก้งคร้อ",
  "วารีเทพ เพ็ญ",
  "วารีเทพ เชียงแสน",
  "วารีเทพ กุฉินารายณ์",
  "วารีเทพ ชัยนาท",
  "วารีเทพ ยางตลาด",
  "วารีเทพ เชียงราย",
  "วารีเทพ พัทยา",
  "วารีเทพบัวใหญ่",
  "วารีเทพ ขอนแก่น",
  "วารีเทพกันทรลักษ์",
  "วารีเทพร้อยเอ็ด",
  "วารีเทพลพบุรี",
  "วารีเทพบ้านดุง",
  "วารีเทพ ประจวบคีรีขันธ์",
  "วารีเทพ ทับสะแก",
  "วารีเทพกำแพงเพชร",
];

type Member = {
  id: string;
  name: string | null;
  position: string | null;
  branch: string | null;
  department: string | null;
  created_at: string | null;
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("members")
        .select(
          "id, name, position, branch, department, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (supabaseError) {
        console.error("LOAD MEMBERS ERROR:", supabaseError);
        setError(supabaseError.message);
        return;
      }

      setMembers((data ?? []) as Member[]);
    } catch (err) {
      console.error("MEMBERS ERROR:", err);
      setError("ไม่สามารถโหลดข้อมูลสมาชิกได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();

    const interval = setInterval(() => {
      loadMembers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !keyword ||
        (member.name ?? "").toLowerCase().includes(keyword) ||
        (member.position ?? "").toLowerCase().includes(keyword) ||
        (member.branch ?? "").toLowerCase().includes(keyword) ||
        (member.department ?? "").toLowerCase().includes(keyword);

      const matchesPosition =
        !selectedPosition ||
        member.position === selectedPosition;

      const matchesBranch =
        !selectedBranch ||
        member.branch === selectedBranch;

      return (
        matchesSearch &&
        matchesPosition &&
        matchesBranch
      );
    });
  }, [
    members,
    search,
    selectedPosition,
    selectedBranch,
  ]);

  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const branch of branches) {
      counts[branch] = 0;
    }

    for (const member of members) {
      if (member.branch) {
        counts[member.branch] =
          (counts[member.branch] ?? 0) + 1;
      }
    }

    return counts;
  }, [members]);

  const learnerCount = useMemo(() => {
    return members.filter(
      (member) =>
        member.position &&
        positions.includes(member.position)
    ).length;
  }, [members]);

  const managerCount = useMemo(() => {
    return members.filter(
      (member) =>
        member.position === "ผู้จัดการสาขา" ||
        member.position === "ผู้จัดการเขต" ||
        member.position === "ผู้อำนวยการฝ่าย" ||
        member.position === "ผู้บริหารระดับสูง" ||
        member.position === "ผู้จัดการฝ่าย"
    ).length;
  }, [members]);

  function formatDate(date: string | null) {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "th-TH",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
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
            href="/admin"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← Admin
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-600">
              MEMBER MANAGEMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              จัดการสมาชิก
            </h1>

            <p className="mt-3 text-slate-500">
              จัดการข้อมูลสมาชิกของห้องเรียนวารีเทพ
            </p>

          </div>

          <Link
            href="/register"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มสมาชิก
          </Link>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
            ⚠️ ไม่สามารถโหลดข้อมูลสมาชิกได้
            <div className="mt-1 font-normal">
              {error}
            </div>
          </div>
        )}

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          {/* TOTAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              👥
            </div>

            <p className="mt-4 text-xs text-slate-400">
              สมาชิกทั้งหมด
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : members.length}
            </p>

          </div>

          {/* ACTIVE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🟢
            </div>

            <p className="mt-4 text-xs text-slate-400">
              สมาชิกในระบบ
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : members.length}
            </p>

          </div>

          {/* LEARNER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              🎓
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ผู้เรียน
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : learnerCount}
            </p>

          </div>

          {/* MANAGER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              🛡️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ผู้บริหาร / ผู้จัดการ
            </p>

            <p className="mt-1 text-3xl font-black text-slate-900">
              {loading ? "..." : managerCount}
            </p>

          </div>

        </section>

        {/* FILTER */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ค้นหาสมาชิก
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ชื่อ-นามสกุล..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* POSITION */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ตำแหน่ง
              </label>

              <select
                value={selectedPosition}
                onChange={(e) =>
                  setSelectedPosition(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกตำแหน่ง
                </option>

                {positions.map((position) => (
                  <option
                    key={position}
                    value={position}
                  >
                    {position}
                  </option>
                ))}

              </select>

            </div>

            {/* BRANCH */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                สาขา
              </label>

              <select
                value={selectedBranch}
                onChange={(e) =>
                  setSelectedBranch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกสาขา
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch}
                    value={branch}
                  >
                    {branch}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>

        {/* MEMBER LIST */}
        <section className="mt-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="font-bold text-blue-600">
                MEMBER LIST
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                รายชื่อสมาชิก
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">
              {loading
                ? "กำลังโหลด..."
                : `${filteredMembers.length} คน`}
            </div>

          </div>

          {loading ? (

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="text-4xl">
                ⏳
              </div>

              <p className="mt-4 font-bold text-slate-600">
                กำลังโหลดข้อมูลสมาชิก...
              </p>

            </div>

          ) : filteredMembers.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                👥
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900">
                {members.length === 0
                  ? "ยังไม่มีสมาชิก"
                  : "ไม่พบสมาชิกที่ค้นหา"}
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-slate-500">
                {members.length === 0
                  ? "เมื่อมีผู้สมัครสมาชิก ข้อมูลจะแสดงที่หน้านี้"
                  : "ลองเปลี่ยนคำค้นหาหรือตัวกรองตำแหน่ง / สาขา"}
              </p>

              {members.length === 0 && (
                <Link
                  href="/register"
                  className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  ไปหน้าสมัครสมาชิก
                </Link>
              )}

            </div>

          ) : (

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        สมาชิก
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        ตำแหน่ง
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        ฝ่าย
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        สาขา
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                        สมัครเมื่อ
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredMembers.map((member) => (

                      <tr
                        key={member.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                              {(member.name ?? "?")
                                .trim()
                                .charAt(0) || "?"}
                            </div>

                            <div>

                              <p className="font-black text-slate-900">
                                {member.name || "-"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {member.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {member.position || "-"}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {member.department || "-"}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {member.branch || "-"}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(member.created_at)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE LIST */}
              <div className="divide-y divide-slate-100 md:hidden">

                {filteredMembers.map((member) => (

                  <div
                    key={member.id}
                    className="p-5"
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                        {(member.name ?? "?")
                          .trim()
                          .charAt(0) || "?"}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-black text-slate-900">
                          {member.name || "-"}
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {member.position || "-"}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          ฝ่าย
                        </p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {member.department || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          สาขา
                        </p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {member.branch || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          สมัครเมื่อ
                        </p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {formatDate(member.created_at)}
                        </p>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </section>

        {/* BRANCH SUMMARY */}
        <section className="mt-10">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              BRANCH MEMBERS
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              สมาชิกแยกตามสาขา
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              จำนวนสมาชิกจากข้อมูลในระบบปัจจุบัน
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {branches.map((branch, index) => (

              <div
                key={branch}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold leading-6 text-slate-900">
                      {branch}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      สมาชิก{" "}
                      <span className="font-black text-blue-600">
                        {branchCounts[branch] ?? 0}
                      </span>{" "}
                      คน
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <div className="font-black text-slate-800">
            🎓 วารีเทพ Learning Admin
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Member Management
          </p>

        </div>

      </footer>

    </main>
  );
}
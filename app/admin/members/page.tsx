import Link from "next/link";

const positions = [
  "พนักงาน",
  "หัวหน้างาน",
  "ผู้ช่วยผู้จัดการ",
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

export default function AdminMembersPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/admin" className="flex items-center gap-3">

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

          <button
            type="button"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มสมาชิก
          </button>

        </div>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              👥
            </div>

            <p className="mt-4 text-xs text-slate-400">
              สมาชิกทั้งหมด
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🟢
            </div>

            <p className="mt-4 text-xs text-slate-400">
              กำลังใช้งาน
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              🎓
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ผู้เรียน
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              🛡️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              ผู้ดูแลระบบ
            </p>

            <p className="mt-1 text-3xl font-black">
              0
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
                defaultValue=""
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกตำแหน่ง
                </option>

                {positions.map((position) => (
                  <option key={position} value={position}>
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
                defaultValue=""
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกสาขา
                </option>

                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>

        {/* EMPTY */}
        <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
            👥
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-900">
            ยังไม่มีสมาชิก
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            ตอนนี้ยังไม่มีสมาชิกในระบบ
            เมื่อมีผู้สมัครสมาชิก ข้อมูลจะแสดงที่หน้านี้
          </p>

          <Link
            href="/register"
            className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            ดูหน้าสมัครสมาชิก
          </Link>

        </section>

        {/* BRANCH SUMMARY */}
        <section className="mt-10">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              BRANCH MEMBERS
            </p>

            <h2 className="mt-1 text-2xl font-black">
              สมาชิกแยกตามสาขา
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              จำนวนสมาชิกจะแสดงเมื่อเชื่อมต่อฐานข้อมูล
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {branches.map((branch, index) => (

              <div
                key={branch}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
                      สมาชิก 0 คน
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
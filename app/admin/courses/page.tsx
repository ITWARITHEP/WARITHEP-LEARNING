import Link from "next/link";

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

export default function AdminCoursesPage() {
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

          <div className="flex items-center gap-2">

            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← Admin
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 sm:block"
            >
              🌐 เว็บไซต์
            </Link>

          </div>

        </div>

      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold text-blue-600">
              COURSE MANAGEMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              จัดการหลักสูตร
            </h1>

            <p className="mt-3 text-slate-500">
              เพิ่ม แก้ไข และจัดการหลักสูตรของแต่ละฝ่าย
            </p>

          </div>

          <button
            type="button"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มหลักสูตร
          </button>

        </div>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📚
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  หลักสูตรทั้งหมด
                </p>

                <p className="text-2xl font-black">
                  0
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
                ▶️
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  เปิดใช้งาน
                </p>

                <p className="text-2xl font-black">
                  0
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
                📝
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  แบบทดสอบ
                </p>

                <p className="text-2xl font-black">
                  0
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                🎬
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  วิดีโอ
                </p>

                <p className="text-2xl font-black">
                  0
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* DEPARTMENT FILTER */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="font-black text-slate-900">
                เลือกฝ่าย
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                เลือกฝ่ายเพื่อดูหลักสูตร
              </p>

            </div>

            <select
              defaultValue=""
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 md:w-96"
            >

              <option value="" disabled>
                เลือกฝ่ายสำนักงานใหญ่
              </option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}

            </select>

          </div>

        </section>

        {/* EMPTY STATE */}
        <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
            📚
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-900">
            ยังไม่มีหลักสูตร
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-500">
            ตอนนี้ยังไม่มีหลักสูตรในระบบ
            กดปุ่ม “เพิ่มหลักสูตร”
            เพื่อเริ่มสร้างหลักสูตรแรก
          </p>

          <button
            type="button"
            className="mt-7 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มหลักสูตรแรก
          </button>

        </section>

        {/* DEPARTMENT OVERVIEW */}
        <section className="mt-10">

          <div className="mb-5">

            <p className="font-bold text-blue-600">
              13 DEPARTMENTS
            </p>

            <h2 className="mt-1 text-2xl font-black">
              สถานะหลักสูตรแต่ละฝ่าย
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {departments.map((department, index) => (

              <div
                key={department}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <h3 className="font-bold leading-6 text-slate-900">
                      {department}
                    </h3>

                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">
                    0
                  </span>

                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-xs text-slate-400">
                    หลักสูตร
                  </span>

                  <span className="text-xs font-bold text-slate-400">
                    ยังไม่มีข้อมูล
                  </span>

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
            Course Management
          </p>

        </div>

      </footer>

    </main>
  );
}
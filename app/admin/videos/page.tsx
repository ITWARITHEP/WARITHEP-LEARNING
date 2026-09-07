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

export default function AdminVideosPage() {
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
              VIDEO MANAGEMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              จัดการวิดีโอ
            </h1>

            <p className="mt-3 text-slate-500">
              เพิ่มและจัดการวิดีโอสอนงานของแต่ละหลักสูตร
            </p>

          </div>

          <Link
            href="/admin/videos/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มวิดีโอ
          </Link>

        </div>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🎬
            </div>

            <p className="mt-4 text-xs text-slate-400">
              วิดีโอทั้งหมด
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-2xl">
              ▶️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              เปิดใช้งาน
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
              📚
            </div>

            <p className="mt-4 text-xs text-slate-400">
              หลักสูตรที่มีวิดีโอ
            </p>

            <p className="mt-1 text-3xl font-black">
              0
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              ☁️
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Cloudflare Stream
            </p>

            <p className="mt-1 text-sm font-black text-slate-400">
              ยังไม่เชื่อมต่อ
            </p>

          </div>

        </section>

        {/* FILTER */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                ค้นหาวิดีโอ
              </label>

              <input
                type="text"
                placeholder="ค้นหาชื่อวิดีโอ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                เลือกฝ่าย
              </label>

              <select
                defaultValue=""
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกฝ่าย
                </option>

                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                สถานะ
              </label>

              <select
                defaultValue=""
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  ทุกสถานะ
                </option>

                <option value="published">
                  เปิดใช้งาน
                </option>

                <option value="draft">
                  แบบร่าง
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* EMPTY */}
        <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
            🎬
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-900">
            ยังไม่มีวิดีโอ
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            ตอนนี้ระบบยังไม่มีวิดีโอสอนงาน
            เมื่อพร้อมสามารถเพิ่มวิดีโอจากปุ่ม
            “เพิ่มวิดีโอ” ได้เลย
          </p>

          <Link
            href="/admin/videos/new"
            className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            + เพิ่มวิดีโอแรก
          </Link>

        </section>

        {/* DEPARTMENTS */}
        <section className="mt-10">

          <div className="mb-6">

            <p className="font-bold text-blue-600">
              VIDEO LIBRARY
            </p>

            <h2 className="mt-1 text-2xl font-black">
              วิดีโอแยกตามฝ่าย
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {departments.map((department, index) => (

              <div
                key={department}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold leading-6 text-slate-900">
                      {department}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">
                        0 วิดีโอ
                      </span>

                      <span className="text-xs text-slate-400">
                        ยังไม่มีข้อมูล
                      </span>

                    </div>

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
            Video Management
          </p>

        </div>

      </footer>

    </main>
  );
}
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

export default function NewQuizPage() {
  return (
    <main className="min-h-screen bg-slate-50">

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
            href="/admin/quizzes"
            className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← กลับแบบทดสอบ
          </Link>

        </div>

      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8">

          <p className="font-bold text-blue-600">
            QUIZ MANAGEMENT
          </p>

          <h1 className="mt-2 text-4xl font-black">
            สร้างแบบทดสอบ
          </h1>

          <p className="mt-3 text-slate-500">
            สร้างแบบทดสอบสำหรับหลักสูตร
          </p>

        </div>

        <form className="space-y-6">

          {/* BASIC */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📝
              </div>

              <h2 className="mt-4 text-xl font-black">
                ข้อมูลแบบทดสอบ
              </h2>

            </div>

            <div className="space-y-5">

              <div>

                <label className="mb-2 block text-sm font-bold">
                  ชื่อแบบทดสอบ
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  placeholder="เช่น แบบทดสอบความรู้พื้นฐานพนักงานใหม่"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  ฝ่าย
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  required
                  defaultValue=""
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="" disabled>
                    เลือกฝ่าย
                  </option>

                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  รายละเอียด
                </label>

                <textarea
                  rows={4}
                  placeholder="รายละเอียดแบบทดสอบ..."
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

            </div>

          </section>

          {/* SETTINGS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                ⚙️
              </div>

              <h2 className="mt-4 text-xl font-black">
                ตั้งค่าการสอบ
              </h2>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold">
                  จำนวนข้อสอบ
                </label>

                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  คะแนนเต็ม
                </label>

                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  เวลาทำข้อสอบ (นาที)
                </label>

                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="เช่น 15"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  คะแนนผ่าน (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="0"
                  placeholder="เช่น 80"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

            </div>

          </section>

          {/* OPTIONS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6">

              <h2 className="text-xl font-black">
                ตัวเลือกเพิ่มเติม
              </h2>

            </div>

            <div className="space-y-4">

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">

                <div>

                  <p className="font-bold">
                    สุ่มลำดับข้อสอบ
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    สุ่มข้อสอบแต่ละคนไม่เหมือนกัน
                  </p>

                </div>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-blue-600"
                />

              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">

                <div>

                  <p className="font-bold">
                    แสดงเฉลยหลังสอบ
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    ให้ผู้เรียนดูคำตอบหลังส่งข้อสอบ
                  </p>

                </div>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-blue-600"
                />

              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-5">

                <div>

                  <p className="font-bold">
                    แสดงคะแนนทันที
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    แสดงคะแนนทันทีหลังส่งข้อสอบ
                  </p>

                </div>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-blue-600"
                />

              </label>

            </div>

          </section>

          {/* ACTION */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin/quizzes"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              บันทึกแบบทดสอบ
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
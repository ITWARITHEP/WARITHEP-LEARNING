import Link from "next/link";

const departments = [
  {
    id: 1,
    name: "ฝ่ายสำนักบริหารกลาง",
    icon: "🏢",
  },
  {
    id: 2,
    name: "ฝ่ายบริหารทรัพยากรมนุษย์",
    icon: "👥",
  },
  {
    id: 3,
    name: "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
    icon: "🎓",
  },
  {
    id: 4,
    name: "ฝ่ายจัดซื้อจัดจ้าง",
    icon: "🛒",
  },
  {
    id: 5,
    name: "ฝ่ายวิศวกรรม",
    icon: "⚙️",
  },
  {
    id: 6,
    name: "ฝ่ายคลังสินค้า",
    icon: "📦",
  },
  {
    id: 7,
    name: "ฝ่ายการขายและการตลาด",
    icon: "📈",
  },
  {
    id: 8,
    name: "ฝ่ายการเงิน",
    icon: "💳",
  },
  {
    id: 9,
    name: "ฝ่ายบัญชี",
    icon: "🧾",
  },
  {
    id: 10,
    name: "ฝ่ายการภาษี",
    icon: "📑",
  },
  {
    id: 11,
    name: "ฝ่ายเทคโนโลยีสารสนเทศ",
    icon: "💻",
  },
  {
    id: 12,
    name: "ฝ่ายตรวจสอบภายใน",
    icon: "🔎",
  },
  {
    id: 13,
    name: "ฝ่ายบริหารโครงการ",
    icon: "📋",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
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

          <div className="flex items-center gap-2">

            <Link
              href="/login"
              className="rounded-xl px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              สมัครสมาชิก
            </Link>

          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-4xl">

            <div className="mb-5 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
              🎓 ห้องเรียนออนไลน์วารีเทพ
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              เรียนรู้{" "}
              <span className="text-blue-600">
                พัฒนาตัวเอง
              </span>{" "}
              และเติบโตไปพร้อมกัน
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-500">
              ศูนย์กลางการเรียนรู้ออนไลน์สำหรับพนักงานวารีเทพ
              รวมวิดีโอสอนงาน หลักสูตร แบบทดสอบ คะแนน
              และอันดับประจำเดือนไว้ในที่เดียว
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                🚀 เริ่มเรียนรู้
              </Link>

              <Link
                href="/departments"
                className="rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600"
              >
                ดูห้องเรียน
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* STAT */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">
              🏢
            </div>

            <div className="mt-2 text-3xl font-black">
              13
            </div>

            <div className="text-sm text-slate-500">
              ฝ่ายสำนักงานใหญ่
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">
              📚
            </div>

            <div className="mt-2 text-3xl font-black">
              120+
            </div>

            <div className="text-sm text-slate-500">
              หลักสูตร
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">
              🎬
            </div>

            <div className="mt-2 text-3xl font-black">
              500+
            </div>

            <div className="text-sm text-slate-500">
              วิดีโอ
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-3xl">
              👥
            </div>

            <div className="mt-2 text-3xl font-black">
              1,000+
            </div>

            <div className="text-sm text-slate-500">
              สมาชิก
            </div>
          </div>

        </div>

      </section>

      {/* DEPARTMENTS */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        <div className="mb-8">

          <p className="font-bold text-blue-600">
            LEARNING CENTER
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ห้องเรียน 13 ฝ่าย
          </h2>

          <p className="mt-2 text-slate-500">
            เลือกฝ่ายที่ต้องการเรียนรู้
          </p>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {departments.map((department) => (

            <Link
              key={department.id}
              href={"/departments/" + department.id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >

              {/* ICON + NUMBER */}
              <div className="flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  {department.icon}
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
                  {String(department.id).padStart(2, "0")}
                </div>

              </div>

              {/* NAME */}
              <h3 className="mt-6 min-h-[58px] text-lg font-black leading-7 text-slate-900">
                {department.name}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-2 text-sm text-slate-400">
                หลักสูตรการเรียนรู้
              </p>

              {/* LINK */}
              <div className="mt-5 font-bold text-blue-600 transition group-hover:translate-x-1">
                เข้าสู่ห้องเรียน →
              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

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
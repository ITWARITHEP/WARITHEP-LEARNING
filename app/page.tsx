import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-sm">
              🎓
            </div>

            <div>
              <div className="text-sm font-black text-slate-900 sm:text-base">
                วารีเทพ
              </div>

              <div className="text-[9px] font-black tracking-[0.25em] text-blue-600 sm:text-[10px]">
                LEARNING
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 sm:px-5 sm:text-sm"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white">
        {/* Ice Watermark */}
        <div className="pointer-events-none absolute -right-20 top-0 select-none text-[280px] font-black leading-none text-blue-50/70">
          
        </div>

        <div className="pointer-events-none absolute -left-24 bottom-0 select-none text-[240px] font-black leading-none text-blue-50/50">
          
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl items-center px-5 py-16 sm:px-6 lg:py-20">
          <div className="w-full text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm">
              🎓 ศูนย์การเรียนรู้ออนไลน์สำหรับพนักงานวารีเทพ
            </div>

            {/* Heading */}
            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              เรียนรู้
              <span className="text-blue-600"> พัฒนาตน </span>
              
              <br className="hidden sm:block" />
              และเติบโตไปพร้อมกัน
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
              ศูนย์กลางการเรียนรู้และพัฒนาศักยภาพบุคลากร
              <br className="hidden sm:block" />
              รวมวิดีโอสอนงาน หลักสูตร แบบทดสอบ และระบบติดตามการเรียนรู้
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"
              >
                🚀 สมัครสมาชิก
              </Link>

              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 sm:w-auto"
              >
                🔐 เข้าสู่ระบบ
              </Link>
            </div>

            {/* Access Notice */}
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4">
              <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-800">
                🔒 สำหรับสมาชิกวารีเทพ
              </div>

              <p className="mt-1 text-xs leading-6 text-slate-500">
                กรุณาสมัครสมาชิกและเข้าสู่ระบบก่อนเริ่มใช้งานห้องเรียน
              </p>
            </div>

            {/* Feature Preview */}
            <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  📚
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  ห้องเรียนออนไลน์
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  เรียนรู้จากวิดีโอสอนงานของแต่ละฝ่าย
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🎬
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  วิดีโอการเรียนรู้
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  เรียนจากวิดีโออบรมและสื่อการเรียนรู้
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🏆
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  พัฒนาตัวเอง
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  ติดตามผลการเรียนและพัฒนาศักยภาพของคุณ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 text-center">
          <div className="text-sm font-black text-slate-800">
            🎓 วารีเทพ Learning
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Learning • Training • Development
          </p>
        </div>
      </footer>
    </main>
  );
}
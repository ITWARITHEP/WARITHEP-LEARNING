import Link from "next/link";

export default function RankingPage() {
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

          <div className="flex items-center gap-2">

            <Link
              href="/dashboard"
              className="hidden rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/courses"
              className="hidden rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 md:block"
            >
              หลักสูตร
            </Link>

            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl"
            >
              👤
            </Link>

          </div>

        </div>

      </header>

      {/* HERO */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-12 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-50 text-5xl">
            🏆
          </div>

          <p className="mt-6 font-bold tracking-widest text-blue-600">
            MONTHLY RANKING
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900 md:text-5xl">
            Ranking ประจำเดือน
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
            อันดับจากคะแนนการเรียน วิดีโอ และแบบทดสอบ
            โดยระบบจะคำนวณจากข้อมูลการใช้งานจริง
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500">
            📅 เดือนปัจจุบัน
          </div>

        </div>

      </section>

      {/* TOP 3 */}
      <section className="mx-auto max-w-5xl px-6 py-10">

        <div className="grid gap-5 md:grid-cols-3">

          {/* SECOND */}
          <div className="order-2 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm md:order-1 md:mt-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🥈
            </div>

            <div className="mt-5 text-xs font-bold text-slate-400">
              อันดับ 2
            </div>

            <h3 className="mt-2 font-black text-slate-300">
              ยังไม่มีข้อมูล
            </h3>

            <div className="mt-4 text-3xl font-black text-slate-300">
              0
            </div>

            <p className="text-xs text-slate-400">
              คะแนน
            </p>

          </div>

          {/* FIRST */}
          <div className="order-1 rounded-3xl border-2 border-yellow-200 bg-white p-8 text-center shadow-xl shadow-yellow-100 md:order-2">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50 text-5xl">
              👑
            </div>

            <div className="mt-5 text-xs font-black text-yellow-600">
              อันดับ 1
            </div>

            <h3 className="mt-2 text-lg font-black text-slate-300">
              ยังไม่มีข้อมูล
            </h3>

            <div className="mt-4 text-4xl font-black text-slate-300">
              0
            </div>

            <p className="text-xs text-slate-400">
              คะแนน
            </p>

          </div>

          {/* THIRD */}
          <div className="order-3 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm md:mt-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
              🥉
            </div>

            <div className="mt-5 text-xs font-bold text-slate-400">
              อันดับ 3
            </div>

            <h3 className="mt-2 font-black text-slate-300">
              ยังไม่มีข้อมูล
            </h3>

            <div className="mt-4 text-3xl font-black text-slate-300">
              0
            </div>

            <p className="text-xs text-slate-400">
              คะแนน
            </p>

          </div>

        </div>

      </section>

      {/* RANKING TABLE */}
      <section className="mx-auto max-w-5xl px-6 pb-16">

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <p className="font-bold text-blue-600">
              LEADERBOARD
            </p>

            <h2 className="mt-1 text-2xl font-black">
              ตารางคะแนน
            </h2>

          </div>

          {/* EMPTY STATE */}
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-4xl">
              🏆
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-700">
              ยังไม่มีข้อมูล Ranking
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              เมื่อมีสมาชิกเริ่มเรียนและทำแบบทดสอบ
              ระบบจะนำคะแนนจริงมาคำนวณอันดับให้อัตโนมัติ
            </p>

          </div>

        </div>

      </section>

      {/* SCORE RULE */}
      <section className="mx-auto max-w-5xl px-6 pb-16">

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              💡
            </div>

            <div>

              <h2 className="font-black text-slate-900">
                Ranking คำนวณอย่างไร?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                ระบบจะนำคะแนนจากการเรียนและแบบทดสอบจริง
                มาคำนวณเป็นคะแนน Ranking ประจำเดือน
                โดยไม่มีการใส่คะแนนหรืออันดับจำลอง
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

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
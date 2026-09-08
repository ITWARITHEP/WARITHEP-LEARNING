"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type PageNavigationProps = {
  title?: string;
};

export default function PageNavigation({
  title,
}: PageNavigationProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        <div className="flex min-w-0 items-center gap-2">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">
              ย้อนกลับ
            </span>
          </button>

          {title && (
            <>
              <span className="text-slate-300">
                /
              </span>

              <span className="truncate text-sm font-black text-slate-800">
                {title}
              </span>
            </>
          )}

        </div>

        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
        >
          <span>⌂</span>
          <span className="hidden sm:inline">
            หน้าหลัก
          </span>
        </Link>

      </div>
    </div>
  );
}
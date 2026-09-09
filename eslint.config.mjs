import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // React 19 / Next.js 16
      // ไม่ให้กฎนี้ขวางการ Build จาก useEffect ที่เรียกฟังก์ชันโหลดข้อมูล
      "react-hooks/set-state-in-effect": "off",

      // ป้องกัน false positive จากฟังก์ชัน async ที่ใช้ร่วมกับ Effect
      "react-hooks/immutability": "off",

      // ไม่ให้ warning ตัวแปรที่ไม่ได้ใช้ทำให้ตรวจโค้ดยุ่งยาก
      "@typescript-eslint/no-unused-vars": "off",

      // ใช้ <img> ได้ โดยไม่ให้ lint ทำให้ build ไม่ผ่าน
      "@next/next/no-img-element": "off",

      // ไม่บังคับ dependency ของ useEffect
      "react-hooks/exhaustive-deps": "off",

      // ใช้ let ในกรณีที่โค้ดเดิมมีการจัดการสถานะ
      "prefer-const": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
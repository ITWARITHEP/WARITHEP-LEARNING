import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ยังไม่ได้ตั้งค่า Cloudflare Account ID หรือ API Token",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?limit=1000`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data?.errors?.[0]?.message || "ไม่สามารถดึงวิดีโอจาก Cloudflare ได้",
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: data.result || [],
    });
  } catch (error) {
    console.error("Cloudflare Stream Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการเชื่อมต่อ Cloudflare Stream",
      },
      { status: 500 }
    );
  }
}
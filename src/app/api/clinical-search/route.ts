import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 1) {
    return NextResponse.json({ status: true, payload: [] });
  }

  const token = await getToken({ req });

  if (!token?.accessToken) {
    return NextResponse.json(
      { message: "Unauthorized", code: 401, status: false },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(
      `${process.env.API_URL}/visits/clinical/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
        },
        cache: "no-store",
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error in clinical-search API route:", err);
    return NextResponse.json(
      { message: "Failed to search clinical records", status: false, payload: [] },
      { status: 500 },
    );
  }
}


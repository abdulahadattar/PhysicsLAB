import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// POST /api/upload-pdf?grade=9
export async function POST(req: NextRequest) {
  // Simple permission check (replace with real auth in production)
  const isTeacher = req.headers.get("x-user-role") === "teacher";
  if (!isTeacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const grade = req.nextUrl.searchParams.get("grade");
  if (!grade) {
    return NextResponse.json({ error: "Missing grade parameter" }, { status: 400 });
  }

  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Save file to public/textbooks/fulltextbooks/STBB/PhysicsG<grade>.pdf
  const savePath = path.join(process.cwd(), "public", "textbooks", "fulltextbooks", "STBB", `PhysicsG${grade}.pdf`);
  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(savePath, Buffer.from(arrayBuffer));

  return NextResponse.json({ success: true, path: `/textbooks/fulltextbooks/STBB/PhysicsG${grade}.pdf` });
}

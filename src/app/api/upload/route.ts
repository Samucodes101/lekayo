import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const folder = formData.get("folder") as string || "general"
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  const result = await uploadToCloudinary(file, folder)
  return NextResponse.json(result)
}
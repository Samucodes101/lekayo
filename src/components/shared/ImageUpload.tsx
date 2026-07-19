"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string, publicId: string) => void
  onRemove?: () => void
  folder?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "products",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setPreview(data.secure_url)
      onChange(data.secure_url, data.public_id)
      toast({ title: "Image uploaded successfully" })
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" })
      console.error(error)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" })
      return
    }

    handleUpload(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const event = { target: { files: [file] } } as any
      handleFileChange(event)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (onRemove) onRemove()
    else onChange("", "")
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload area */}
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition hover:border-gray-400",
            "flex flex-col items-center gap-2 min-h-[200px] justify-center"
          )}
        >
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
          {uploading && (
            <div className="w-full max-w-xs mt-2">
              <Progress value={progress} />
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <div className="relative aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
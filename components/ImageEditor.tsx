'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CameraIcon } from 'lucide-react'

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [selectedFilter, setSelectedFilter] = useState("none")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (image) {
      applyFilters()
    }
  }, [image, brightness, contrast, saturation, selectedFilter])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const applyFilters = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !image) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      ctx.drawImage(img, 0, 0, img.width, img.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let pixels = imageData.data

      switch (selectedFilter) {
        case "grayscale":
          for (let i = 0; i < pixels.length; i += 4) {
            const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
            pixels[i] = pixels[i + 1] = pixels[i + 2] = avg
          }
          break
        case "sepia":
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
            pixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
            pixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
            pixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
          }
          break
        case "invert":
          for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i]
            pixels[i + 1] = 255 - pixels[i + 1]
            pixels[i + 2] = 255 - pixels[i + 2]
          }
          break
      }

      ctx.putImageData(imageData, 0, 0)
    }
    img.src = image
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'edited-image.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">imageX Editor</h1>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
          </div>
          {image && (
            <>
              <div className="space-y-2">
                <Label>Filter</Label>
                <Select onValueChange={setSelectedFilter} defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                    <SelectItem value="invert">Invert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brightness</Label>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label>Contrast</Label>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label>Saturation</Label>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[saturation]}
                  onValueChange={(value) => setSaturation(value[0])}
                />
              </div>
              <div className="mt-4">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
              <Button onClick={handleDownload} className="w-full">Download Edited Image</Button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
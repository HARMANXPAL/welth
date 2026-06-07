"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReceiptScanner({ onScanComplete }) {
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleScan = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setScanning(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });

      if (!response.ok) throw new Error("Failed to scan receipt");

      const data = await response.json();
      onScanComplete(data);
      toast.success("Receipt scanned successfully!");
    } catch (error) {
      console.error("Scanning error:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleScan(e.target.files?.[0])}
      />
      {scanning ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <div>
            <p className="text-sm font-medium">Scanning receipt...</p>
            <p className="text-xs text-muted-foreground">
              AI is extracting data
            </p>
          </div>
        </>
      ) : (
        <>
          <Camera className="h-6 w-6 text-blue-500" />
          <div>
            <p className="text-sm font-medium">Scan Receipt with AI</p>
            <p className="text-xs text-muted-foreground">
              Click to upload a receipt image
            </p>
          </div>
        </>
      )}
    </div>
  );
}
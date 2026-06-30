import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { getSupabase } from "../utils/supabaseClient";
import { uploadAvatarToSupabase, deleteAvatarFromSupabase } from "../utils/avatarUpload";
import { playSystemClick, playSystemDing } from "../utils/audio";

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string | null | undefined;
  onSuccess: (newUrl: string | null) => void;
}

export default function ChangePhotoModal({
  isOpen,
  onClose,
  currentPhoto,
  onSuccess
}: ChangePhotoModalProps) {
  // Modal states: "SELECT" | "CROP" | "UPLOADING"
  const [modalState, setModalState] = useState<"SELECT" | "CROP" | "UPLOADING">("SELECT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string>("local_player");

  // Fetch active user ID on open
  useEffect(() => {
    if (isOpen) {
      const supabase = getSupabase();
      if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setActiveUserId(session.user.id);
          } else {
            setActiveUserId("local_player");
          }
        });
      } else {
        setActiveUserId("local_player");
      }
    }
  }, [isOpen]);

  // Crop configuration states
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setModalState("SELECT");
      setErrorMsg(null);
      setSelectedImageSrc(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // File loading/validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImageSrc(event.target.result as string);
        setModalState("CROP");
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        playSystemClick();
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (modalState !== "CROP") return;
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Mouse drag events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };

  // Touch drag events
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Save / Crop logic
  const handleSaveCrop = async () => {
    if (!selectedImageSrc || !imageRef.current) return;
    setModalState("UPLOADING");
    playSystemClick();

    try {
      const img = new Image();
      img.src = selectedImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Viewport container size (fixed 256px inside component)
      const viewportSize = 256;

      // Fit aspect ratio inside viewport
      let imgRenderWidth = viewportSize;
      let imgRenderHeight = viewportSize;
      const aspect = img.width / img.height;
      if (aspect > 1) {
        // Landscape
        imgRenderHeight = viewportSize;
        imgRenderWidth = viewportSize * aspect;
      } else {
        // Portrait
        imgRenderWidth = viewportSize;
        imgRenderHeight = viewportSize / aspect;
      }

      // Generate a perfect 512x512 square cropped image (satisfying resolution & compression limits)
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = 512;
      cropCanvas.height = 512;
      const ctx = cropCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to initialize crop rendering context.");
      }

      // Draw background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 512, 512);

      const scaleFactor = 512 / viewportSize;
      ctx.save();
      ctx.scale(scaleFactor, scaleFactor);
      ctx.translate(viewportSize / 2, viewportSize / 2);
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-imgRenderWidth / 2, -imgRenderHeight / 2);

      ctx.drawImage(img, 0, 0, imgRenderWidth, imgRenderHeight);
      ctx.restore();

      const supabase = getSupabase();

      if (supabase && activeUserId && activeUserId !== "local_player") {
        // 1. ONLINE MODE: Convert canvas to Blob and upload to Supabase Storage
        cropCanvas.toBlob(async (blob) => {
          if (!blob) {
            setErrorMsg("Cropping operation failed. Please try another image.");
            setModalState("CROP");
            return;
          }

          try {
            const publicUrl = await uploadAvatarToSupabase(activeUserId, blob);
            onSuccess(publicUrl);
            playSystemDing();
            onClose();
          } catch (e: any) {
            setErrorMsg(e.message || "Failed to upload avatar to Cloud Storage.");
            setModalState("CROP");
          }
        }, "image/webp", 0.85);
      } else {
        // 2. OFFLINE FALLBACK MODE: Convert canvas to compressed base64 string
        const base64Url = cropCanvas.toDataURL("image/jpeg", 0.85);
        onSuccess(base64Url);
        playSystemDing();
        onClose();
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred during crop processing.");
      setModalState("CROP");
    }
  };

  // Remove Photo handler
  const handleRemovePhoto = async () => {
    if (window.confirm("Are you sure you want to remove your profile photo?")) {
      setModalState("UPLOADING");
      playSystemClick();
      try {
        const supabase = getSupabase();
        if (supabase && activeUserId && activeUserId !== "local_player") {
          await deleteAvatarFromSupabase(activeUserId);
        }
        onSuccess(null);
        playSystemDing();
        onClose();
      } catch (e: any) {
        setErrorMsg(e.message || "Failed to remove avatar photo.");
        setModalState("SELECT");
      }
    }
  };

  // Calculate rendering boundaries to fit the aspect ratio inside the 256px crop circle
  let imgRenderWidth = 256;
  let imgRenderHeight = 256;
  if (selectedImageSrc && imageRef.current) {
    const aspect = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
    if (aspect > 1) {
      imgRenderHeight = 256;
      imgRenderWidth = 256 * aspect;
    } else {
      imgRenderWidth = 256;
      imgRenderHeight = 256 / aspect;
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={modalState !== "UPLOADING" ? onClose : undefined}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(123,47,255,0.15)] z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
          <span className="text-xs font-mono font-black text-purple-400 uppercase tracking-widest">
            {modalState === "CROP" ? "CROP PROFILE PHOTO" : "CHANGE PROFILE PHOTO"}
          </span>
          {modalState !== "UPLOADING" && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center justify-center overflow-y-auto space-y-5">
          
          {errorMsg && (
            <div className="w-full p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl flex gap-3 text-rose-300 text-[10px] items-start font-mono leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {modalState === "SELECT" && (
            <div className="w-full flex flex-col gap-3">
              {/* Take Photo button */}
              <button
                onClick={() => {
                  playSystemClick();
                  cameraInputRef.current?.click();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-900/40 to-purple-950/50 hover:from-purple-800/40 hover:to-purple-900/50 border border-purple-500/30 hover:border-purple-400/40 text-purple-200 text-xs font-mono font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Camera className="w-4.5 h-4.5" />
                <span>📷 Take Photo</span>
              </button>
              
              {/* Choose Gallery button */}
              <button
                onClick={() => {
                  playSystemClick();
                  galleryInputRef.current?.click();
                }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-mono font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4.5 h-4.5" />
                <span>🖼 Choose from Gallery</span>
              </button>

              {/* Remove Photo button */}
              {currentPhoto && !currentPhoto.includes("images.unsplash.com") && (
                <button
                  onClick={handleRemovePhoto}
                  className="w-full py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-500/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4.5 h-4.5 text-rose-400" />
                  <span>🗑 Remove Photo</span>
                </button>
              )}

              {/* Hidden HTML Inputs */}
              {/* Take photo via camera */}
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                capture="user"
                className="hidden"
              />
              {/* Choose from files */}
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
            </div>
          )}

          {modalState === "CROP" && selectedImageSrc && (
            <div className="w-full flex flex-col items-center space-y-5">
              
              {/* Circle Cropper Viewport Container */}
              <div 
                ref={viewportRef}
                className="w-64 h-64 rounded-full border-2 border-[#7B2FFF] overflow-hidden relative cursor-move bg-black select-none shadow-[0_0_30px_rgba(123,47,255,0.25)]"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={handleEndDrag}
                onMouseLeave={handleEndDrag}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={handleEndDrag}
              >
                {/* Visual guidelines */}
                <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none z-10" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/5 pointer-events-none z-10" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/5 pointer-events-none z-10" />

                <img
                  ref={imageRef}
                  src={selectedImageSrc}
                  alt="Crop Preview Source"
                  draggable={false}
                  className="absolute pointer-events-none max-w-none origin-center"
                  style={{
                    width: `${imgRenderWidth}px`,
                    height: `${imgRenderHeight}px`,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    left: "50%",
                    top: "50%"
                  }}
                />
              </div>

              {/* Slider zoom controls */}
              <div className="w-full space-y-1 font-mono text-[10px] text-zinc-500 uppercase font-bold">
                <div className="flex justify-between items-center px-1">
                  <span>Zoom / Scale Factor</span>
                  <span className="text-[#00D9FF]">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#7B2FFF] focus:outline-none"
                />
              </div>

              <span className="text-[9px] text-zinc-500 font-mono text-center">
                Drag to pan inside the circle. Zoom using slider bar.
              </span>

              {/* Crop Controls */}
              <div className="w-full flex gap-3 pt-2">
                <button
                  onClick={() => setModalState("SELECT")}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveCrop}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#7B2FFF] to-[#00D9FF] hover:opacity-90 text-white text-xs font-mono font-bold uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(123,47,255,0.35)] cursor-pointer"
                >
                  Save Photo
                </button>
              </div>

            </div>
          )}

          {modalState === "UPLOADING" && (
            <div className="w-full flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
              <div className="text-center">
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wider animate-pulse">
                  Uploading Image Assets
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Synchronizing matrix coordinates to secure storage...
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {modalState === "SELECT" && (
          <div className="border-t border-zinc-900 bg-zinc-950/50 px-5 py-3.5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

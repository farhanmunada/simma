import React, { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useUploadFacilityImage } from "../api/facilities.api";

interface FacilityImageUploadProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const FacilityImageUpload: React.FC<FacilityImageUploadProps> = ({
  label,
  sublabel,
  value,
  onChange,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadFacilityImage();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Ukuran berkas maksimal 5MB");
      return;
    }

    try {
      const res = await uploadMutation.mutateAsync(file);
      onChange(res.url);
    } catch (err: any) {
      setLocalError(err?.message || "Gagal mengunggah foto");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setLocalError(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        {sublabel && (
          <span className="text-[11px] text-slate-400">{sublabel}</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploadMutation.isPending}
      />

      {value ? (
        <div className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50 aspect-video flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white text-slate-700 hover:text-emerald-600 rounded-md text-xs font-medium shadow-sm transition"
              title="Ganti Foto"
            >
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-md shadow-sm transition"
              title="Hapus Foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploadMutation.isPending && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 aspect-video flex flex-col items-center justify-center ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-1.5 text-emerald-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[11px] font-medium">Mengunggah...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <div className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 group-hover:text-emerald-600">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                Klik untuk unggah foto
              </span>
              <span className="text-[10px] text-slate-400">
                Format JPG, PNG, WEBP (Maks. 5MB)
              </span>
            </div>
          )}
        </div>
      )}

      {localError && (
        <p className="text-[11px] text-rose-600 font-medium">{localError}</p>
      )}
    </div>
  );
};

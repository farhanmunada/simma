import React from "react";
import { Printer, Copy, Check } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import type { FacilityAsset } from "../types";

interface FacilityQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: FacilityAsset | null;
}

export const FacilityQrModal: React.FC<FacilityQrModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  const publicScanUrl = `${window.location.origin}/facilities/scan/${asset.qrCodeToken}`;
  // SVG QR Code representation with data url
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    publicScanUrl,
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicScanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Label & QR Code Inventaris"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Printable Physical Label Card */}
        <div
          id="facility-qr-label"
          className="border-2 border-slate-900 rounded-xl p-4 bg-white text-center shadow-sm space-y-2"
        >
          <div className="border-b border-slate-200 pb-2">
            <h4 className="text-xs font-black tracking-widest text-slate-800 uppercase">
              SIMMA MADRASAH ALIYAH
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              LABEL RESMI SARANA & PRASARANA
            </p>
          </div>

          <div className="flex justify-center py-2">
            <img
              src={qrSvgUrl}
              alt={`QR Code ${asset.code}`}
              className="w-36 h-36 border border-slate-200 p-1 rounded-lg"
            />
          </div>

          <div>
            <div className="font-mono font-bold text-sm text-slate-900 tracking-wider">
              {asset.code}
            </div>
            <div className="text-xs font-semibold text-slate-800 line-clamp-1">
              {asset.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Lokasi: {asset.location || "Madrasah"}
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="text-slate-500 font-medium">URL Pemindaian Cepat:</div>
          <div className="font-mono text-[11px] text-slate-700 break-all select-all">
            {publicScanUrl}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Tersalin
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Salin URL
              </>
            )}
          </Button>
          <Button type="button" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Cetak Label Fisik
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';

interface QRCodeGeneratorProps {
  battleId: string;
  battleTitle: string;
  onClose?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  battleId, 
  battleTitle, 
  onClose 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const battleUrl = `${window.location.origin}?battle=${battleId}`;

  useEffect(() => {
    generateQRCode();
  }, [battleId]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, battleUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      // Convert canvas to data URL for sharing
      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `read-the-room-${battleId}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const shareQRCode = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `read-the-room-${battleId}.png`, { type: 'image/png' });

        await navigator.share({
          title: `Join "${battleTitle}" on READ THE ROOM`,
          text: 'Scan this QR code to join the battle!',
          files: [file]
        });
      } catch (error) {
        // Fallback to copying URL
        copyBattleUrl();
      }
    } else {
      copyBattleUrl();
    }
  };

  const copyBattleUrl = async () => {
    try {
      await navigator.clipboard.writeText(battleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Share Battle</h2>
          <p className="text-gray-300 mb-6">Scan to join "{battleTitle}"</p>

          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="p-4 bg-white rounded-2xl shadow-2xl"
            >
              <canvas
                ref={canvasRef}
                className="block"
                width={256}
                height={256}
              />
            </motion.div>
          </div>

          <div className="mb-6 p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-gray-300 mb-2">Battle URL:</p>
            <p className="text-xs text-white font-mono break-all">{battleUrl}</p>
          </div>

          <div className="flex gap-3">
            <NeonButton onClick={downloadQRCode} size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </NeonButton>
            
            <NeonButton onClick={shareQRCode} size="sm" variant="secondary" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </NeonButton>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyBattleUrl}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
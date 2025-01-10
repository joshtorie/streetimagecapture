import React, { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface CameraProps {
  onCapture: (imageFile: File) => void;
}

export function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const compressedFile = await imageCompression(new File([blob], 'image.jpg', { type: 'image/jpeg' }), {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
        onCapture(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full rounded-lg"
      />
      <button
        onClick={captureImage}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
      >
        <CameraIcon className="w-8 h-8 text-blue-600" />
      </button>
    </div>
  );
}
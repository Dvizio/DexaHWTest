import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  type: 'check-in' | 'check-out';
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Location state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');

  // Camera state
  const [cameraError, setCameraError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Acquire Geolocation
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access.');
        } else {
          setLocationError('Could not acquire GPS location. Using default fallback.');
          // Fallback coordinate (e.g. Jakarta default) if browser is strict
          setCoords({ latitude: -6.2088, longitude: 106.8456 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser.'
          : 'Unable to access your webcam. Please ensure a camera is connected and not in use by another app.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedPreview(null);
      setNotes('');
      fetchLocation();
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, fetchLocation]);

  // Capture Photo snapshot from Video frame
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for mirror selfie effect
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(URL.createObjectURL(blob));
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const retakePhoto = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedBlob) return;
    if (!coords) {
      alert('Location coordinates are required. Please allow location access or refresh location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const filename = `selfie_${Date.now()}.jpg`;
      const file = new File([capturedBlob], filename, { type: 'image/jpeg' });

      formData.append('photo', file);
      formData.append('latitude', coords.latitude.toString());
      formData.append('longitude', coords.longitude.toString());
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isCheckIn = type === 'check-in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCheckIn
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {isCheckIn ? 'Record Daily Check-In' : 'Record Check-Out'}
              </h2>
              <p className="text-xs text-slate-400">
                Capture live selfie verification with GPS location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Camera View / Captured Image */}
          <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {cameraError ? (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="text-sm font-medium text-slate-300">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  Retry Camera Access
                </button>
              </div>
            ) : capturedPreview ? (
              <img
                src={capturedPreview}
                alt="Captured Selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Viewfinder Guideline */}
                <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] text-white/50 bg-black/40 px-2 py-0.5 rounded-full">
                    Position your face inside
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Camera Action Buttons */}
          <div className="flex justify-center gap-3">
            {!capturedBlob ? (
              <button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture Selfie
              </button>
            ) : (
              <button
                onClick={retakePhoto}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Photo
              </button>
            )}
          </div>

          {/* Location Status Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>GPS Geolocation</span>
              </div>
              <button
                onClick={fetchLocation}
                disabled={locationStatus === 'loading' || isSubmitting}
                title="Refresh GPS Location"
                className="text-slate-400 hover:text-blue-400 p-1 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    locationStatus === 'loading' ? 'animate-spin text-blue-400' : ''
                  }`}
                />
              </button>
            </div>

            {locationStatus === 'loading' && (
              <p className="text-slate-400">Fetching current GPS coordinates...</p>
            )}

            {coords && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
                </span>
              </div>
            )}

            {locationError && (
              <p className="text-amber-400 flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {locationError}
              </p>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Working from home, morning sync ready..."
              rows={2}
              maxLength={255}
              disabled={isSubmitting}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!capturedBlob || !coords || isSubmitting}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isCheckIn
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm & Submit {isCheckIn ? 'Check-In' : 'Check-Out'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

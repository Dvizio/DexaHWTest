import React, { useState, useRef, useEffect } from 'react';
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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [locationError, setLocationError] = useState<string>('');

  // Camera state
  const [cameraError, setCameraError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Acquire Geolocation helper
  const acquireLocation = () => {
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
          setCoords({ latitude: -6.2088, longitude: 106.8456 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleRefreshLocation = () => {
    acquireLocation();
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

  // Start Camera Stream
  const startCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err: unknown) => {
        console.error('Camera access error:', err);
        const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
        setCameraError(
          isNotAllowed
            ? 'Camera permission denied. Please allow camera permissions in your browser.'
            : 'Unable to access your webcam. Please ensure a camera is connected and not in use by another app.'
        );
      });
  };

  // Reset Modal Form State
  const resetState = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setNotes('');
    setCameraError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error('Camera access error:', err);
        const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
        setCameraError(
          isNotAllowed
            ? 'Camera permission denied. Please allow camera permissions in your browser.'
            : 'Unable to access your webcam. Please ensure a camera is connected and not in use by another app.'
        );
      });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          if (!isMounted) return;
          setLocationStatus('error');
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError('Location permission denied. Please allow location access.');
          } else {
            setLocationError('Could not acquire GPS location. Using default fallback.');
            setCoords({ latitude: -6.2088, longitude: 106.8456 });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

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
      handleClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isCheckIn = type === 'check-in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-gray-50 border border-gray-300 w-full max-w-lg rounded-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-300 text-black">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-black">
                {isCheckIn ? 'Record Daily Check-In' : 'Record Check-Out'}
              </h2>
              <p className="text-xs text-gray-500">
                Capture live selfie verification with GPS location
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-black p-1 rounded-md hover:bg-gray-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          {/* Camera View / Captured Image */}
          <div className="relative aspect-4/3 bg-white rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
            {cameraError ? (
              <div className="p-4 text-center text-gray-500 space-y-2">
                <AlertTriangle className="w-8 h-8 text-black mx-auto" />
                <p className="text-xs font-medium text-black">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-300 hover:bg-[#C5B5A9] text-black rounded-md border border-gray-300 transition"
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
                  className="w-full h-full object-cover scale-x--1"
                />
                {/* Viewfinder Guideline */}
                <div className="absolute inset-6 border-2 border-dashed border-black/30 rounded-md pointer-events-none flex items-center justify-center">
                  <span className="text-10px text-black bg-white/80 px-2 py-0.5 rounded-md">
                    Position your face inside
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Camera Action Buttons */}
          <div className="flex justify-center gap-2">
            {!capturedBlob ? (
              <button
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gray-300 hover:bg-#C5B5A9 disabled:bg-gray-50 text-black text-xs font-semibold rounded-md transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture Selfie
              </button>
            ) : (
              <button
                onClick={retakePhoto}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white   hover:bg-gray-50  text-black text-xs font-semibold rounded-md border border-gray-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Photo
              </button>
            )}
          </div>

          {/* Location Status Card */}
          <div className="bg-white border border-gray-300 rounded-md p-2.5 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-black font-medium">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>GPS Geolocation</span>
              </div>
              <button
                onClick={handleRefreshLocation}
                disabled={locationStatus === 'loading' || isSubmitting}
                title="Refresh GPS Location"
                className="text-gray-500 hover:text-black p-0.5 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${locationStatus === 'loading' ? 'animate-spin text-black' : ''
                    }`}
                />
              </button>
            </div>

            {locationStatus === 'loading' && (
              <p className="text-gray-500 text-11px">Fetching current GPS coordinates...</p>
            )}

            {coords && (
              <div className="flex items-center gap-1.5 text-black font-mono text-11px">
                <CheckCircle2 className="w-3 h-3 text-black" />
                <span>
                  Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
                </span>
              </div>
            )}

            {locationError && (
              <p className="text-black flex items-center gap-1 text-10px">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                {locationError}
              </p>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-black flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Working from home, morning sync ready..."
              rows={2}
              maxLength={255}
              disabled={isSubmitting}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black resize-none transition"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-gray-300 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-black hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!capturedBlob || !coords || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold text-black bg-gray-300 hover:bg-#C5B5A9 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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


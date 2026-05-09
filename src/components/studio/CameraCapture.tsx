import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { VideoGeneration, GenerationSettings } from '../../types';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface CameraCaptureProps {
  settings: GenerationSettings;
  onCapture: (gen: VideoGeneration) => void;
}

type CameraState = 'idle' | 'requesting' | 'live' | 'recording' | 'preview' | 'error';

// Pick the first mimeType the browser actually supports
function getSupportedMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ settings, onCapture }) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const streamRef   = useRef<MediaStream | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [previewUrl, setPreviewUrl]   = useState<string>('');
  const [errorMsg, setErrorMsg]       = useState('');
  const [elapsed, setElapsed]         = useState(0);
  const [permDenied, setPermDenied]   = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [stopStream, previewUrl]);

  // Check camera permission on mount and watch for changes
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'camera' as PermissionName }).then(status => {
      if (status.state === 'denied') {
        setPermDenied(true);
        setCameraState('error');
        setErrorMsg('Camera access is blocked by your browser.');
      }
      status.onchange = () => {
        if (status.state === 'granted') {
          setPermDenied(false);
          setCameraState('idle');
          setErrorMsg('');
        } else if (status.state === 'denied') {
          setPermDenied(true);
          setCameraState('error');
          setErrorMsg('Camera access is blocked by your browser.');
        }
      };
    }).catch(() => {/* Permissions API not available */});
  }, []);

  // Whenever cameraState transitions to 'live', attach the stream to the video element.
  // We do it here (after render) so videoRef.current is guaranteed to be in the DOM.
  useEffect(() => {
    if (cameraState === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {/* autoplay policy — user interaction already occurred */});
    }
  }, [cameraState]);

  const startCamera = async () => {
    setErrorMsg('');

    // Check API availability (requires HTTPS or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setErrorMsg('Camera API not available. Make sure the site is served over HTTPS or localhost.');
      return;
    }

    setCameraState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      setCameraState('live'); // useEffect above attaches stream after render
    } catch (err: unknown) {
      setCameraState('error');
      const name = (err instanceof Error) ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMsg('Camera access denied. Click the camera icon in your browser address bar to allow access.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorMsg('No camera found. Plug in a webcam and try again.');
      } else if (name === 'NotReadableError') {
        setErrorMsg('Camera is already in use by another app. Close it and try again.');
      } else {
        setErrorMsg('Could not start camera. Try refreshing the page.');
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url  = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopStream();
      setCameraState('preview');
    };

    recorder.start(100); // collect data every 100 ms for reliability
    recorderRef.current = recorder;
    setElapsed(0);
    setCameraState('recording');
    timerRef.current = setInterval(() => setElapsed(n => n + 1), 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    stopStream();
    setCameraState('preview');
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleUseVideo = () => {
    const gen: VideoGeneration = {
      id: `upload-${Date.now()}`,
      prompt: 'Uploaded video',
      ...settings,
      status: 'done',
      createdAt: new Date(),
      thumbnailGradient: THUMB_GRADIENTS[settings.style],
      videoUrl: previewUrl,
      isUploaded: true,
    };
    onCapture(gen);
    setPreviewUrl('');
    setCameraState('idle');
  };

  const handleDiscard = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setCameraState('idle');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isLiveState = cameraState === 'live' || cameraState === 'recording';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Camera / Upload
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Record with your camera or upload a video from your device.
        </div>

        {/* Viewfinder */}
        <div style={{
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          {/* Live camera — always in DOM so videoRef is always valid */}
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isLiveState ? 'block' : 'none',
            }}
          />

          {/* Recorded / uploaded preview */}
          {cameraState === 'preview' && previewUrl && (
            <video
              src={previewUrl}
              controls
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Idle / requesting / error placeholder */}
          {!isLiveState && cameraState !== 'preview' && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {cameraState === 'error' ? '⚠️' : '📷'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {cameraState === 'requesting' ? 'Allow camera access in your browser…' : 'Camera not started'}
              </div>
              {errorMsg && (
                <div style={{ fontSize: 12, color: '#FC5C5C', marginTop: 8, lineHeight: 1.5, maxWidth: 300 }}>
                  {errorMsg}
                  {permDenied && (
                    <div style={{ marginTop: 10, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12 }}>How to fix:</div>
                      <div>1. Click the <strong>camera icon</strong> in your browser's address bar</div>
                      <div>2. Select <strong>"Allow"</strong> for camera access</div>
                      <div>3. Click <strong>Refresh</strong> below</div>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: 6, padding: '7px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        Refresh page
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recording badge */}
          {cameraState === 'recording' && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(252,92,92,0.9)', borderRadius: 20, padding: '4px 10px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} className="animate-pulse-glow" />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{fmt(elapsed)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(cameraState === 'idle' || cameraState === 'error') && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={startCamera} style={primaryBtn}>
                📷 Start Camera
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} style={ghostBtn}>
                📁 Upload File
              </button>
            </div>
          )}

          {cameraState === 'requesting' && (
            <div style={{ ...ghostBtn, textAlign: 'center' }}>Waiting for permission…</div>
          )}

          {cameraState === 'live' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={startRecording} style={primaryBtn}>
                ⏺ Start Recording
              </button>
              <button type="button" onClick={() => { stopStream(); setCameraState('idle'); }} style={ghostBtn}>
                Cancel
              </button>
            </div>
          )}

          {cameraState === 'recording' && (
            <button type="button" onClick={stopRecording} style={{ ...primaryBtn, background: '#FC5C5C' }}>
              ⏹ Stop Recording
            </button>
          )}

          {cameraState === 'preview' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleUseVideo} style={primaryBtn}>
                ✓ Use This Video
              </button>
              <button type="button" onClick={handleDiscard} style={ghostBtn}>
                Discard
              </button>
            </div>
          )}
        </div>

        {/* Drop zone — only in idle/error */}
        {(cameraState === 'idle' || cameraState === 'error') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 10px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith('video/')) {
                  const url = URL.createObjectURL(file);
                  setPreviewUrl(url);
                  stopStream();
                  setCameraState('preview');
                }
              }}
              style={{
                width: '100%',
                padding: '20px 0',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{ fontSize: 28 }}>🎥</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Drag & drop or click to upload</span>
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>MP4, MOV, WEBM — up to 2 GB</span>
            </div>
          </>
        )}

        {/* Hidden file input — no capture attr so it shows the file picker, not the camera */}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

const primaryBtn: React.CSSProperties = {
  flex: 1,
  padding: '11px 0',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: 'var(--grad-primary)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  textAlign: 'center',
};

const ghostBtn: React.CSSProperties = {
  flex: 1,
  padding: '11px 0',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  textAlign: 'center',
};

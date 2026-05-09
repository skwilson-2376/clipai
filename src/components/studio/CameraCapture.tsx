import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { VideoGeneration, GenerationSettings } from '../../types';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';

interface CameraCaptureProps {
  settings: GenerationSettings;
  onCapture: (gen: VideoGeneration) => void;
}

type CameraState = 'idle' | 'requesting' | 'live' | 'recording' | 'preview' | 'error';

export const CameraCapture: React.FC<CameraCaptureProps> = ({ settings, onCapture }) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const streamRef   = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [previewUrl, setPreviewUrl]   = useState<string>('');
  const [errorMsg, setErrorMsg]       = useState('');
  const [elapsed, setElapsed]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [stopStream, previewUrl]);

  const startCamera = async () => {
    setCameraState('requesting');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('live');
    } catch {
      setCameraState('error');
      setErrorMsg('Camera access denied. Please allow camera access and try again.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopStream();
      setCameraState('preview');
    };
    recorder.start();
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

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Camera / Upload
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Record with your camera or upload a video from your device.
        </div>

        {/* Viewfinder / Preview */}
        <div
          style={{
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
          }}
        >
          {(cameraState === 'live' || cameraState === 'recording') && (
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          )}
          {cameraState === 'preview' && previewUrl && (
            <video
              src={previewUrl}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {(cameraState === 'idle' || cameraState === 'requesting' || cameraState === 'error') && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {cameraState === 'requesting' ? 'Requesting camera access…' : 'Camera not started'}
              </div>
              {errorMsg && (
                <div style={{ fontSize: 12, color: '#FC5C5C', marginTop: 8, maxWidth: 260 }}>{errorMsg}</div>
              )}
            </div>
          )}

          {/* Recording indicator */}
          {cameraState === 'recording' && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(252,92,92,0.85)',
              borderRadius: 20,
              padding: '4px 10px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} className="animate-pulse-glow" />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{fmt(elapsed)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cameraState === 'idle' || cameraState === 'error' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={startCamera}
                style={primaryBtn}
              >
                📷 Start Camera
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={ghostBtn}
              >
                📁 Upload File
              </button>
            </div>
          ) : cameraState === 'requesting' ? (
            <div style={ghostBtn as React.CSSProperties}>Requesting access…</div>
          ) : cameraState === 'live' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={startRecording} style={primaryBtn}>
                ⏺ Start Recording
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} style={ghostBtn}>
                📁 Upload Instead
              </button>
            </div>
          ) : cameraState === 'recording' ? (
            <button type="button" onClick={stopRecording} style={{ ...primaryBtn, background: '#FC5C5C' }}>
              ⏹ Stop Recording
            </button>
          ) : cameraState === 'preview' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleUseVideo} style={primaryBtn}>
                ✓ Use This Video
              </button>
              <button type="button" onClick={handleDiscard} style={ghostBtn}>
                Discard
              </button>
            </div>
          ) : null}
        </div>

        {/* Divider */}
        {(cameraState === 'idle' || cameraState === 'error') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        )}

        {(cameraState === 'idle' || cameraState === 'error') && (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '20px 0',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
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
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>MP4, MOV, WEBM supported</span>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          capture="environment"
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
};

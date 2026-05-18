import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Select, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { VideoGeneration, GenerationSettings } from '../../types';
import { THUMB_GRADIENTS } from '../../constants/thumbnailGradients';
import { saveVideoBlob } from '../../lib/videoDB';

interface CameraCaptureProps {
  settings: GenerationSettings;
  onCapture: (gen: VideoGeneration) => void;
}

type CameraState = 'idle' | 'requesting' | 'live' | 'recording' | 'preview' | 'error';

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
  const recorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<Blob[]>([]);
  const streamRef    = useRef<MediaStream | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef  = useRef<string>('');

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [previewUrl, setPreviewUrl]   = useState<string>('');
  const [errorMsg, setErrorMsg]       = useState('');
  const [elapsed, setElapsed]         = useState(0);
  const [permDenied, setPermDenied]   = useState(false);

  // Camera selection state
  const [devices, setDevices]               = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const previewUrlRef   = useRef('');
  const cameraStateRef  = useRef<CameraState>('idle');
  previewUrlRef.current  = previewUrl;
  cameraStateRef.current = cameraState;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ── Device enumeration ────────────────────────────────────────────────────
  // Before permission is granted labels are empty strings (browser privacy).
  // We re-enumerate after getUserMedia resolves so the dropdown shows real names.
  const enumerateDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all   = await navigator.mediaDevices.enumerateDevices();
      const video = all.filter(d => d.kind === 'videoinput');
      setDevices(video);
      // Auto-select first device if nothing selected yet
      setSelectedDeviceId(prev => (prev || video[0]?.deviceId || ''));
    } catch {
      // enumerate not supported — silently ignore
    }
  }, []);

  // Initial enumerate + listen for device plug/unplug
  useEffect(() => {
    enumerateDevices();
    navigator.mediaDevices?.addEventListener('devicechange', enumerateDevices);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', enumerateDevices);
  }, [enumerateDevices]);

  // Unmount cleanup
  useEffect(() => () => {
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    if (cameraStateRef.current === 'preview' && previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, [stopStream]);

  // Check camera permission on mount
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
    }).catch(() => {});
  }, []);

  // Attach stream to video element after cameraState → 'live'
  useEffect(() => {
    if (cameraState === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState]);

  // ── Camera start / switch ─────────────────────────────────────────────────
  const openCamera = useCallback(async (deviceId?: string) => {
    setErrorMsg('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setErrorMsg('Camera API not available. The site must be served over HTTPS.');
      return;
    }

    setCameraState('requesting');
    try {
      const videoConstraint = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: 'user',            width: { ideal: 1280 }, height: { ideal: 720 } };

      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: true });
      streamRef.current = stream;
      // Re-enumerate now that permission is granted — labels become available
      await enumerateDevices();
      setCameraState('live');
    } catch (err: unknown) {
      setCameraState('error');
      const name = (err instanceof Error) ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMsg('Camera access denied. Click the camera icon in your address bar to allow access.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorMsg('No camera found. Plug in a webcam and try again.');
      } else if (name === 'NotReadableError') {
        setErrorMsg('Camera is in use by another app. Close it and try again.');
      } else if (name === 'OverconstrainedError') {
        // Requested deviceId no longer valid — fall back to default
        setErrorMsg('Selected camera is unavailable. Switching to default.');
        setSelectedDeviceId('');
        await openCamera(undefined);
      } else {
        setErrorMsg('Could not start camera. Try refreshing the page.');
      }
    }
  }, [enumerateDevices]);

  const startCamera = () => openCamera(selectedDeviceId || undefined);

  // Switch camera while live (stops current stream, opens new one)
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (cameraState !== 'live' && cameraState !== 'recording') return;

    // If recording, stop it first
    if (cameraState === 'recording') {
      recorderRef.current?.stop();
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    stopStream();
    await openCamera(deviceId);
  };

  // Flip between the two cameras (mobile helper)
  const flipCamera = () => {
    if (devices.length < 2) return;
    const currentIdx = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextDevice  = devices[(currentIdx + 1) % devices.length];
    handleDeviceChange(nextDevice.deviceId);
  };

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    mimeTypeRef.current = mimeType;
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url  = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopStream();
      setCameraState('preview');
    };

    recorder.start(100);
    recorderRef.current = recorder;
    setElapsed(0);
    setCameraState('recording');
    timerRef.current = setInterval(() => setElapsed(n => n + 1), 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    stopStream();
    setCameraState('preview');
    e.target.value = '';
  };

  const handleUseVideo = async () => {
    const id = `upload-${Date.now()}`;
    let videoUrl = previewUrl;
    try {
      const res  = await fetch(previewUrl);
      const blob = await res.blob();
      await saveVideoBlob(id, blob);
      videoUrl = `idb://${id}`;
    } catch {
      // blob URL still works for the current session
    }
    const gen: VideoGeneration = {
      id,
      prompt: 'Recorded video',
      ...settings,
      status: 'done',
      createdAt: new Date(),
      thumbnailGradient: THUMB_GRADIENTS[settings.style],
      videoUrl,
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

  // Friendly label for a device
  const deviceLabel = (d: MediaDeviceInfo, idx: number) =>
    d.label || `Camera ${idx + 1}`;

  const showDeviceSelector = devices.length > 1 && cameraState !== 'preview' && cameraState !== 'requesting';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Camera / Upload
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Record with your camera or upload a video from your device.
        </div>

        {/* ── Camera selector ──────────────────────────────────────────────── */}
        {showDeviceSelector && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              value={selectedDeviceId || undefined}
              onChange={handleDeviceChange}
              style={{ flex: 1 }}
              placeholder="Select camera"
              options={devices.map((d, i) => ({
                value: d.deviceId,
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📷</span>
                    <span style={{ fontSize: 13 }}>{deviceLabel(d, i)}</span>
                  </span>
                ),
              }))}
            />
            {/* Flip button — quick cycling through all cameras */}
            <Tooltip title={`Switch to next camera (${devices.length} available)`}>
              <button
                type="button"
                onClick={flipCamera}
                style={{
                  width: 36, height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <SyncOutlined style={{ fontSize: 14 }} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* ── Viewfinder ───────────────────────────────────────────────────── */}
        <div style={{
          width: '100%', aspectRatio: '4/3',
          borderRadius: 'var(--radius-xl)',
          background: '#0e0e12',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          {/* Live feed */}
          <video
            ref={videoRef}
            muted playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isLiveState ? 'block' : 'none',
            }}
          />

          {/* Preview */}
          {cameraState === 'preview' && previewUrl && (
            <video
              src={previewUrl}
              controls playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Idle / error placeholder */}
          {!isLiveState && cameraState !== 'preview' && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {cameraState === 'error' ? '⚠️' : '📷'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {cameraState === 'requesting' ? 'Allow camera access in your browser…' : 'Camera not started'}
              </div>
              {errorMsg && (
                <div style={{ fontSize: 12, color: '#FC5C5C', marginTop: 8, lineHeight: 1.5, maxWidth: 300 }}>
                  {errorMsg}
                  {permDenied && (
                    <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 12 }}>How to fix:</div>
                      <div>1. Click the <strong>camera icon</strong> in your address bar</div>
                      <div>2. Select <strong>"Allow"</strong> for camera access</div>
                      <div>3. Click <strong>Refresh</strong> below</div>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
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
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(252,92,92,0.9)', borderRadius: 20, padding: '4px 10px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} className="animate-pulse-glow" />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{fmt(elapsed)}</span>
            </div>
          )}

          {/* Flip camera overlay button (live / recording) */}
          {isLiveState && devices.length > 1 && (
            <Tooltip title="Switch camera">
              <button
                type="button"
                onClick={flipCamera}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,92,252,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
              >
                <SyncOutlined style={{ fontSize: 15 }} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
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
            <div style={{ ...ghostBtn, textAlign: 'center', cursor: 'default' }}>Waiting for permission…</div>
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
              <button
                type="button"
                onClick={() => {
                  const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm';
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = `clip-${Date.now()}.${ext}`;
                  a.click();
                }}
                style={ghostBtn}
              >
                Save to device
              </button>
              <button type="button" onClick={handleDiscard} style={ghostBtn}>Discard</button>
            </div>
          )}
        </div>

        {/* ── Drop zone ─────────────────────────────────────────────────────── */}
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
                width: '100%', padding: '20px 0',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', transition: 'border-color 0.15s', boxSizing: 'border-box',
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

        <input ref={fileRef} type="file" accept="video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

const primaryBtn: React.CSSProperties = {
  flex: 1, padding: '11px 0',
  borderRadius: 'var(--radius-md)', border: 'none',
  background: 'var(--grad-primary)', color: '#fff',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--font-body)', textAlign: 'center',
};

const ghostBtn: React.CSSProperties = {
  flex: 1, padding: '11px 0',
  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-muted)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--font-body)', textAlign: 'center',
};

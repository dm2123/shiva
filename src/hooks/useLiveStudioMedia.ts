'use client';

import { useState, useEffect, useRef } from 'react';

interface DeviceState {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
}

export function useLiveStudioMedia() {
  const [devices, setDevices] = useState<DeviceState>({
    cameras: [],
    microphones: [],
    selectedCameraId: null,
    selectedMicId: null,
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [screenActive, setScreenActive] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load available devices
  const loadDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = allDevices.filter(d => d.kind === 'videoinput');
      const microphones = allDevices.filter(d => d.kind === 'audioinput');
      
      setDevices(prev => ({
        ...prev,
        cameras,
        microphones,
        selectedCameraId: prev.selectedCameraId || (cameras.length > 0 ? cameras[0].deviceId : null),
        selectedMicId: prev.selectedMicId || (microphones.length > 0 ? microphones[0].deviceId : null),
      }));
    } catch (err: any) {
      console.error('Failed to list devices', err);
    }
  };

  // Setup basic audio meter
  const setupAudioMeter = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Prevent re-creating analyser
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }

    try {
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!micActive && animationFrameRef.current) {
          setMicLevel(0);
          cancelAnimationFrame(animationFrameRef.current);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(avg);
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (err) {
      console.error('Audio meter setup failed', err);
    }
  };

  const stopAllTracks = (stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const initializeMedia = async (camId: string | null, micId: string | null) => {
    setError(null);
    try {
      if (streamRef.current) {
        stopAllTracks(streamRef.current);
      }

      const constraints: MediaStreamConstraints = {
        video: cameraActive ? (camId ? { deviceId: { exact: camId } } : true) : false,
        audio: micActive ? (micId ? { deviceId: { exact: micId } } : true) : false,
      };

      if (!cameraActive && !micActive) {
        if (videoRef.current) videoRef.current.srcObject = null;
        setMicLevel(0);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Always show something on video if we have screen or camera
      if (videoRef.current) {
        if (screenStreamRef.current && screenActive) {
          // Keep screen stream active
        } else if (cameraActive) {
           // We might need to split out the video track specific stream if we want to display it
           videoRef.current.srcObject = new MediaStream(stream.getVideoTracks());
        } else {
           videoRef.current.srcObject = null;
        }
      }

      if (micActive) {
        setupAudioMeter(stream);
      } else {
        setMicLevel(0);
      }

      await loadDevices(); // Reload to get labeled devices if permission wasn't granted before
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permission denied for camera/microphone.');
      } else if (err.name === 'NotFoundError') {
        setError('Requested device not found.');
      } else {
        setError(err.message || 'Error accessing media devices.');
      }
      setCameraActive(false);
      setMicActive(false);
    }
  };

  const toggleScreenShare = async () => {
    if (screenActive) {
      stopAllTracks(screenStreamRef.current);
      screenStreamRef.current = null;
      setScreenActive(false);
      // Restore camera if active
      if (cameraActive && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = new MediaStream(streamRef.current.getVideoTracks());
      } else if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        setScreenActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Handle user stopping stream from browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenActive(false);
          screenStreamRef.current = null;
          if (cameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = new MediaStream(streamRef.current.getVideoTracks());
          }
        };
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') { // Ignore user cancelled
           setError('Failed to start screen share.');
        }
      }
    }
  };

  // Re-run initialization when selection changes or toggles
  useEffect(() => {
    initializeMedia(devices.selectedCameraId, devices.selectedMicId);
  }, [devices.selectedCameraId, devices.selectedMicId, cameraActive, micActive]);

  // Clean up on unmount
  useEffect(() => {
    // Initial fetch for devices and asks for permission ideally
    loadDevices();
    
    return () => {
      stopAllTracks(streamRef.current);
      stopAllTracks(screenStreamRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    videoRef,
    devices,
    setDevices,
    cameraActive,
    setCameraActive,
    micActive,
    setMicActive,
    screenActive,
    toggleScreenShare,
    micLevel,
    error,
  };
}

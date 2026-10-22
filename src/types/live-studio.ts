export type CaptureSourceType = 
  | 'BROWSER_CAMERA' 
  | 'CAPTURE_DEVICE' 
  | 'SCREEN' 
  | 'DIGITAL_BOARD' 
  | 'PRESENTATION';

export interface LiveInputSource {
  /** Unique identifier for the source (e.g. deviceId or virtual ID) */
  id: string;
  
  /** Technical category of the source */
  type: CaptureSourceType;
  
  /** Human-readable label (e.g. "Sony A7S III via CamLink" or "Integrated Webcam") */
  label: string;
  
  /** Whether this source is currently capturing and actively routing into the Studio */
  isActive: boolean;
  
  /** The underlying browser MediaStream. Will be useful when adapting HDMI/SDI ingest via WebRTC or Capture cards. */
  stream: MediaStream | null;
  
  /** Initialize the hardware or virtual source */
  initialize: () => Promise<void>;
  
  /** Safely spin down and release hardware blocks */
  stop: () => void;
}

// ... existing extensions ...

export interface BrowserCameraSource extends LiveInputSource {
  type: 'BROWSER_CAMERA';
  settings: MediaTrackSettings;
}

export interface CaptureDeviceSource extends LiveInputSource {
  type: 'CAPTURE_DEVICE';
  hardwareId: string;
  resolution: { width: number; height: number };
  framerate: number;
}

export interface ScreenSource extends LiveInputSource {
  type: 'SCREEN';
  displayId: string;
}

// Phase 03 additions
export type ClassroomLayoutType = 
  | 'FULL_CAMERA' 
  | 'FULL_BOARD' 
  | 'FULL_SCREEN' 
  | 'FULL_PRESENTATION' 
  | 'PIP_BOARD' 
  | 'PIP_SCREEN' 
  | 'PIP_PRESENTATION' 
  | 'SPLIT_CAMERA_BOARD';

export type BoardDrawingTool = 'PEN' | 'ERASER' | 'HIGHLIGHTER' | 'LINE' | 'RECTANGLE';

export interface BoardStroke {
  id: string;
  tool: BoardDrawingTool;
  points: { x: number, y: number }[];
  color: string;
  width: number;
}

/**
 * Foundation for the Studio Session Lifecycle
 * Used to decouple front-end UI state from purely backend authoritative state
 */
export type StudioReadinessState = 
  | 'NOT_READY'
  | 'READY'
  | 'STARTING'
  | 'LIVE'
  | 'ENDING'
  | 'ENDED'
  | 'ERROR';

export interface StudioSession {
  classId: string;
  status: StudioReadinessState;
  activeLayout: ClassroomLayoutType;
  primaryVideoSource: LiveInputSource | null;
  primaryAudioSource: LiveInputSource | null;
  screenShareSource: LiveInputSource | null;
  errorMessage?: string;
}

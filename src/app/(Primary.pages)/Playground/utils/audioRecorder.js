/**
 * Canvas Audio Voice Memo Recorder
 * Inspired by Samsung Notes & Apple Notes Voice Recording attached to notes.
 *
 * Captures microphone audio using MediaRecorder API and generates base64 / blob URLs
 * with playback duration and timestamp.
 */

// Browsers differ in what they can record: Chrome and Firefox produce WebM, Safari produces MP4.
// The first supported type is used, and the recording is labelled with what was actually produced.
const PREFERRED_AUDIO_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export function pickRecordingType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return PREFERRED_AUDIO_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = 0;

/**
 * Checks if browser supports microphone recording
 */
export function isAudioRecordingSupported() {
  return typeof window !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia);
}

/**
 * Starts audio recording from user's microphone
 * @param {Function} onProgress Optional tick callback
 * @returns {Promise<boolean>} Success status
 */
export async function startAudioRecording() {
  if (!isAudioRecordingSupported()) {
    throw new Error('Microphone audio recording not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  recordingStartTime = Date.now();

  const recordingType = pickRecordingType();
  mediaRecorder = recordingType ? new MediaRecorder(stream, { mimeType: recordingType }) : new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start(200); // 200ms timeslice
  return true;
}

/**
 * Stops audio recording and returns audio Blob & DataURL
 * @returns {Promise<{ blob: Blob, dataUrl: string, durationMs: number }>}
 */
export function stopAudioRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      return reject(new Error('No active recording in progress.'));
    }

    const durationMs = Date.now() - recordingStartTime;

    mediaRecorder.onstop = () => {
      const producedType = mediaRecorder.mimeType || (audioChunks[0] && audioChunks[0].type) || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: producedType });
      const reader = new FileReader();

      reader.onloadend = () => {
        // Stop all tracks in stream to release microphone indicator
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        mediaRecorder = null;
        audioChunks = [];

        resolve({
          blob: audioBlob,
          dataUrl: reader.result,
          durationMs,
          mimeType: producedType,
        });
      };

      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.stop();
  });
}

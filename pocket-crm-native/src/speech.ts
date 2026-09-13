import { Platform } from 'react-native';

// Die Web Speech API gibt es nur im Browser und sie ist nicht in den RN-Typen,
// deshalb hier das Minimum selbst typisiert.
type Alternative = { transcript: string };
type Result = { 0: Alternative; isFinal: boolean };
type ResultEvent = { resultIndex: number; results: { length: number; [index: number]: Result } };
type ErrorEvent = { error: string };

type WebRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: ResultEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => WebRecognition;

function getCtor(): RecognitionCtor | undefined {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isSpeechSupported(): boolean {
  return getCtor() !== undefined;
}

export const unsupportedReason =
  Platform.OS === 'web'
    ? 'This browser has no speech recognition. Chrome or Safari work best.'
    : 'Voice capture needs the expo-speech-recognition module, which is not installed yet. Type the note instead.';

function messageFor(error: string): string {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'Microphone access was blocked. Allow it in your browser settings and try again.';
  if (error === 'no-speech') return "I didn't catch anything. Try speaking again.";
  if (error === 'audio-capture') return 'No microphone found.';
  if (error === 'network') return 'Speech recognition needs a network connection.';
  return 'Speech recognition stopped unexpectedly. Try again.';
}

export type Recognizer = { start: () => void; stop: () => void };

export type RecognizerHandlers = {
  // final ist der bestätigte Text, interim der noch laufende Zwischenstand.
  onTranscript: (final: string, interim: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
};

export function createRecognizer(handlers: RecognizerHandlers): Recognizer | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;

  let final = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) final += `${result[0].transcript} `;
      else interim += result[0].transcript;
    }
    handlers.onTranscript(final.trim(), interim.trim());
  };

  recognition.onerror = (event) => {
    // Kein Fehler für die Nutzerin: abort/no-speech passieren beim normalen Stoppen.
    if (event.error === 'aborted') return;
    handlers.onError(messageFor(event.error));
  };

  recognition.onend = () => handlers.onEnd();

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}

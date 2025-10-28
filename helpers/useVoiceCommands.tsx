import { useState, useEffect, useRef, useCallback } from "react";

// Type for the SpeechRecognition API, which might be prefixed.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Extend the Window interface to include prefixed versions of SpeechRecognition.
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceCommand =
  | { command: "CREATE_ESTIMATE" }
  | { command: "SEARCH"; params: { query: string } }
  | { command: "FILTER_PAYMENT"; params: { type: "cash" | "card" | "upi" | "credit" | "all" } }
  | { command: "NAVIGATE"; params: { page: string } }
  | { command: "CLEAR_SEARCH" }
  | { command: "UNKNOWN" };

interface UseVoiceCommandsProps {
  onCommand: (command: VoiceCommand) => void;
  language?: string;
}

const commandPatterns = [
  { pattern: /^(create new estimate|new estimate|add estimate)/i, command: "CREATE_ESTIMATE" },
  { pattern: /^(search for|find|search)\s(.+)/i, command: "SEARCH", paramIndex: 2 },
  { pattern: /^show (cash|card|upi|credit|all)/i, command: "FILTER_PAYMENT", paramIndex: 1 },
  { pattern: /^(go to|open) ledger/i, command: "NAVIGATE", page: "/ledger" },
  { pattern: /^(go to|open) dashboard/i, command: "NAVIGATE", page: "/" },
  { pattern: /^(clear search|reset)/i, command: "CLEAR_SEARCH" },
];

const parseTranscript = (transcript: string): VoiceCommand => {
  for (const { pattern, command, paramIndex, page } of commandPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      switch (command) {
        case "CREATE_ESTIMATE":
          return { command: "CREATE_ESTIMATE" };
        case "SEARCH":
          if (paramIndex && match[paramIndex]) {
            return { command: "SEARCH", params: { query: match[paramIndex].trim() } };
          }
          break;
        case "FILTER_PAYMENT":
          if (paramIndex && match[paramIndex]) {
            const type = match[paramIndex].toLowerCase() as "cash" | "card" | "upi" | "credit" | "all";
            return { command: "FILTER_PAYMENT", params: { type } };
          }
          break;
        case "NAVIGATE":
          if (page) {
            return { command: "NAVIGATE", params: { page } };
          }
          break;
        case "CLEAR_SEARCH":
          return { command: "CLEAR_SEARCH" };
      }
    }
  }
  return { command: "UNKNOWN" };
};

export const useVoiceCommands = ({ onCommand, language = "en-IN" }: UseVoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
        const voiceCommand = parseTranscript(finalTranscript.trim());
        if (voiceCommand.command !== "UNKNOWN") {
          onCommand(voiceCommand);
          stopListening();
        }
      } else {
        // Update with interim results for live feedback
        setTranscript(event.results[event.results.length - 1][0].transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    return () => {
      recognition.stop();
    };
  }, [isSupported, language, onCommand]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
        setTranscript("");
      } catch (e) {
        console.error("Could not start recognition", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while starting recognition.");
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    isSupported,
    transcript,
    error,
  };
};
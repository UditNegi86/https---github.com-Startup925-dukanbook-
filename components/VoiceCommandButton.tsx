import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useVoiceCommands, VoiceCommand } from "../helpers/useVoiceCommands";
import { useLanguage } from "../helpers/useLanguage";
import { voiceCommandTranslations } from "../helpers/voiceCommandTranslations";
import { Button } from "./Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import styles from "./VoiceCommandButton.module.css";

interface VoiceCommandButtonProps {
  onCommand: (command: VoiceCommand) => void;
  className?: string;
}

export const VoiceCommandButton = ({ onCommand, className }: VoiceCommandButtonProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { language } = useLanguage();
  
  // Extract voice command translations for current language
  const vt = {
    listening: voiceCommandTranslations.voiceCommand.listening[language],
    notSupported: voiceCommandTranslations.voiceCommand.notSupported[language],
    clickToSpeak: voiceCommandTranslations.voiceCommand.clickToSpeak[language],
    commandRecognized: voiceCommandTranslations.voiceCommand.commandRecognized[language],
    commandNotRecognized: voiceCommandTranslations.voiceCommand.commandNotRecognized[language],
    error: voiceCommandTranslations.voiceCommand.error[language],
  };

  const handleCommand = (command: VoiceCommand) => {
    let feedbackMessage = "";
    switch (command.command) {
      case "CREATE_ESTIMATE":
        feedbackMessage = "Creating a new estimate...";
        break;
      case "SEARCH":
        feedbackMessage = `Searching for "${command.params.query}"...`;
        break;
      case "FILTER_PAYMENT":
        feedbackMessage = `Showing ${command.params.type} payments...`;
        break;
      case "NAVIGATE":
        feedbackMessage = `Navigating to ${command.params.page}...`;
        break;
      case "CLEAR_SEARCH":
        feedbackMessage = "Clearing search...";
        break;
      case "UNKNOWN":
        toast.error(vt.commandNotRecognized);
        return;
    }
    toast.info(feedbackMessage);
    onCommand(command);
    setIsPopoverOpen(false);
  };

  const { isListening, startListening, stopListening, isSupported, transcript, error } = useVoiceCommands({
    onCommand: handleCommand,
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setIsPopoverOpen(false);
    } else {
      startListening();
      setIsPopoverOpen(true);
    }
  };

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className}>
            <Button size="icon-md" disabled>
              <MicOff size={16} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{vt.notSupported}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size="icon-md"
              variant="outline"
              onClick={handleToggleListening}
              className={`${styles.voiceButton} ${isListening ? styles.listening : ""} ${className ?? ""}`}
              aria-label={isListening ? "Stop listening" : "Start voice commands"}
            >
              <Mic size={16} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? vt.listening : vt.clickToSpeak}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        side="bottom"
        align="end"
        className={styles.popoverContent}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className={styles.transcriptContainer}>
          <p className={styles.listeningText}>{isListening ? vt.listening : vt.clickToSpeak}</p>
          <p className={styles.transcript}>{transcript || vt.clickToSpeak}</p>
          {error && <p className={styles.errorText}>{vt.error}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
};
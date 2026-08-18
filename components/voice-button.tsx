import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity } from "react-native";

import { trpc } from "@/lib/trpc";

export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcribe = trpc.assistant.transcribe.useMutation();

  const start = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Voice capture", "Voice recording is available in the installed Android build.");
      return;
    }
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Microphone permission needed", "Enable microphone access if you want Atlas to transcribe a voice clip.");
      return;
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert("Recording couldn't start", "Try again after checking microphone permissions.");
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("Recording file was unavailable");
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || ("size" in info && (info.size ?? 0) > 6 * 1024 * 1024)) {
        throw new Error("Recording is too large");
      }
      setIsTranscribing(true);
      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const result = await transcribe.mutateAsync({ audioBase64, mimeType: "audio/m4a" });
      onTranscript(result.text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please record a shorter clip and try again.";
      Alert.alert("Transcription unavailable", message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const isBusy = isTranscribing || transcribe.isPending;
  return (
    <TouchableOpacity
      style={[styles.button, recorderState.isRecording && styles.recording, isBusy && styles.busy]}
      onPress={recorderState.isRecording ? stop : start}
      disabled={isBusy}
      accessibilityLabel={recorderState.isRecording ? "Stop recording and transcribe" : "Start voice recording"}
      activeOpacity={0.75}
    >
      <MaterialIcons name={recorderState.isRecording ? "stop" : "mic"} size={19} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "#14213D", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  recording: { backgroundColor: "#E85D5D" },
  busy: { backgroundColor: "#94A3B8" },
});

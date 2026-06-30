import { audioManager } from "./audioManager";

// Adapter lines mapping old sound calls directly into our Upgraded, Premium, Sci-Fi sound identity:
export function playSystemClick() {
  audioManager.playButtonPrimary();
}

export function playSystemDing() {
  audioManager.playNotificationSystem();
}

export function playSystemQuestComplete() {
  audioManager.playQuestCompleted();
}

export function playSystemLevelUp() {
  audioManager.playRankAdvancement();
}

export function playSystemError() {
  audioManager.playWarningMinor();
}

export function playEmergencyAlarm() {
  audioManager.playWarningCritical();
}

export function playPortalSwoosh() {
  audioManager.playEvolutionEnter();
}

export function playModalOpen() {
  audioManager.playModalOpen();
}

export function playModalClose() {
  audioManager.playModalClose();
}

export function playDrillSuccess() {
  audioManager.playDrillSuccess();
}

export function playDrillFailure() {
  audioManager.playDrillFailure();
}

export function playSimulationRun() {
  audioManager.playSimulationRun();
}

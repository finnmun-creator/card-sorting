import { nanoid } from 'nanoid';

const DEVICE_KEY = 'card-sorting-device';

interface DeviceInfo {
  id: string;
  nickname: string;
}

export function getDevice(): DeviceInfo | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(DEVICE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveDevice(nickname: string): DeviceInfo {
  const existing = getDevice();
  const device: DeviceInfo = {
    id: existing?.id || nanoid(12),
    nickname,
  };
  localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
  return device;
}

export function updateNickname(nickname: string): DeviceInfo {
  return saveDevice(nickname);
}

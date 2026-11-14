import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { UpgradeId } from '../types';
import { getFirebaseDb } from './firebase';

export interface CloudProgress {
  bestScore: number;
  currency: number;
  ownedUpgrades: UpgradeId[];
}

// Mirrors the local-storage pattern in storage.ts: every call is wrapped so
// a network hiccup or a Firestore outage degrades to local-only instead of
// breaking play. Callers only reach these when firebaseConfigured is true.
export async function fetchCloudProgress(uid: string): Promise<CloudProgress | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), 'players', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
      currency: typeof data.currency === 'number' ? data.currency : 0,
      ownedUpgrades: Array.isArray(data.ownedUpgrades) ? data.ownedUpgrades : [],
    };
  } catch {
    return null;
  }
}

export async function pushCloudProgress(uid: string, progress: CloudProgress): Promise<void> {
  try {
    await setDoc(doc(getFirebaseDb(), 'players', uid), { ...progress, updatedAt: serverTimestamp() });
  } catch {
    // ignore — this device's local save already has the progress; the
    // cloud mirror just stays stale until the next successful push
  }
}

export type AuthSyncMessage = { type: 'login' } | { type: 'logout' };

type AuthSyncListener = (message: AuthSyncMessage) => void;

const CHANNEL_NAME = 'saan-auth-sync';

let channel: BroadcastChannel | null = null;
const listeners = new Set<AuthSyncListener>();

function attachChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<AuthSyncMessage>) => {
      const message = event.data;
      if (message?.type !== 'login' && message?.type !== 'logout') {
        return;
      }

      listeners.forEach((listener) => listener(message));
    };
  }

  return channel;
}

/** Whether this browser can sync auth state across tabs. */
export function isAuthSyncSupported(): boolean {
  return typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined';
}

export function broadcastAuthSync(message: AuthSyncMessage): void {
  const activeChannel = attachChannel();
  if (!activeChannel) {
    return;
  }

  try {
    activeChannel.postMessage(message);
  } catch {
    // Channel may be closed; sync is best-effort in unsupported or edge cases.
  }
}

/** Subscribe to cross-tab auth events. Returns an unsubscribe function. */
export function subscribeToAuthSync(listener: AuthSyncListener): () => void {
  attachChannel();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

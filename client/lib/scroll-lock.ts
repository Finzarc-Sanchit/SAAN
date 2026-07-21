type ScrollLockListener = (locked: boolean) => void;

let lockCount = 0;
let savedScrollY = 0;
const listeners = new Set<ScrollLockListener>();

function notifyListeners(locked: boolean) {
  listeners.forEach((listener) => listener(locked));
}

function applyBodyLock() {
  savedScrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function releaseBodyLock() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.documentElement.style.overflow = '';

  window.scrollTo(0, savedScrollY);
}

export function lockPageScroll() {
  if (lockCount === 0) {
    applyBodyLock();
    notifyListeners(true);
  }

  lockCount += 1;
}

export function unlockPageScroll() {
  if (lockCount === 0) return;

  lockCount -= 1;

  if (lockCount === 0) {
    releaseBodyLock();
    notifyListeners(false);
  }
}

export function onPageScrollLockChange(listener: ScrollLockListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

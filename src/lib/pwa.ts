export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function getDeviceInfo() {
  if (typeof window === "undefined") {
    return {
      isPWA: false,
      platform: "unknown" as const,
      browser: "unknown" as const,
      screenWidth: 0,
      screenHeight: 0,
      userAgent: "",
    };
  }

  const ua = navigator.userAgent;

  let platform: "ios" | "android" | "desktop" = "desktop";
  if (/iPhone|iPad|iPod/.test(ua)) {
    platform = "ios";
  } else if (/Android/.test(ua)) {
    platform = "android";
  }

  let browser: "safari" | "chrome" | "firefox" | "edge" | "other" = "other";
  if (/Edg/.test(ua)) {
    browser = "edge";
  } else if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
    browser = "chrome";
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = "safari";
  } else if (/Firefox/.test(ua)) {
    browser = "firefox";
  }

  return {
    isPWA: isPWA(),
    platform,
    browser,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: ua,
  };
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}

export type DeviceInfo = ReturnType<typeof getDeviceInfo>;

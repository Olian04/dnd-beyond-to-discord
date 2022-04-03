export const useFeature = <K extends keyof typeof chrome>(key: K): (typeof chrome)[K] => {
  try {
    if (chrome[key]) {
      return chrome[key];
    }
  } catch {}
  try {
    //@ts-ignore
    if (browser[key]) {
      //@ts-ignore
      return browser[key];
    }
  } catch {}
  try {
    //@ts-ignore
    if (window[key]) {
      //@ts-ignore
      return window[key];
    }
  } catch {}
}
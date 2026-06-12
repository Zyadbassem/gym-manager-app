/**This function checks if the qr was generated more than x hours ago */
export const qrChecker = (hours: number, qrTime: number) => {
  const currentTime = Date.now();
  const HOURS_IN_MS = hours * 60 * 60 * 1000;

  if (currentTime - qrTime > HOURS_IN_MS) return true;
  else return false;
};

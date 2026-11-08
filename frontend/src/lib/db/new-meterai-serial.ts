/* Simulated e-meterai serial number. Call it from an event handler, never while rendering (it is random). */
export const newMeteraiSerial = () => `SIM-10000-${String(Math.floor(1000 + Math.random() * 9000))}`

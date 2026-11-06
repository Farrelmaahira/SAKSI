export function passwordStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) s++
  if (pw.length >= 12 || /[^a-zA-Z0-9]/.test(pw)) s++
  return s
}

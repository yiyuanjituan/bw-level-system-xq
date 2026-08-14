const INVITE_CODE_STORAGE_KEY = "YG_PREFIX_invite_code";

function normalizeInviteCode(value: unknown) {
  const inviteCode = Array.isArray(value) ? value[0] : value;
  return typeof inviteCode === "string" ? inviteCode.trim() : "";
}

export function saveInviteCode(value: unknown) {
  const inviteCode = normalizeInviteCode(value);
  if (!inviteCode) return;

  window.localStorage.setItem(INVITE_CODE_STORAGE_KEY, inviteCode);
}

export function getStoredInviteCode() {
  return normalizeInviteCode(window.localStorage.getItem(INVITE_CODE_STORAGE_KEY));
}

export function clearStoredInviteCode() {
  window.localStorage.removeItem(INVITE_CODE_STORAGE_KEY);
}

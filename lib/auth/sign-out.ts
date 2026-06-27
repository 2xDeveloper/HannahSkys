/** Navigate to server sign-out — avoids client signOut() hanging on "Logging out…". */
export function signOutAndRedirect(redirectTo = "/") {
  const next = encodeURIComponent(redirectTo);
  window.location.assign(`/auth/signout?next=${next}`);
}

/* global __APP_BUILD_ID__ */

function getVersionUrl() {
  const url = new URL('version.json', window.location.href);
  url.searchParams.set('t', String(Date.now()));
  return url.toString();
}

export async function checkForUiUpdate() {
  try {
    const currentBuildId = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : null;
    if (!currentBuildId) return;

    const res = await fetch(getVersionUrl(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    const remoteBuildId = data?.buildId;
    if (!remoteBuildId || remoteBuildId === currentBuildId) return;

    const reloadedTo = sessionStorage.getItem('vsg-reloaded-to-build');
    if (reloadedTo === remoteBuildId) return;
    sessionStorage.setItem('vsg-reloaded-to-build', remoteBuildId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('v', remoteBuildId);
    window.location.replace(nextUrl.toString());
  } catch {
    // ignore update check errors
  }
}


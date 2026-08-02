/**
 * Portfolio Return Banner Component (Vanilla JS)
 * Displays a top banner when visitors navigate from Haven Hamelin's portfolio site
 * or when query params like ?from=portfolio or ?ref=portfolio are present.
 */

export function initPortfolioBanner() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const search = (window.location.search || "").toLowerCase();
  const href = (window.location.href || "").toLowerCase();

  const fromParam =
    urlParams.get("from") === "portfolio" ||
    urlParams.get("ref") === "portfolio" ||
    search.includes("from=portfolio") ||
    search.includes("ref=portfolio") ||
    href.includes("from=portfolio") ||
    href.includes("ref=portfolio");

  const referrer = (document.referrer || "").toLowerCase();
  const host = (window.location.host || "").toLowerCase();

  const isInternalReferrer =
    referrer &&
    (referrer.includes(host) ||
      (referrer.includes("projects.havenhamelin.work") && (host.includes("wasworld.xyz") || host.includes("vercel.app"))) ||
      ((referrer.includes("wasworld.xyz") || referrer.includes("vercel.app")) && host.includes("projects.havenhamelin.work")));

  const fromReferrer =
    !isInternalReferrer &&
    (referrer.includes("havenhamelin.work") ||
      referrer.includes("portfolio") ||
      (referrer.includes("localhost") && !isInternalReferrer) ||
      (referrer.includes("127.0.0.1") && !isInternalReferrer));

  const navEntry =
    typeof performance !== "undefined" && performance.getEntriesByType
      ? performance.getEntriesByType("navigation")[0]
      : undefined;
  const isReload = navEntry?.type === "reload";

  if (fromReferrer || (fromParam && !isInternalReferrer)) {
    sessionStorage.setItem("from_portfolio", "true");
    if (!isReload) {
      sessionStorage.removeItem("from_portfolio_dismissed");
    }
    if (fromReferrer) {
      sessionStorage.setItem("portfolio_url", document.referrer);
    }
  } else if (!isInternalReferrer && !fromParam) {
    sessionStorage.removeItem("from_portfolio");
  }

  const isDismissed =
    urlParams.get("dismiss_portfolio_banner") === "1" ||
    sessionStorage.getItem("from_portfolio_dismissed") === "true";

  if (isDismissed) return;

  const isFromPortfolio = sessionStorage.getItem("from_portfolio") === "true";
  if (!isFromPortfolio) return;

  let portfolioUrl = "https://havenhamelin.work";
  const storedUrl = sessionStorage.getItem("portfolio_url");
  if (storedUrl && !storedUrl.includes("projects.havenhamelin.work")) {
    portfolioUrl = storedUrl;
  }

  renderBanner(portfolioUrl);
}

function renderBanner(portfolioUrl) {
  if (document.getElementById("portfolioReturnBanner")) return;

  const banner = document.createElement("div");
  banner.id = "portfolioReturnBanner";
  banner.style.cssText = `
    display: block;
    background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    border-bottom: 2px solid #38bdf8;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.4);
    color: #f8fafc;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 8px 16px;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    z-index: 999999;
  `;

  banner.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 8px 12px; flex-wrap: wrap; position: relative; padding-right: 32px;">
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #e2e8f0; flex-wrap: wrap; flex: 1 1 auto;">
        <span style="background: #0284c7; color: #ffffff; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 20px; display: inline-block; white-space: nowrap; flex-shrink: 0;">
          Portfolio Demo
        </span>
        <span style="line-height: 1.4;">
          You are currently viewing a live demo project by <strong>Haven Hamelin</strong>.
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
        <a href="${portfolioUrl}" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid #38bdf8; padding: 5px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none; white-space: nowrap; transition: all 0.2s ease;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Portfolio
        </a>
      </div>
      <button type="button" id="portfolioBannerDismissBtn" aria-label="Dismiss banner" style="position: absolute; right: 0; top: 2px; background: transparent; border: none; color: #94a3b8; font-size: 1.4rem; line-height: 1; cursor: pointer; padding: 4px 6px;">
        &times;
      </button>
    </div>
  `;

  document.body.prepend(banner);

  document.getElementById("portfolioBannerDismissBtn")?.addEventListener("click", () => {
    banner.remove();
    sessionStorage.setItem("from_portfolio_dismissed", "true");
    sessionStorage.removeItem("from_portfolio");
  });
}

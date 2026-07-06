(function () {
  const NAV_ITEMS = [
    { label: "Research", href: "/research.html" },
    { label: "About", href: "/about.html" },
    { label: "AI Matrix Live", href: "https://aimatrixlive.com", external: true },
    { label: "Grey Swan", href: "/grey-swan.html" },
    { label: "Work Rebundler", href: "/work-rebundler.html" },
    { label: "Task Risk Atlas", href: "/task-risk-atlas.html" },
    { label: "AI-OS Examples", href: "/ai-os/" },
    { label: "ARC", href: "/arc/" },
    { label: "FARABI Audit", href: "/farabi-audit.html" },
    { label: "The Virtuous City", href: "/essay.html" },
    { label: "Contact", href: "/#contact" }
  ];

  const FOOTER_LINKS = [
    { label: "Research", href: "/research.html" },
    { label: "About", href: "/about.html" },
    { label: "ARC", href: "/arc/" },
    { label: "FARABI Audit", href: "/farabi-audit.html" },
    { label: "Work Rebundler", href: "/work-rebundler.html" },
    { label: "Task Risk Atlas", href: "/task-risk-atlas.html" },
    { label: "Grey Swan", href: "/grey-swan.html" },
    { label: "Contact", href: "/#contact" }
  ];

  function canonicalPath(path) {
    if (!path) return "/";
    let clean = path.replace(/\/index\.html$/, "/");
    clean = clean.replace(/\.html$/, "");
    if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
    return clean || "/";
  }

  function isActiveLink(href) {
    const currentPath = canonicalPath(window.location.pathname);
    const link = new URL(href, window.location.origin);

    if (link.origin !== window.location.origin) return false;

    const linkPath = canonicalPath(link.pathname);

    if (linkPath === "/arc") {
      return currentPath === "/arc" || currentPath.startsWith("/arc/");
    }

    if (linkPath === "/ai-os") {
      return currentPath === "/ai-os" || currentPath.startsWith("/ai-os/");
    }

    if (linkPath === "/" && link.hash) {
      return currentPath === "/" && window.location.hash === link.hash;
    }

    return currentPath === linkPath;
  }

  function createLink(item) {
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;

    if (item.external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }

    if (isActiveLink(item.href)) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }

    return a;
  }

  function buildNav() {
    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Main navigation");

    const name = document.createElement("a");
    name.className = "nav-name";
    name.href = "/";
    name.textContent = "Ewan Simpson";

    const links = document.createElement("div");
    links.className = "nav-links";

    NAV_ITEMS.forEach((item) => {
      links.appendChild(createLink(item));
    });

    nav.appendChild(name);
    nav.appendChild(links);

    return nav;
  }

  function buildFooter() {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.setAttribute("aria-label", "Site footer");

    const year = new Date().getFullYear();

    footer.innerHTML = `
      <div class="site-footer-inner">
        <div class="site-footer-identity">
          <a class="footer-name" href="/">Ewan Simpson, PhD</a>
          <p>Higher education strategist and AI governance researcher · Narxoz Business School, Almaty</p>
        </div>

        <div class="site-footer-links" aria-label="Footer navigation">
          ${FOOTER_LINKS.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
        </div>

        <div class="site-footer-contact">
          <span>© ${year} Ewan Simpson</span>
          <span>ewansimpson.org</span>
          <a href="mailto:ewan@ewansimpson.org">ewan@ewansimpson.org</a>
        </div>
      </div>
    `;

    return footer;
  }

  function injectStyles() {
    if (document.getElementById("site-nav-footer-styles")) return;

    const style = document.createElement("style");
    style.id = "site-nav-footer-styles";

    style.textContent = `
      .site-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(250, 250, 248, 0.96);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--rule, var(--line, #e6e0d8));
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 60px;
        height: auto;
        gap: 24px;
      }

      .nav-name {
        font-family: var(--serif, Georgia, "Times New Roman", serif);
        font-size: 17px;
        font-weight: 600;
        color: var(--accent, #1A3A5C);
        text-decoration: none;
        white-space: nowrap;
      }

      .nav-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 18px;
      }

      .nav-links a {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mid, var(--muted, #5f5a55));
        text-decoration: none;
        transition: color 0.2s ease;
        white-space: nowrap;
      }

      .nav-links a:hover,
      .nav-links a.active {
        color: var(--accent, #1A3A5C);
      }

      .site-footer {
        margin-top: 72px;
        border-top: 1px solid var(--rule, var(--line, #e6e0d8));
        background: rgba(250, 250, 248, 0.96);
        color: var(--mid, var(--muted, #5f5a55));
        padding: 32px 40px;
      }

      .site-footer-inner {
        max-width: 1180px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(220px, 1.4fr) minmax(260px, 2fr);
        gap: 24px 48px;
        align-items: start;
      }

      .site-footer-identity {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .footer-name {
        font-family: var(--serif, Georgia, "Times New Roman", serif);
        font-size: 17px;
        font-weight: 600;
        color: var(--accent, #1A3A5C);
        text-decoration: none;
      }

      .site-footer-identity p {
        margin: 0;
        font-size: 13px;
        line-height: 1.55;
        color: var(--mid, var(--muted, #5f5a55));
      }

      .site-footer-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px 18px;
      }

      .site-footer-links a,
      .site-footer-contact a {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--mid, var(--muted, #5f5a55));
        text-decoration: none;
      }

      .site-footer-links a:hover,
      .site-footer-contact a:hover {
        color: var(--accent, #1A3A5C);
      }

      .site-footer-contact {
        grid-column: 1 / -1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        padding-top: 12px;
        border-top: 1px solid var(--rule, var(--line, #e6e0d8));
        font-size: 12px;
        color: var(--mid, var(--muted, #5f5a55));
      }

      @media (max-width: 900px) {
        .site-nav {
          padding: 12px 20px;
          align-items: flex-start;
          flex-direction: column;
          gap: 8px;
        }

        .nav-links {
          justify-content: flex-start;
          gap: 12px 16px;
        }

        .nav-links a {
          font-size: 11px;
        }

        .site-footer {
          padding: 28px 20px;
        }

        .site-footer-inner {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .site-footer-links {
          justify-content: flex-start;
        }

        .site-footer-contact {
          padding-top: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function findExistingFooter() {
    const explicitFooter = document.querySelector("footer.site-footer") || document.querySelector("footer");
    if (explicitFooter) return explicitFooter;

    const candidates = Array.from(document.body.querySelectorAll("p, div, small"));

    return candidates.reverse().find((element) => {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      return text.includes("© 2026 Ewan Simpson") && text.length < 300;
    });
  }

  function installNav() {
    const newNav = buildNav();

    const existingNav =
      document.querySelector("nav.site-nav") ||
      document.querySelector("nav[aria-label='Main navigation']") ||
      document.querySelector("nav");

    if (existingNav) {
      existingNav.replaceWith(newNav);
    } else {
      document.body.prepend(newNav);
    }
  }

  function installFooter() {
    const newFooter = buildFooter();
    const existingFooter = findExistingFooter();

    if (existingFooter) {
      existingFooter.replaceWith(newFooter);
    } else {
      document.body.appendChild(newFooter);
    }
  }

  function installSiteFrame() {
    injectStyles();
    installNav();
    installFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSiteFrame);
  } else {
    installSiteFrame();
  }
})();

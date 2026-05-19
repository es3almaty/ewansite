(function () {
  const NAV_ITEMS = [
    { label: "Research", href: "/#research" },
    { label: "About", href: "/about.html" },
    { label: "AI Matrix Live", href: "/#ai-matrix-live" },
    { label: "Grey Swan", href: "/grey-swan.html" },
    { label: "Work Rebundler", href: "/work-rebundler.html" },
    { label: "AI-OS Examples", href: "/ai-os/" },
    { label: "ARC", href: "/arc/" },
    { label: "FARABI Audit", href: "/farabi-audit.html", highlight: true },
    { label: "The Virtuous City", href: "/essay.html" },
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
    const linkPath = canonicalPath(link.pathname);

    if (linkPath === "/arc") {
      return currentPath === "/arc" || currentPath.startsWith("/arc/");
    }

    if (linkPath === "/" && link.hash) {
      return currentPath === "/" && window.location.hash === link.hash;
    }

    return currentPath === linkPath;
  }

  function buildNav() {
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Main navigation");

    const name = document.createElement("a");
    name.className = "nav-name";
    name.href = "/";
    name.textContent = "Ewan Simpson";

    const links = document.createElement("div");
    links.className = "nav-links";

    NAV_ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;

      if (item.highlight) {
        a.classList.add("nav-highlight");
      }

      if (isActiveLink(item.href)) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }

      links.appendChild(a);
    });

    nav.appendChild(name);
    nav.appendChild(links);
    return nav;
  }

  function injectStyles() {
    if (document.getElementById("site-nav-styles")) return;

    const style = document.createElement("style");
    style.id = "site-nav-styles";
    style.textContent = `
      nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(250,250,248,0.96);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--rule, #e6e0d8);
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 60px;
        height: auto;
        gap: 24px;
      }

      .nav-name {
        font-family: var(--serif, Georgia, serif);
        font-size: 17px;
        font-weight: 600;
        color: var(--accent, #6b1f1f);
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
        color: var(--mid, #5f5a55);
        text-decoration: none;
        transition: color 0.2s;
        white-space: nowrap;
      }

      .nav-links a:hover,
      .nav-links a.active {
        color: var(--accent, #6b1f1f);
      }

      .nav-links a.nav-highlight {
        color: var(--gold, #b08a3c);
      }

      .nav-links a.nav-highlight:hover,
      .nav-links a.nav-highlight.active {
        color: var(--accent, #6b1f1f);
      }

      @media (max-width: 760px) {
        nav {
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
      }
    `;

    document.head.appendChild(style);
  }

  function installNav() {
    injectStyles();
    const newNav = buildNav();
    const existingNav = document.querySelector("nav");

    if (existingNav) {
      existingNav.replaceWith(newNav);
    } else {
      document.body.prepend(newNav);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installNav);
  } else {
    installNav();
  }
})();

// occupation-atlas.js
// AI-OS Occupation Atlas public renderer

(function () {
  const BUNDLES = [
    {
      id: "data-document",
      name: "Data and document handling",
      signal:
        "Routine information capture, checking, formatting, filing, extraction, record maintenance, and document preparation.",
      keywords: [
        "record",
        "records",
        "data",
        "documentation",
        "document",
        "documents",
        "file",
        "files",
        "extract",
        "enter",
        "maintain",
        "invoice",
        "receipts",
        "evidence",
        "schedule",
        "statements"
      ]
    },
    {
      id: "routine-analysis",
      name: "Routine analysis and reporting",
      signal:
        "Standard comparison, summarization, calculation, dashboarding, reporting, drafting, monitoring, and trend description.",
      keywords: [
        "report",
        "reports",
        "analyze",
        "analyse",
        "analysis",
        "monitor",
        "variance",
        "forecast",
        "budget",
        "summar",
        "compare",
        "campaign data",
        "conversion"
      ]
    },
    {
      id: "coordination",
      name: "Coordination and workflow control",
      signal:
        "Chasing, routing, scheduling, collecting inputs, coordinating people or departments, and keeping processes moving.",
      keywords: [
        "coordinate",
        "coordinat",
        "schedule",
        "workflow",
        "liaise",
        "communication",
        "stakeholder",
        "approval",
        "meeting",
        "agency",
        "faculty",
        "students",
        "underwriters"
      ]
    },
    {
      id: "judgment",
      name: "Judgment and interpretation",
      signal:
        "Meaning-making, prioritization, interpretation, advice, decision support, and handling uncertainty.",
      keywords: [
        "advise",
        "interpret",
        "decision",
        "decisions",
        "evaluate",
        "assess",
        "recommend",
        "recommendations",
        "scenario",
        "planning",
        "risk",
        "implications",
        "strategy"
      ]
    },
    {
      id: "relationship",
      name: "Relationship and trust work",
      signal:
        "Human communication where trust, persuasion, reassurance, negotiation, or sensitive context matters.",
      keywords: [
        "client",
        "clients",
        "employee",
        "employees",
        "student",
        "students",
        "explain",
        "complaint",
        "complaints",
        "dispute",
        "persuade",
        "negotiate",
        "relations",
        "outreach"
      ]
    },
    {
      id: "governance-proof",
      name: "Governance, proof, and accountability",
      signal:
        "Approvals, audit trails, compliance, evidence, controls, sign-off, quality assurance, regulation, and defensibility.",
      keywords: [
        "compliance",
        "audit",
        "approval",
        "approve",
        "evidence",
        "control",
        "controls",
        "regulatory",
        "policy",
        "policies",
        "law",
        "quality assurance",
        "accreditation",
        "disclosure",
        "attestation"
      ]
    },
    {
      id: "exception",
      name: "Exception handling",
      signal:
        "Unusual, ambiguous, disputed, high-risk, urgent, or failed cases that require escalation or special handling.",
      keywords: [
        "exception",
        "exceptions",
        "escalate",
        "escalation",
        "unusual",
        "sensitive",
        "high-risk",
        "complaint",
        "breach",
        "incident",
        "resolve",
        "failure",
        "urgent",
        "discrepanc",
        "missing"
      ]
    }
  ];

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char]));
  }

  function classifyTask(task) {
    const t = normalize(task);

    const scores = BUNDLES.map(bundle => ({
      ...bundle,
      score: bundle.keywords.reduce(
        (acc, word) => acc + (t.includes(word) ? 1 : 0),
        0
      )
    })).sort((a, b) => b.score - a.score);

    if (scores[0].score === 0) return BUNDLES[1];

    return scores[0];
  }

  function level(score) {
    if (score >= 0.55) return "Very high";
    if (score >= 0.38) return "High";
    if (score >= 0.22) return "Moderate";
    return "Low";
  }

  function futureDirections(bundles) {
    const present = new Set(bundles.map(b => b.id));
    const directions = [];

    if (present.has("data-document")) {
      directions.push([
        "Data/document producer",
        "Workflow controller and data quality steward"
      ]);
    }

    if (present.has("routine-analysis")) {
      directions.push([
        "Routine report producer",
        "Insight validator and scenario briefer"
      ]);
    }

    if (present.has("coordination")) {
      directions.push([
        "Process coordinator",
        "Human-AI workflow orchestrator"
      ]);
    }

    if (present.has("judgment")) {
      directions.push([
        "General decision support",
        "Accountable judgment partner"
      ]);
    }

    if (present.has("relationship")) {
      directions.push([
        "Service communicator",
        "Trust and relationship lead"
      ]);
    }

    if (present.has("governance-proof")) {
      directions.push([
        "Compliance/documentation administrator",
        "Proof and controls steward"
      ]);
    }

    if (present.has("exception")) {
      directions.push([
        "Issue resolver",
        "Exception handler and escalation lead"
      ]);
    }

    return directions.slice(0, 6);
  }

  function buildProfile(occupation) {
    const sourceTasks = Array.isArray(occupation.tasks) ? occupation.tasks : [];

    const tasks = sourceTasks.map((task, index) => {
      const bundle = classifyTask(task);

      return {
        id: `${occupation.id}-task-${index + 1}`,
        task,
        bundleId: bundle.id,
        bundleName: bundle.name
      };
    });

    const bundles = BUNDLES.map(bundle => {
      const bundleTasks = tasks.filter(t => t.bundleId === bundle.id);
      return { ...bundle, tasks: bundleTasks };
    }).filter(bundle => bundle.tasks.length > 0);

    const total = tasks.length || 1;
    const bundleCount = id => tasks.filter(t => t.bundleId === id).length;

    const compressible =
      bundleCount("data-document") +
      bundleCount("routine-analysis") +
      Math.round(bundleCount("coordination") * 0.5);

    const humanResidual =
      bundleCount("judgment") +
      bundleCount("relationship") +
      bundleCount("exception") +
      Math.round(bundleCount("governance-proof") * 0.5);

    const proof =
      bundleCount("governance-proof") +
      Math.round(bundleCount("exception") * 0.5);

    const augmentation =
      bundleCount("routine-analysis") +
      bundleCount("judgment") +
      bundleCount("coordination") +
      bundleCount("relationship");

    return {
      occupation,
      tasks,
      bundles,
      ratings: {
        compression: level(compressible / total),
        humanResidual: level(humanResidual / total),
        proofBurden: level(proof / total),
        rebundlingUrgency: level(
          (compressible + proof + humanResidual) / (total * 1.6)
        ),
        augmentation: level(augmentation / total)
      },
      futureDirections: futureDirections(bundles)
    };
  }

  function searchOccupations(query) {
    const q = normalize(query);
    const data = window.AIOS_OCCUPATIONS || [];

    if (!q) return data;

    return data.filter(o => {
      const haystack = [
        o.title,
        o.summary,
        ...(o.aliases || []),
        ...(o.tasks || [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  function badgeClass(value) {
    return "rating " + String(value || "").toLowerCase().replace(/\s+/g, "-");
  }

  function safeFileName(value) {
    return String(value || "occupation-profile")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function loadHtml2Pdf() {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
        return;
      }

      const existing = document.querySelector("script[data-html2pdf]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.html2pdf));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.setAttribute("data-html2pdf", "true");
      script.onload = () => resolve(window.html2pdf);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function downloadArcPdf(profile) {
    const fileName = `ARC-AIOS-${safeFileName(profile.occupation.title)}.pdf`;

    const report = document.createElement("div");
    report.style.width = "760px";
    report.style.padding = "34px";
    report.style.background = "#fffaf2";
    report.style.color = "#1f1b16";
    report.style.fontFamily = "Georgia, 'Times New Roman', serif";
    report.style.lineHeight = "1.45";

    report.innerHTML = `
      <div style="border-bottom: 4px solid #7b1f24; padding-bottom: 14px; margin-bottom: 22px;">
        <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #7b1f24; font-weight: bold;">
          ARC · AI-OS Occupation Atlas
        </div>
        <h1 style="font-size: 30px; margin: 8px 0 6px;">
          ${escapeHtml(profile.occupation.title)}
        </h1>
        <p style="font-size: 15px; color: #6f665c; margin: 0;">
          Public occupation profile · Representative task-level analysis
        </p>
      </div>

      <h2 style="font-size: 20px; color: #7b1f24;">Role summary</h2>
      <p>${escapeHtml(profile.occupation.summary)}</p>

      <div style="background: #efe6d8; padding: 14px; border-radius: 12px; margin: 18px 0;">
        <strong>Public profile depth:</strong>
        This profile shows eight representative tasks and a high-level AI-OS interpretation.
        A full AI-OS analysis goes deeper into validated task registers, permitted AI modes,
        Decision Compass governance scoring, proof burden, residual effort, and role rebundling.
      </div>

      <h2 style="font-size: 20px; color: #7b1f24;">Core task breakdown</h2>
      <ol>
        ${profile.tasks
          .map(
            t => `
              <li style="margin-bottom: 8px;">
                ${escapeHtml(t.task)}
                <br>
                <span style="color: #7b1f24; font-size: 13px;">
                  ${escapeHtml(t.bundleName)}
                </span>
              </li>
            `
          )
          .join("")}
      </ol>

      <h2 style="font-size: 20px; color: #7b1f24;">High-level AI-OS ratings</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          <tr>
            <td style="border: 1px solid #ded4c6; padding: 9px;">AI compression potential</td>
            <td style="border: 1px solid #ded4c6; padding: 9px;"><strong>${escapeHtml(profile.ratings.compression)}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ded4c6; padding: 9px;">Human residual strength</td>
            <td style="border: 1px solid #ded4c6; padding: 9px;"><strong>${escapeHtml(profile.ratings.humanResidual)}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ded4c6; padding: 9px;">Proof/governance burden</td>
            <td style="border: 1px solid #ded4c6; padding: 9px;"><strong>${escapeHtml(profile.ratings.proofBurden)}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ded4c6; padding: 9px;">Rebundling urgency</td>
            <td style="border: 1px solid #ded4c6; padding: 9px;"><strong>${escapeHtml(profile.ratings.rebundlingUrgency)}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ded4c6; padding: 9px;">Augmentation potential</td>
            <td style="border: 1px solid #ded4c6; padding: 9px;"><strong>${escapeHtml(profile.ratings.augmentation)}</strong></td>
          </tr>
        </tbody>
      </table>

      <h2 style="font-size: 20px; color: #7b1f24;">Future role direction</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ded4c6; padding: 9px; background: #efe6d8;">Current emphasis</th>
            <th style="border: 1px solid #ded4c6; padding: 9px; background: #efe6d8;">Likely AI-era direction</th>
          </tr>
        </thead>
        <tbody>
          ${profile.futureDirections
            .map(
              row => `
                <tr>
                  <td style="border: 1px solid #ded4c6; padding: 9px;">${escapeHtml(row[0])}</td>
                  <td style="border: 1px solid #ded4c6; padding: 9px;">${escapeHtml(row[1])}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>

      <div style="margin-top: 26px; padding-top: 12px; border-top: 1px solid #ded4c6; color: #6f665c; font-size: 12px;">
        © 2026 Ewan Simpson · ARC / AI-OS public demonstrator · ewansimpson.org
      </div>
    `;

    document.body.appendChild(report);

    loadHtml2Pdf()
      .then(html2pdf => {
        const options = {
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        return html2pdf().set(options).from(report).save();
      })
      .then(() => {
        report.remove();
      })
      .catch(() => {
        report.remove();
        alert("PDF download failed. Please refresh and try again.");
      });
  }

  function renderResultList(results) {
    const list = document.getElementById("occupation-results");
    if (!list) return;

    if (!results.length) {
      list.innerHTML = `
        <p class="muted">
          No matching public occupation found. Use the custom job-description tool for a role-specific analysis.
        </p>
      `;
      return;
    }

    list.innerHTML = results
      .map(
        o => `
          <button class="result-card" type="button" data-id="${escapeHtml(o.id)}">
            <strong>${escapeHtml(o.title)}</strong>
            <span>${escapeHtml(o.summary)}</span>
          </button>
        `
      )
      .join("");

    list.querySelectorAll("button[data-id]").forEach(button => {
      button.addEventListener("click", () => {
        renderProfile(button.dataset.id);
      });
    });
  }

  function renderProfile(id) {
    const occupation = (window.AIOS_OCCUPATIONS || []).find(o => o.id === id);
    if (!occupation) return;

    const profile = buildProfile(occupation);
    const container = document.getElementById("occupation-profile");
    if (!container) return;

    container.innerHTML = `
      <article class="panel">
        <p class="eyebrow">Occupation profile</p>
        <h2>${escapeHtml(profile.occupation.title)}</h2>
        <p>${escapeHtml(profile.occupation.summary)}</p>

        <p class="source-note">
          Source: ${escapeHtml(
            profile.occupation.source || "Curated public AI-OS profile"
          )}.
          Public profiles show representative tasks only. Full AI-OS analysis goes deeper.
        </p>

        <h3>Core task breakdown</h3>
        <ol class="task-list">
          ${profile.tasks
            .map(
              t => `
                <li>
                  <span>${escapeHtml(t.task)}</span>
                  <em>${escapeHtml(t.bundleName)}</em>
                </li>
              `
            )
            .join("")}
        </ol>

        <h3>Task bundles</h3>
        <div class="bundle-grid">
          ${profile.bundles
            .map(
              bundle => `
                <div class="bundle-card">
                  <strong>${escapeHtml(bundle.name)}</strong>
                  <p>${escapeHtml(bundle.signal)}</p>
                  <p>${bundle.tasks.length} task${
                bundle.tasks.length === 1 ? "" : "s"
              }</p>
                </div>
              `
            )
            .join("")}
        </div>

        <h3>High-level AI-OS rating</h3>
        <div class="ratings-grid">
          ${Object.entries({
            "AI compression potential": profile.ratings.compression,
            "Human residual strength": profile.ratings.humanResidual,
            "Proof/governance burden": profile.ratings.proofBurden,
            "Rebundling urgency": profile.ratings.rebundlingUrgency,
            "Augmentation potential": profile.ratings.augmentation
          })
            .map(
              ([label, value]) => `
                <div>
                  <span>${escapeHtml(label)}</span>
                  <strong class="${badgeClass(value)}">${escapeHtml(
                value
              )}</strong>
                </div>
              `
            )
            .join("")}
        </div>

        <h3>Future role direction</h3>
        <table>
          <thead>
            <tr>
              <th>Current emphasis</th>
              <th>Likely AI-era direction</th>
            </tr>
          </thead>
          <tbody>
            ${profile.futureDirections
              .map(
                row => `
                  <tr>
                    <td>${escapeHtml(row[0])}</td>
                    <td>${escapeHtml(row[1])}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>

        <div class="button-row">
          <button id="send-to-workbench" class="primary" type="button">
            Open in AI-OS Workbench
          </button>
          <button id="download-arc-pdf" class="secondary" type="button">
            Download ARC PDF
          </button>
        </div>
      </article>
    `;

    const payload = {
      title: profile.occupation.title,
      summary: profile.occupation.summary,
      tasks: profile.tasks.map(t => ({
        task: t.task,
        bundle: t.bundleName
      }))
    };

    const workbenchButton = document.getElementById("send-to-workbench");
    if (workbenchButton) {
      workbenchButton.addEventListener("click", () => {
        localStorage.setItem("aiosWorkbenchTasks", JSON.stringify(payload));
        window.location.href = "aios-workbench.html";
      });
    }

    const pdfButton = document.getElementById("download-arc-pdf");
    if (pdfButton) {
      pdfButton.addEventListener("click", () => {
        downloadArcPdf(profile);
      });
    }
  }

  function init() {
    const input = document.getElementById("occupation-search");
    const results = searchOccupations("");

    renderResultList(results);

    if (results[0]) {
      renderProfile(results[0].id);
    }

    if (input) {
      input.addEventListener("input", () => {
        renderResultList(searchOccupations(input.value));
      });
    }
  }

  window.AIOS = {
    BUNDLES,
    classifyTask,
    buildProfile,
    searchOccupations
  };

  document.addEventListener("DOMContentLoaded", init);
})();

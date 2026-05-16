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

  function loadJsPdf() {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
        return;
      }

      const existing = document.querySelector("script[data-jspdf]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.jspdf.jsPDF));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.setAttribute("data-jspdf", "true");
      script.onload = () => resolve(window.jspdf.jsPDF);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function cleanPdfText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function downloadArcPdf(profile) {
    loadJsPdf()
      .then(jsPDF => {
        const doc = new jsPDF({
          unit: "pt",
          format: "a4",
          orientation: "portrait"
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 48;
        const usableWidth = pageWidth - margin * 2;
        let y = 48;

        const red = [123, 31, 36];
        const dark = [31, 27, 22];
        const muted = [111, 102, 92];
        const line = [222, 212, 198];

        function ensureSpace(spaceNeeded) {
          if (y + spaceNeeded > pageHeight - 60) {
            doc.addPage();
            y = 48;
          }
        }

        function addWrapped(text, size = 11, color = dark, style = "normal", gap = 14) {
          doc.setFont("times", style);
          doc.setFontSize(size);
          doc.setTextColor(color[0], color[1], color[2]);

          const lines = doc.splitTextToSize(cleanPdfText(text), usableWidth);
          ensureSpace(lines.length * (size + 4) + gap);

          doc.text(lines, margin, y);
          y += lines.length * (size + 4) + gap;
        }

        function addSection(title) {
          ensureSpace(34);
          doc.setFont("times", "bold");
          doc.setFontSize(16);
          doc.setTextColor(red[0], red[1], red[2]);
          doc.text(cleanPdfText(title), margin, y);
          y += 24;
        }

        function addRule() {
          doc.setDrawColor(line[0], line[1], line[2]);
          doc.line(margin, y, pageWidth - margin, y);
          y += 18;
        }

        function addRating(label, value) {
          ensureSpace(26);

          doc.setFont("times", "normal");
          doc.setFontSize(11);
          doc.setTextColor(dark[0], dark[1], dark[2]);
          doc.text(cleanPdfText(label), margin, y);

          doc.setFont("times", "bold");
          doc.setTextColor(red[0], red[1], red[2]);
          doc.text(cleanPdfText(value), margin + 260, y);

          y += 22;
        }

        function addFooter() {
          const pageCount = doc.internal.getNumberOfPages();

          for (let i = 1; i <= pageCount; i += 1) {
            doc.setPage(i);
            doc.setFont("times", "normal");
            doc.setFontSize(9);
            doc.setTextColor(muted[0], muted[1], muted[2]);
            doc.text(
              `© 2026 Ewan Simpson · ARC / AI-OS public demonstrator · ewansimpson.org · Page ${i} of ${pageCount}`,
              margin,
              pageHeight - 28
            );
          }
        }

        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setTextColor(red[0], red[1], red[2]);
        doc.text("ARC · AI-OS OCCUPATION ATLAS", margin, y);
        y += 26;

        doc.setFont("times", "bold");
        doc.setFontSize(26);
        doc.setTextColor(dark[0], dark[1], dark[2]);

        const titleLines = doc.splitTextToSize(
          cleanPdfText(profile.occupation.title),
          usableWidth
        );

        doc.text(titleLines, margin, y);
        y += titleLines.length * 30;

        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(muted[0], muted[1], muted[2]);
        doc.text(
          "Public occupation profile · Representative task-level analysis",
          margin,
          y
        );
        y += 18;

        addRule();

        addSection("Role summary");
        addWrapped(profile.occupation.summary, 11, dark, "normal", 16);

        addSection("Public profile depth");
        addWrapped(
          "This profile shows eight representative tasks and a high-level AI-OS interpretation. A full AI-OS analysis goes deeper into validated task registers, permitted AI modes, Decision Compass governance scoring, proof burden, residual effort, and role rebundling.",
          11,
          dark,
          "normal",
          16
        );

        addSection("Core task breakdown");

        profile.tasks.forEach((task, index) => {
          ensureSpace(42);

          doc.setFont("times", "normal");
          doc.setFontSize(11);
          doc.setTextColor(dark[0], dark[1], dark[2]);

          const taskLines = doc.splitTextToSize(
            `${index + 1}. ${cleanPdfText(task.task)}`,
            usableWidth
          );

          doc.text(taskLines, margin, y);
          y += taskLines.length * 15;

          doc.setFont("times", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(red[0], red[1], red[2]);
          doc.text(cleanPdfText(task.bundleName), margin + 16, y);
          y += 16;
        });

        y += 4;

        addSection("High-level AI-OS ratings");
        addRating("AI compression potential", profile.ratings.compression);
        addRating("Human residual strength", profile.ratings.humanResidual);
        addRating("Proof/governance burden", profile.ratings.proofBurden);
        addRating("Rebundling urgency", profile.ratings.rebundlingUrgency);
        addRating("Augmentation potential", profile.ratings.augmentation);

        addSection("Future role direction");

        profile.futureDirections.forEach(row => {
          ensureSpace(48);

          doc.setFont("times", "bold");
          doc.setFontSize(11);
          doc.setTextColor(dark[0], dark[1], dark[2]);
          doc.text(`Current emphasis: ${cleanPdfText(row[0])}`, margin, y);
          y += 15;

          doc.setFont("times", "normal");
          doc.setTextColor(red[0], red[1], red[2]);

          const futureLines = doc.splitTextToSize(
            `Likely AI-era direction: ${cleanPdfText(row[1])}`,
            usableWidth
          );

          doc.text(futureLines, margin, y);
          y += futureLines.length * 15 + 10;
        });

        addFooter();

        const fileName = `ARC-AIOS-${safeFileName(profile.occupation.title)}.pdf`;
        doc.save(fileName);
      })
      .catch(() => {
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

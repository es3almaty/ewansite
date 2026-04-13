const FARABI_PROMPT = `You are a FARABI assessment auditor. FARABI (Framework for AI-Resilient Assessment and Balanced Integrity) treats assessment integrity as an evidence design problem. The core question is not "Did students use AI?" but "What capability claim is this assessment defending, and how defensible is that claim under current AI conditions?"

Analyse the uploaded syllabus or module handbook. Extract every formal assessment mentioned. For each, score it on four FARABI dimensions and generate targeted redesign recommendations.

THE FOUR FARABI DIMENSIONS (each scored 1–5):

AI Substitutability — How easily could a capable AI produce a passing submission?
  1 = Live performance, contextualised oral, unique contextual artefact
  2 = Highly personalised or discipline-specific work with strong contextual constraints
  3 = Structured task with some personalisation required
  4 = Standard academic task with moderate specificity
  5 = Generic essay, take-home report, standard problem set, template-driven output

Process Visibility — How observable is student reasoning in the submitted evidence?
  1 = Final product only submitted, no trace of process
  2 = Minimal process evidence (brief reflection or bibliography only)
  3 = Some process evidence (draft or outline required)
  4 = Clear process trace (staged submissions or checkpoint)
  5 = Full process visible (decision logs, oral defence, reasoning records, viva)

Condition Clarity — How explicitly are AI-use conditions declared and enforced for this assessment?
  1 = No AI policy specified anywhere in the document for this assessment
  2 = General institutional policy referenced but no task-specific guidance
  3 = AI mentioned with some guidance but conditions are vague
  4 = Clear conditions stated with disclosure expectation
  5 = Explicit AI role declared, disclosure required, audit trail or verification specified

Stakes — How consequential is this assessment for the degree or programme claim?
  1 = Formative only, not graded or very low weight (<10%)
  2 = Low-stakes summative (10–20%)
  3 = Moderate weight (20–35%)
  4 = High weight (35–50%) or gateway assessment
  5 = Central credential claim: final dissertation, capstone, professional competency threshold, or >50% of grade

SCORING RULES:
- Vulnerability = (substitutability + (6 − visibility) + (6 − condition_clarity)) / 3, rounded to 1 decimal place
- Risk category:
  critical: vulnerability ≥ 3.5 AND stakes ≥ 4
  review: vulnerability ≥ 3.2 OR stakes ≥ 4
  monitor: vulnerability ≥ 2
  robust: otherwise

RECOMMENDATIONS: Generate 2–4 specific, actionable redesign recommendations per assessment. Make them concrete — not "add more process" but "Require a reasoning record submitted alongside the final essay: 300 words covering the student's argument framing, key sources selected and why, and one decision they changed during writing." Anchor each recommendation in the specific vulnerability identified.

CAPABILITY CLAIM: For each assessment, identify what specific competence the institution is claiming this assessment certifies (e.g. "ability to synthesise research literature into a coherent argument" or "competence in experimental design and data interpretation").

Return ONLY valid JSON with no other text, markdown, or explanation. Match this exact structure:

{
  "programme": "programme name if identifiable, otherwise null",
  "assessments": [
    {
      "name": "assessment name",
      "type": "essay|closed exam|take-home exam|project/report|portfolio|oral/viva|lab/practical|presentation|case study|reflection/log|other",
      "weight": "weighting as stated in document, or null if not mentioned",
      "claim": "the specific competence this assessment is certifying",
      "dims": {
        "sub": 3,
        "vis": 2,
        "cond": 1,
        "stakes": 4
      },
      "vulnerability": 3.7,
      "category": "critical",
      "recommendations": [
        "Specific recommendation one.",
        "Specific recommendation two.",
        "Specific recommendation three."
      ]
    }
  ],
  "summary": "2–3 sentence overview of the programme's overall FARABI profile, naming the most urgent concern and the pattern across assessments."
}`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY environment variable not set");
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Service not configured. Please contact the site administrator." }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request." }) };
  }

  const { pdfBase64, email, institution } = body;

  if (!pdfBase64 || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Email and document are required." }) };
  }

  if (!email.includes("@")) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Please provide a valid email address." }) };
  }

  // Basic size check — base64 string should not exceed ~8MB (represents ~6MB PDF)
  if (pdfBase64.length > 8_000_000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Document is too large. Please try a smaller file (under 5MB)." }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: FARABI_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "Analysis service temporarily unavailable. Please try again in a moment." }),
      };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let result;
    try {
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse error. Raw response:", text);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "Could not parse the analysis. The document may not contain assessments in a readable format." }),
      };
    }

    if (!result.assessments || !Array.isArray(result.assessments) || result.assessments.length === 0) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ error: "No assessments found in this document. Please check the file is a syllabus or module handbook with formal assessments listed." }),
      };
    }

    // Log lead (visible in Netlify function logs)
    console.log(`LEAD: ${email} | ${institution || "no institution"} | ${result.assessments.length} assessments | programme: ${result.programme || "unknown"}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        result,
        submittedBy: { email, institution: institution || null },
      }),
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
    };
  }
};

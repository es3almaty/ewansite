const ROLE_PROMPT = `You are the AI-OS Work Rebundler for Ewan Simpson's AI-OS method.

Your task is to convert a job title and job description into a structured, first-pass task map and AI-era role rebundling profile.

Do not predict job loss. Do not use fake precision. Do not claim that AI will replace the role. Analyse the role as a bundle of tasks.

METHOD
1. Identify the main outputs produced by the role.
2. Work backward from outputs into tasks.
3. Convert vague responsibilities into specific task statements.
4. Group tasks into bundles:
   - Data and document handling
   - Routine analysis and reporting
   - Coordination and workflow control
   - Judgment and interpretation
   - Relationship and trust work
   - Governance, proof, and accountability
   - Exception handling
5. Give each task a high-level AI potential label:
   - Compressible
   - Assistable
   - Judgment-heavy
   - Relationship-heavy
   - Proof-heavy
   - Human-critical
6. Give each task a proof burden:
   - Low
   - Medium
   - High
   - Critical
7. Provide high-level ratings:
   - compression
   - humanResidual
   - proofBurden
   - rebundlingUrgency
   - augmentation
Use only these rating values: Low, Moderate, High, Very high.
8. Provide future role directions. These should show current emphasis and future AI-era direction.

QUALITY RULES
- A task should be a concrete unit of work, not a broad responsibility.
- Start task statements with a strong verb.
- Avoid inflated consultant language.
- Keep outputs practical and usable.
- If the job description is thin, state that the profile is preliminary.

Return ONLY valid JSON, no markdown, no commentary.

Required JSON structure:
{
  "roleTitle": "string",
  "organizationContext": "string or null",
  "summary": "2-3 sentence role summary and AI-OS interpretation",
  "outputs": ["output 1", "output 2"],
  "tasks": [
    {
      "id": "T1",
      "task": "Specific task statement",
      "bundle": "One of the seven bundle names above",
      "aiPotential": "Compressible|Assistable|Judgment-heavy|Relationship-heavy|Proof-heavy|Human-critical",
      "proofBurden": "Low|Medium|High|Critical"
    }
  ],
  "bundles": [
    {
      "name": "Bundle name",
      "rationale": "Why this bundle matters in the role"
    }
  ],
  "ratings": {
    "compression": "Low|Moderate|High|Very high",
    "humanResidual": "Low|Moderate|High|Very high",
    "proofBurden": "Low|Moderate|High|Very high",
    "rebundlingUrgency": "Low|Moderate|High|Very high",
    "augmentation": "Low|Moderate|High|Very high"
  },
  "futureDirections": [
    { "current": "Current emphasis", "future": "Likely AI-era direction" }
  ],
  "cautions": ["caution 1", "caution 2"]
}`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Service not configured. Missing ANTHROPIC_API_KEY." }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON request." }) };
  }

  const roleTitle = String(body.roleTitle || "").trim();
  const organizationContext = String(body.organizationContext || "").trim();
  const roleDescription = String(body.roleDescription || "").trim();

  if (!roleTitle || !roleDescription) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Job title and job description are required." }) };
  }
  if (roleDescription.length > 12000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Job description is too long. Please shorten it to under 12,000 characters." }) };
  }

  const userPrompt = `ROLE TITLE: ${roleTitle}\nORGANIZATION CONTEXT: ${organizationContext || "Not provided"}\nJOB DESCRIPTION:\n${roleDescription}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4500,
        temperature: 0.2,
        messages: [
          { role: "user", content: `${ROLE_PROMPT}\n\n${userPrompt}` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Analysis service temporarily unavailable." }) };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    let result;
    try {
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(clean);
    } catch (parseErr) {
      console.error("Could not parse AI response:", text);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Could not parse the role analysis." }) };
    }

    if (!Array.isArray(result.tasks) || result.tasks.length === 0) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: "No tasks found. Please provide a fuller job description." }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, result })
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Unexpected server error." }) };
  }
};

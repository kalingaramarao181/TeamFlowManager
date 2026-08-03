import React, { useState } from "react";
import "../styles/AICodeGeneratorButton.css";

import { genCodeAzurefunctionUrl } from "../../Config/env";

const AZURE_FUNCTION_URL = genCodeAzurefunctionUrl; 


// ⚠️ Hardcoded shared key for this iteration.
// TODO: rotate if it ever leaks or after the demo.
// azure change here

const FUNCTION_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

const AICodeGeneratorButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    Summary: "",
    Description: "",
    CodingLanguage: "",
    GitRepo: "", // owner/repo or full URL (we normalize)  // azure change here
    FileName: "",
  });

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // If a user pastes a full GitHub URL, convert to owner/repo
  // azure change here
  const normalizeRepo = (raw) => {
    const v = (raw || "").trim();
    if (!v) return v;
    if (/^https?:\/\//i.test(v)) {
      try {
        const u = new URL(v);
        const parts = u.pathname.replace(/^\/+/, "").split("/");
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      } catch {}
    }
    return v;
  };

  // Minimal validation aligned with backend expectations
  // azure change here
  const validate = () => {
    if (!form.Summary.trim()) return "Summary is required.";
    if (!form.Description.trim()) return "Description is required.";
    const repo = normalizeRepo(form.GitRepo);
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
      return "GitRepo must be owner/repo (e.g., yourUser/yourRepo).";
    if (!form.FileName.trim()) return "File Name is required.";
    if (form.FileName.startsWith("/") || form.FileName.includes(".."))
      return "Invalid File Name.";
    return null;
  };

  const submit = async () => {
    setMsg(null);

    // azure change here
    const err = validate();
    if (err) {
      setMsg({ type: "error", text: err });
      return;
    }

    setLoading(true);
    try {
      // Add Branch/Base defaults and normalize GitRepo for API contract
      // azure change here
      // inside submit() before fetch
      const payload = {
        Summary: form.Summary,
        Description: form.Description,
        CodingLanguage: form.CodingLanguage || "Python",
        GitRepo: normalizeRepo(form.GitRepo),
        FileName: form.FileName,
        Base: "main",
        Body: "Auto-generated PR from TicketToPR",
        ...(form.Branch?.trim() ? { Branch: form.Branch.trim() } : {}), // azure change here
      };


      const res = await fetch(AZURE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": FUNCTION_KEY, // send key as header  // azure change here
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* keep raw text */ }

// azure change here (replace your current success handling)
    if (!res.ok || data?.ok === false) {
      setMsg({ type: "error", text: data?.error || text || `HTTP ${res.status}` });
    } else {
      if (data?.pr_url) {
        const reused = data?.note === "Reused existing PR";          // azure change here
        const label = reused                                         // azure change here
          ? `Updated existing PR${data?.number ? ` #${data.number}` : ""}` 
          : `Created PR${data?.number ? ` #${data.number}` : ""}`;
        setMsg({                                                     // azure change here
          type: "success",
          text: label,
          pr_url: data.pr_url,
          number: data.number,
          reused,
        });
      } else {
        setMsg({ type: "success", text: text || "✅ Success" });
      }
    }
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        className="tf-dashboard-button tf-dashboard-button--success"
        onClick={() => setIsOpen(true)}
      >
        Generate Code
      </button>

      {/* Popup modal */}
      {isOpen && (
        <div
          className="tf-modal-backdrop"
          onClick={() => !loading && setIsOpen(false)}
        >
          <div className="tf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tf-modal-header">
              <h3>Generate Code</h3>
              <button
                className="tf-icon-btn"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <div className="tf-modal-body">
              {/* First-time install CTA */}
              {/* azure change here */}
              <div className="tf-alert tf-alert--info" style={{ marginBottom: 12 }}>
                <b>First time?</b>{" "}
                <a href="https://github.com/apps/tickettopr-bot" target="_blank" rel="noreferrer">
                  Install the GitHub App
                </a>{" "}
                and select your repo(s).{" "}
                Requires permissions:{" "}
                <b>Contents (Read &amp; write)</b>,{" "}
                <b>Pull requests (Read &amp; write)</b>.
              </div>

              {/* Summary */}
              <div className="tf-field">
                <label className="tf-label" htmlFor="summary">
                  Summary <span className="tf-required">*</span>
                </label>
                <input
                  id="summary"
                  className="tf-input"
                  value={form.Summary}
                  onChange={update("Summary")}
                  placeholder="Enter issue summary…"
                />
                <small className="tf-help">
                  Example: Add a TypeScript email validator
                </small>
              </div>

              {/* Description */}
              <div className="tf-field">
                <label className="tf-label" htmlFor="desc">
                  Description <span className="tf-required">*</span>
                </label>
                <textarea
                  id="desc"
                  className="tf-input tf-textarea"
                  rows={4}
                  value={form.Description}
                  onChange={update("Description")}
                  placeholder="Describe exactly what to build."
                />
                <small className="tf-help">
                  Example: Create isValidEmail(email) with a couple of inline tests.
                </small>
              </div>

              {/* Coding Language + File Name */}
              <div className="tf-grid">
                <div className="tf-field">
                  <label className="tf-label" htmlFor="lang">
                    Coding Language <span className="tf-required">*</span>
                  </label>
                  <input
                    id="lang"
                    className="tf-input"
                    value={form.CodingLanguage}
                    onChange={update("CodingLanguage")}
                    placeholder="e.g., TypeScript"
                  />
                </div>

                <div className="tf-field">
                  <label className="tf-label" htmlFor="file">
                    File Name <span className="tf-required">*</span>
                  </label>
                  <input
                    id="file"
                    className="tf-input"
                    value={form.FileName}
                    onChange={update("FileName")}
                    placeholder="e.g., src/utils/emailValidator.ts"
                  />
                </div>
              </div>

              {/* Git Repo */}
              <div className="tf-field">
                <label className="tf-label" htmlFor="repo">
                  Git Repository (owner/repo or URL) <span className="tf-required">*</span> {/* azure change here */}
                </label>
                <input
                  id="repo"
                  className="tf-input"
                  value={form.GitRepo}
                  onChange={update("GitRepo")}
                  placeholder="e.g., yourUser/yourRepo or full https://github.com/… URL"
                />
                <small className="tf-help">
                  We’ll convert full URLs to owner/repo automatically. {/* azure change here */}
                </small>
              </div>

              {/* azure change here */}
              <div className="tf-field">
                <label className="tf-label" htmlFor="branch">
                  Branch (optional)
                </label>
                <input
                  id="branch"
                  className="tf-input"
                  value={form.Branch}
                  onChange={update("Branch")}
                  placeholder='Leave blank to create a new PR. To update, paste the branch name (e.g., feature/auto-gen-1757605696)'
                />
                <small className="tf-help">
                  Use the exact branch name from the PR header to add more commits to the same PR.
                </small>
              </div>


              {/* Alerts */}
              {msg && (
                <div
                  className={`tf-alert ${msg.type === "success" ? "tf-alert--success" : "tf-alert--error"}`}
                  role="status"
                >
                  {msg.pr_url ? (
                    <p>
                      {msg.text}:{" "}
                      <a href={msg.pr_url} target="_blank" rel="noreferrer">
                        {msg.pr_url}
                      </a>
                    </p>
                  ) : (
                    <pre>{msg.text}</pre>
                  )}
                </div>
              )}
            </div>

            <div className="tf-modal-footer">
              <button
                className="tf-btn tf-btn--ghost"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Close
              </button>
              <button
                className="tf-btn tf-btn--primary"
                onClick={submit}
                disabled={loading}
              >
                {loading ? "Working…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICodeGeneratorButton;

/*
NOTE:
- We send the shared key in the "x-functions-key" header.  // azure change here
- Ensure your Function App CORS allows your frontend origin (and localhost for dev):
  az functionapp cors add -g TicketToPR-RG -n ticket2pr-func --allowed-origins https://your-frontend.example.com
  az functionapp cors add -g TicketToPR-RG -n ticket2pr-func --allowed-origins http://localhost:5173
  az functionapp cors add -g TicketToPR-RG -n ticket2pr-func --allowed-origins http://localhost:3000
*/

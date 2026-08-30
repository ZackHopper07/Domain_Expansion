import { useState, useEffect } from "react";
import { X, Key, Check, AlertCircle, RefreshCw } from "lucide-react";

export default function AiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem("openrouter_api_key") || "";
      setApiKey(savedKey);
      setStatus({ type: "", message: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("openrouter_api_key", apiKey.trim());
    setStatus({
      type: "success",
      message: apiKey.trim() ? "API key saved successfully!" : "API key cleared.",
    });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem("openrouter_api_key");
    setStatus({ type: "info", message: "API key input cleared. Save to persist." });
  };

  const handleTest = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setStatus({ type: "error", message: "Please enter an API key to test." });
      return;
    }

    setTesting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keyToTest}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: "Respond with only the word OK" }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `HTTP error ${response.status}`);
      }

      setStatus({ type: "success", message: "Connection successful! Key is valid." });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: `Verification failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">OpenRouter Integration</h3>
            <p className="text-xs text-gray-400">Configure your local API key</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Your key is stored securely in your browser's local storage and is only used
          to make direct client-side requests to OpenRouter.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="api-key-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
            >
              OpenRouter API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {status.message && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs ${
                status.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                  : status.type === "error"
                  ? "border-red-500/20 bg-red-500/5 text-red-300"
                  : "border-blue-500/20 bg-blue-500/5 text-blue-300"
              }`}
            >
              {status.type === "success" ? (
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-normal">{status.message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTest}
              disabled={testing || !apiKey.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 font-semibold text-xs text-white hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 transition-all"
            >
              {testing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Verify Key"
              )}
            </button>
            <button
              onClick={handleClear}
              className="px-3 rounded-xl border border-white/10 bg-white/5 py-2.5 font-semibold text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-b from-blue-600 to-blue-500 py-2.5 font-semibold text-xs text-white hover:brightness-110 transition-all shadow-lg shadow-blue-500/10"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

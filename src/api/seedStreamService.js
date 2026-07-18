/**
 * Seed Stream Service
 * Consumes the SSE (Server-Sent Events) stream from the seed-excel endpoint.
 * Uses the Fetch API directly (not axios) because axios does not support
 * streaming response bodies.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL;

/** Read the admin JWT from localStorage (set by AdminAuthContext). */
function getAuthToken() {
  return localStorage.getItem("admin_token");
}

/**
 * Seed questions via SSE streaming.
 *
 * @param {File} file          - The Excel file to upload
 * @param {boolean} clearExisting - Whether to clear existing questions first
 * @param {object} callbacks   - { onEvent(event), onError(error), onComplete() }
 * @returns {{ abort: () => void }} - Control object to cancel the stream
 */
export function seedQuestionsStream(file, clearExisting, callbacks) {
  const { onEvent, onError, onComplete } = callbacks;
  const controller = new AbortController();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("clearExisting", clearExisting ? "true" : "false");

  const token = getAuthToken();

  (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/questions/seed-excel?stream=true`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        // Try to read error body as text
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errBody = await response.text();
          if (errBody) errorMsg += `: ${errBody}`;
        } catch (_) {
          // ignore
        }
        onError?.(new Error(errorMsg));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on double newline (SSE event boundary)
        const parts = buffer.split("\n\n");
        // Keep the last (possibly incomplete) chunk in the buffer
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                onEvent?.(event);

                // If we get a "complete" event, we're done
                if (event.type === "complete") {
                  onComplete?.(event.data);
                  return;
                }
              } catch (parseErr) {
                console.warn(
                  "[SeedStream] Failed to parse SSE event:",
                  parseErr,
                  line,
                );
              }
            }
          }
        }
      }

      // Stream ended without a complete event — treat as done
      onComplete?.();
    } catch (err) {
      if (err.name === "AbortError") {
        // User cancelled — not an error
        return;
      }
      onError?.(err);
    }
  })();

  return {
    abort: () => controller.abort(),
  };
}
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "setulearn_human_verified";
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXY345679"; // no 0/O/1/I to avoid confusion

function randomCode(length = 5) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

function drawCaptcha(canvas, code) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#ede3fa");
  grad.addColorStop(1, "#fff1e4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Noise lines
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(90, 30, 173, ${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }

  // Dots
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(90, 30, 173, ${0.1 + Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Characters, each with its own rotation/offset
  const charWidth = w / code.length;
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    const x = charWidth * i + charWidth / 2;
    const y = h / 2 + (Math.random() * 10 - 5);
    ctx.translate(x, y);
    ctx.rotate((Math.random() * 30 - 15) * (Math.PI / 180));
    ctx.font = `bold ${Math.floor(h * 0.55)}px 'Google Sans Flex', Arial, sans-serif`;
    ctx.fillStyle = i % 2 === 0 ? "#5A1EAD" : "#3D0D8A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
}

export default function HumanVerification({ onVerified }) {
  const [code, setCode] = useState(() => randomCode());
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const canvasRef = useRef(null);
  document.title = "Verification - SetuLearn";

  const regenerate = useCallback(() => {
    setCode(randomCode());
    setInput("");
    setError("");
  }, []);

  useEffect(() => {
    drawCaptcha(canvasRef.current, code);
  }, [code]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checked) {
      setError("Please confirm the checkbox above first.");
      return;
    }

    if (input.trim().toUpperCase() !== code) {
      setError("That doesn't match the code. Please try again.");
      regenerate();
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
    } catch {
      /* ignore */
    }
    onVerified();
  };

  return (
    <div className="verify-gate">
      <div className="verify-gate-blob verify-blob-a" />
      <div className="verify-gate-blob verify-blob-b" />

      <form className="verify-card" onSubmit={handleSubmit}>
        <div className="verify-logo">
          <img src="/logo.webp" alt="SetuLearn" className="verify-logo-img" />
        </div>
        <h1>Let's confirm you're human</h1>
        <p className="verify-sub">
          Just a quick, one-time check to keep SetuLearn free of bots and
          spam. This only happens once on this device.
        </p>

        <label className="verify-checkbox-row">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I am not a robot</span>
        </label>

        <div className="verify-captcha-box">
          <canvas ref={canvasRef} width={220} height={70} className="verify-canvas" />
          <button
            type="button"
            className="verify-refresh"
            onClick={regenerate}
            aria-label="Get a new code"
            title="Get a new code"
          >
            ↻
          </button>
        </div>

        <input
          className="verify-input"
          type="text"
          placeholder="Type the code shown above"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={8}
        />

        {error && <div className="verify-error">{error}</div>}

        <button type="submit" className="btn-primary btn-lg verify-submit">
          Verify &amp; Continue
        </button>
      </form>
    </div>
  );
}

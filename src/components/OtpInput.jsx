import { useRef } from "react";

const LENGTH = 6;

/** Six single-digit boxes with auto-advance, backspace navigation and paste support. `value` is a string of digits. */
export default function OtpInput({ value, onChange, disabled, autoFocus = true }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || "");

  const focusAt = (i) => refs.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();

  const setDigit = (i, char) => {
    const next = digits.slice();
    next[i] = char;
    onChange(next.join("").slice(0, LENGTH));
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return setDigit(i, "");
    if (raw.length > 1) {
      // Browser autofill / multi-char input: spread across the boxes.
      const merged = (value.slice(0, i) + raw).slice(0, LENGTH);
      onChange(merged);
      focusAt(merged.length >= LENGTH ? LENGTH - 1 : merged.length);
      return;
    }
    setDigit(i, raw);
    if (i < LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigit(i - 1, "");
      focusAt(i - 1);
    } else if (e.key === "ArrowLeft") focusAt(i - 1);
    else if (e.key === "ArrowRight") focusAt(i + 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusAt(pasted.length >= LENGTH ? LENGTH - 1 : pasted.length);
  };

  return (
    <div className="otp-boxes" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp-box"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

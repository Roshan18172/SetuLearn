import { useEffect, useState } from "react";
import { INDIA_STATES, getCitiesForState } from "../data/indiaLocations";
import { EXAM_GROUPS, ALL_EXAMS, OTHER_OPTION } from "../data/examsList";

const MAX_LEN = 100; // matches the backend validator

/**
 * Target-exam dropdown (grouped). Choosing "Other" reveals a text box.
 * Values that were saved before the dropdown existed (free text) are preserved and shown via "Other".
 * Renders ONE .admin-form-group so it can sit inside an .admin-form-row.
 */
export function ExamSelect({ id = "profile-exam", value, onChange }) {
  const known = ALL_EXAMS.includes(value);
  const [forceOther, setForceOther] = useState(false);

  useEffect(() => {
    if (known) setForceOther(false);
  }, [known]);

  const isOther = forceOther || (Boolean(value) && !known);
  const selectValue = isOther ? OTHER_OPTION : value || "";

  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === OTHER_OPTION) {
      setForceOther(true);
      onChange("");
    } else {
      setForceOther(false);
      onChange(next);
    }
  };

  return (
    <div className="admin-form-group">
      <label htmlFor={id}>Target exam</label>
      <select id={id} value={selectValue} onChange={handleSelect}>
        <option value="">Select your target exam</option>
        {EXAM_GROUPS.map(({ group, exams }) => (
          <optgroup key={group} label={group}>
            {exams.map((exam) => (
              <option key={`${group}-${exam}`} value={exam}>
                {exam}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OTHER_OPTION}>Other (type your exam)</option>
      </select>
      {isOther && (
        <input
          aria-label="Your target exam"
          style={{ marginTop: 8 }}
          value={value}
          maxLength={MAX_LEN}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your exam name"
        />
      )}
    </div>
  );
}

/**
 * Dependent State -> City dropdowns. Picking a state fills the city list with that state's cities
 * and clears any previously chosen city. "Other" lets a student type a town that isn't listed.
 * Renders TWO .admin-form-group blocks (use inside an .admin-form-row).
 */
export function StateCitySelect({ state, city, onChange }) {
  const cities = getCitiesForState(state);
  const cityKnown = cities.includes(city);
  const [forceOther, setForceOther] = useState(false);

  useEffect(() => {
    if (cityKnown) setForceOther(false);
  }, [cityKnown]);

  const stateKnown = INDIA_STATES.includes(state);
  const isOther = Boolean(state) && (forceOther || (Boolean(city) && !cityKnown));
  const citySelectValue = !state ? "" : isOther ? OTHER_OPTION : city || "";

  const handleState = (e) => {
    setForceOther(false);
    onChange(e.target.value, ""); // a city from the old state is never valid for the new one
  };

  const handleCity = (e) => {
    const next = e.target.value;
    if (next === OTHER_OPTION) {
      setForceOther(true);
      onChange(state, "");
    } else {
      setForceOther(false);
      onChange(state, next);
    }
  };

  return (
    <>
      <div className="admin-form-group">
        <label htmlFor="profile-state">State / UT</label>
        <select id="profile-state" value={state || ""} onChange={handleState}>
          <option value="">Select state</option>
          {state && !stateKnown && <option value={state}>{state}</option>}
          {INDIA_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-group">
        <label htmlFor="profile-city">City</label>
        <select id="profile-city" value={citySelectValue} onChange={handleCity} disabled={!state}>
          <option value="">{state ? "Select city" : "Select a state first"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {state && <option value={OTHER_OPTION}>Other (type your city)</option>}
        </select>
        {isOther && (
          <input
            aria-label="Your city"
            style={{ marginTop: 8 }}
            value={city}
            maxLength={MAX_LEN}
            onChange={(e) => onChange(state, e.target.value)}
            placeholder="Type your city / town"
          />
        )}
      </div>
    </>
  );
}

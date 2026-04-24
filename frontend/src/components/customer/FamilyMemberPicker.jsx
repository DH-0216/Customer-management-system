import { useState, useEffect, useRef } from "react";
import { customerApi } from "../../api/customerApi";
import { X, Search, Users } from "lucide-react";

/**
 * FamilyMemberPicker
 * Props:
 *  - value: number[]  (array of customer IDs)
 *  - onChange: (ids: number[]) => void
 *  - excludeId: number  (current customer's own id, to exclude from search)
 */
export default function FamilyMemberPicker({
  value = [],
  onChange,
  excludeId,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // [{id, name, nicNumber}]
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await customerApi.search(query);
        const filtered = (r.data || []).filter(
          (c) => c.id !== excludeId && !value.includes(c.id),
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, excludeId, value]);

  // Fetch selected customer details when value changes (e.g. edit page load)
  useEffect(() => {
    if (!value.length) {
      setSelected([]);
      return;
    }
    // Only fetch those we don't already have
    const missing = value.filter((id) => !selected.find((s) => s.id === id));
    if (!missing.length) {
      setSelected((prev) => prev.filter((s) => value.includes(s.id)));
      return;
    }
    Promise.all(
      missing.map((id) => customerApi.getById(id).then((r) => r.data)),
    )
      .then((customers) => {
        setSelected((prev) => [
          ...prev.filter((s) => value.includes(s.id)),
          ...customers,
        ]);
      })
      .catch(() => {});
  }, [JSON.stringify(value)]);

  const addMember = (customer) => {
    onChange([...value, customer.id]);
    setResults([]);
    setQuery("");
    setOpen(false);
  };

  const removeMember = (id) => {
    onChange(value.filter((v) => v !== id));
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Tags */}
      {selected.length > 0 && (
        <div className="tag-list" style={{ marginBottom: 8 }}>
          {selected.map((s) => (
            <span key={s.id} className="tag">
              <Users size={11} />
              {s.name}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeMember(s.id)}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="search-bar" style={{ maxWidth: "100%" }}>
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search customer by name or NIC…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Dropdown */}
      {open && (query.trim() || results.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            zIndex: 500,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loading && (
            <div
              style={{
                padding: "12px 16px",
                color: "var(--text-secondary)",
                fontSize: "0.83rem",
              }}
            >
              Searching…
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div
              style={{
                padding: "12px 16px",
                color: "var(--text-muted)",
                fontSize: "0.83rem",
              }}
            >
              No customers found
            </div>
          )}
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => addMember(c)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                {c.name}
              </div>
              <div
                style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
              >
                NIC: {c.nicNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

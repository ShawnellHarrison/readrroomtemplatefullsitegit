import React, { useMemo, useState, useEffect } from "react";

// ---------- Types ----------
type VoteMethod = "single-choice" | "ranked"; // UI implements single-choice; ranked reserved for future
type Party = { id: string; name: string };
type Poll = {
  id: string;
  title: string;
  method: VoteMethod;
  parties: Party[];
  anonymous: boolean;
  closesAt?: string | null; // ISO
  createdAt: string; // ISO
};

// ---------- Storage helpers (localStorage for quick drop-in; swap for your backend easily) ----------
const LS_KEY = "rtr_polls";

function loadPolls(): Record<string, Poll> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function savePoll(poll: Poll) {
  const all = loadPolls();
  all[poll.id] = poll;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}
function getPoll(id: string): Poll | null {
  const all = loadPolls();
  return all[id] ?? null;
}

// ---------- Util ----------
const uid = () =>
  (crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36));

const classBtn =
  "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-50 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 text-black font-bold";
const classGhostBtn =
  "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold hover:bg-white/20 transition text-white";
const inputCls =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50";
const labelCls = "text-xs font-medium text-white";
const chipCls =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white";

// ---------- Vote Button + Builder Dialog ----------
export function VoteButtonConfigurator({
  label = "Create Vote",
  onCreated,
  navigateToVote = (id: string) => {
    // simple client-side redirect; replace if you use a router
    window.location.href = `/vote/${id}`;
  },
}: {
  label?: string;
  onCreated?: (poll: Poll) => void;
  navigateToVote?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Which party should we pick?");
  const [method, setMethod] = useState<VoteMethod>("single-choice");
  const [anonymous, setAnonymous] = useState(true);
  const [closesAt, setClosesAt] = useState<string | "">("");
  const [parties, setParties] = useState<Party[]>([
    { id: uid(), name: "Party A" },
    { id: uid(), name: "Party B" },
  ]);

  const canCreate = useMemo(
    () =>
      title.trim().length > 0 &&
      parties.length >= 2 &&
      parties.every((p) => p.name.trim().length > 0),
    [title, parties]
  );

  function addParty() {
    setParties((ps) => [...ps, { id: uid(), name: `Party ${String.fromCharCode(65 + ps.length)}` }]);
  }
  function removeParty(id: string) {
    setParties((ps) => ps.filter((p) => p.id !== id));
  }
  function renameParty(id: string, name: string) {
    setParties((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function createPoll() {
    if (!canCreate) return;
    const poll: Poll = {
      id: uid(),
      title: title.trim(),
      method,
      parties: parties.map((p) => ({ ...p, name: p.name.trim() })),
      anonymous,
      closesAt: closesAt || null,
      createdAt: new Date().toISOString(),
    };
    savePoll(poll);
    onCreated?.(poll);
    setOpen(false);
    navigateToVote(poll.id);
  }

  return (
    <>
      <button className={classBtn} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Customize Vote (Parties)</h2>
              <button className={classGhostBtn} onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Title */}
            <div className="mt-4 space-y-2">
              <label className={labelCls}>Question / Title</label>
              <input
                className={inputCls}
                placeholder="Which party do you support?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Method & anonymity */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Method</label>
                <select
                  className={inputCls}
                  value={method}
                  onChange={(e) => setMethod(e.target.value as VoteMethod)}
                >
                  <option value="single-choice">Single choice (pick one)</option>
                  <option value="ranked" disabled>
                    Ranked (coming soon)
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Anonymous voting</label>
                <div className="flex items-center gap-3">
                  <input
                    id="anon"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  <label htmlFor="anon" className="text-sm text-white">
                    Hide voter identities
                  </label>
                </div>
              </div>
            </div>

            {/* Close time */}
            <div className="mt-4 space-y-2">
              <label className={labelCls}>Closes (optional)</label>
              <input
                className={inputCls}
                type="datetime-local"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
              />
            </div>

            {/* Parties */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Parties</span>
                <button className={classGhostBtn} onClick={addParty}>
                  + Add party
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {parties.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className={chipCls}>#{idx + 1}</span>
                    <input
                      className={inputCls}
                      value={p.name}
                      onChange={(e) => renameParty(p.id, e.target.value)}
                      placeholder={`Party ${idx + 1}`}
                    />
                    <button
                      className={classGhostBtn}
                      onClick={() => removeParty(p.id)}
                      disabled={parties.length <= 2}
                      title="Remove"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button className={classGhostBtn} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className={classBtn} disabled={!canCreate} onClick={createPoll}>
                Create & Go to Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Simple Vote Page (single-choice) ----------
export function VotePage({ pollId }: { pollId?: string }) {
  // Poll id resolution: from prop OR /vote/:id path
  const idFromPath = useMemo(() => {
    if (pollId) return pollId;
    const m = window.location.pathname.match(/\/vote\/([^/?#]+)/);
    return m?.[1] || "";
  }, [pollId]);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [choice, setChoice] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [tally, setTally] = useState<Record<string, number>>({}); // partyId -> count

  useEffect(() => {
    const p = getPoll(idFromPath);
    setPoll(p);
    // init empty tally if none
    if (p) {
      const t: Record<string, number> = {};
      p.parties.forEach((party) => (t[party.id] = 0));
      // load existing tally from localStorage (for demo-only)
      const raw = localStorage.getItem(`rtr_tally_${p.id}`);
      if (raw) Object.assign(t, JSON.parse(raw));
      setTally(t);
    }
  }, [idFromPath]);

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Vote not found</h1>
          <p className="mt-2 text-gray-300">The poll may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  const isClosed =
    poll.closesAt ? new Date(poll.closesAt).getTime() < Date.now() : false;

  function submitVote() {
    if (!choice || isClosed) return;
    const next = { ...tally, [choice]: (tally[choice] ?? 0) + 1 };
    setTally(next);
    localStorage.setItem(`rtr_tally_${poll.id}`, JSON.stringify(next));
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4">
      <div className="container mx-auto max-w-xl py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-semibold text-white">{poll.title}</h1>
          <div className="mt-1 text-xs text-gray-300">
            Method: {poll.method === "single-choice" ? "Single choice" : "Ranked"}
            {poll.closesAt ? (
              <> • Closes: {new Date(poll.closesAt).toLocaleString()}</>
            ) : null}
            {poll.anonymous ? <> • Anonymous</> : <> • Public</>}
          </div>

          {/* Options */}
          <div className="mt-5 space-y-3">
            {poll.parties.map((p) => (
              <label key={p.id} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-3 hover:bg-white/10 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="party"
                  value={p.id}
                  checked={choice === p.id}
                  onChange={(e) => setChoice(e.target.value)}
                  className="h-4 w-4"
                  disabled={submitted || isClosed}
                />
                <span className="text-sm text-white">{p.name}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3">
            <button
              className={classBtn}
              disabled={!choice || submitted || isClosed}
              onClick={submitVote}
            >
              {submitted ? "Vote Recorded" : "Submit Vote"}
            </button>
            {isClosed && (
              <span className="text-sm text-red-400">Voting is closed.</span>
            )}
          </div>

          {/* Results (simple tally) */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white">Live Results</h3>
            <div className="mt-2 space-y-2">
              {poll.parties.map((p) => {
                const total = Object.values(tally).reduce((a, b) => a + b, 0);
                const count = tally[p.id] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-sm text-white">
                      <span>{p.name}</span>
                      <span className="tabular-nums">{count} • {pct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Demo storage only (local device). Hook this up to your backend or Supabase for real polls.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Quick Starter Wrapper (optional) ----------
export default function VoteStarter() {
  // this renders the button, and if the path is /vote/:id, renders the vote page.
  const onVoteRoute = /\/vote\/[^/?#]+/.test(window.location.pathname);
  return (
    <div className="p-4">
      {!onVoteRoute && (
        <div className="flex items-center gap-3">
          <VoteButtonConfigurator />
          <p className="text-sm text-gray-300">
            Click to create a customizable party vote, then share the link.
          </p>
        </div>
      )}
      {onVoteRoute && <VotePage />}
    </div>
  );
}
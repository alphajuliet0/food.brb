var FORM_READ_ACCESS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // read-access/publisher.mjs
  var publisher_exports = {};
  __export(publisher_exports, {
    SnapshotPublisher: () => SnapshotPublisher
  });

  // read-access/model.mjs
  var nutrients = ["kcal", "protein", "fibre", "carbs", "fat"];
  var Invalid = class extends Error {
    constructor(code, status = 400) {
      super(code);
      this.code = code;
      this.status = status;
    }
  };
  function check(ok, code = "invalid_input", status = 400) {
    if (!ok) throw new Invalid(code, status);
  }
  function validDate(s) {
    return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s + "T00:00:00Z")) && (/* @__PURE__ */ new Date(s + "T00:00:00Z")).toISOString().slice(0, 10) === s;
  }
  var number = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : null;
  var text = (x, max = 160) => typeof x === "string" ? x.slice(0, max) : null;
  var round = (x) => Math.round(x * 100) / 100;
  var ringKeys = ["sleep_score", "sleep_efficiency", "recovery_score", "avg_sleep_hrv", "sleep_rhr", "steps", "active_minutes", "temperature_deviation", "vo2_max", "movement_index", "metabolic_score", "spo2"];
  function duration(raw) {
    if (typeof raw !== "string") return null;
    const m = raw.match(/^(\d{1,2})h(?:\s+(\d{1,2})m)?$/);
    if (!m || Number(m[2] || 0) >= 60) return null;
    return Number(m[1]) * 60 + Number(m[2] || 0);
  }
  function food(f, index) {
    check(f && typeof f === "object");
    const portion = f.portion && number(f.portion.amount) !== null && typeof f.portion.unit === "string" ? { amount: f.portion.amount, unit: text(f.portion.unit, 32) } : number(f.g) !== null ? { amount: f.g, unit: "g" } : null;
    return { id: text(f.id, 100) || "legacy-position-" + index, name: text(f.name), meal: ["breakfast", "lunch", "dinner", "snack"].includes(f.slot) ? f.slot : f.snack ? "snack" : null, portion, nutrition: Object.fromEntries(nutrients.map((k) => [k, number(f[k])])), source: ["manual", "barcode", "common", "estimate", "copy", "cipher-inbox"].includes(f.source) ? f.source : null, estimated: f.provenance?.estimated === true || f.source === "estimate", gaps: portion ? [] : ["amount_unavailable"] };
  }
  function totals(foods) {
    return Object.fromEntries(nutrients.map((k) => {
      const known = foods.map((f) => f.nutrition[k]).filter((x) => x !== null), unknown = foods.length - known.length;
      return [k, { knownSum: known.length ? round(known.reduce((a, b) => a + b, 0)) : null, complete: foods.length > 0 && unknown === 0, unknownEntries: unknown }];
    }));
  }
  function project(input) {
    check(input && input.state && typeof input.state === "object");
    const state = input.state;
    check(state.days && typeof state.days === "object" && !Array.isArray(state.days));
    check(Number.isSafeInteger(input.diaryRev) && input.diaryRev >= 0 && Number.isSafeInteger(input.publisherSequence) && input.publisherSequence > 0);
    check(Number.isFinite(input.diaryUpdatedAt) && input.diaryUpdatedAt >= 0);
    const targets = Object.fromEntries(["kcalTarget", "proteinTarget", "fibreTarget", "stepsTarget"].map((k) => [k, number(state.profile?.[k])]));
    const weights = /* @__PURE__ */ new Map();
    for (const w of state.weights || []) {
      check(validDate(w.date));
      const kg = number(w.kg);
      if (kg === null) continue;
      const ts = typeof w.at === "number" && Number.isFinite(w.at) ? w.at : null;
      const existing = weights.get(w.date);
      if (!existing || ts !== null && (existing.measuredAt === null || ts >= existing.measuredAt)) weights.set(w.date, { kg, measuredAt: ts, timing: ts === null ? "daily_value_timestamp_unavailable" : "latest_timestamp" });
    }
    const training = /* @__PURE__ */ new Map();
    for (const w of state.workouts || []) {
      check(validDate(w.date) && Array.isArray(w.sets) && w.sets.length <= 200);
      const entry = { id: text(w.id, 100), exercise: text(w.exercise), unit: ["kg", "lbs"].includes(w.unit) ? w.unit : null, equipment: text(w.eq, 32), timed: w.t === 1, sets: w.sets.map((s) => ({ weight: number(s.w), reps: number(s.r) })) };
      if (!training.has(w.date)) training.set(w.date, []);
      training.get(w.date).push(entry);
    }
    const dates = [.../* @__PURE__ */ new Set([...Object.keys(state.days), ...weights.keys(), ...training.keys()])].sort();
    check(dates.length <= 1e4, "snapshot_capacity", 413);
    const days = dates.map((date) => {
      check(validDate(date));
      const d = state.days[date] || {};
      check(!d.foods || Array.isArray(d.foods));
      check((d.foods || []).length <= 500, "day_capacity", 413);
      const foods = (d.foods || []).map(food), raw = d.ring || {}, ring = Object.fromEntries(ringKeys.map((k) => [k, k === "temperature_deviation" && typeof raw[k] === "number" && Number.isFinite(raw[k]) ? raw[k] : number(raw[k])]));
      ring.totalSleepRaw = text(raw.total_sleep, 32);
      ring.sleepMinutes = duration(ring.totalSleepRaw);
      ring.timeInBedRaw = text(raw.time_in_bed, 32);
      return { date, logged: foods.length > 0, foods, totals: totals(foods), weight: weights.get(date) || null, steps: number(raw.steps) ?? number(d.steps), ring, training: training.get(date) || [] };
    });
    return { schemaVersion: 1, timeZone: "Europe/London", diaryRev: input.diaryRev, diaryUpdatedAt: input.diaryUpdatedAt, publisherSequence: input.publisherSequence, targets, targetsBasis: "current_at_snapshot", days };
  }

  // read-access/publisher.mjs
  var SnapshotPublisher = class {
    constructor({ storage, send, status = () => {
    } }) {
      this.storage = storage;
      this.send = send;
      this.status = status;
      this.busy = false;
    }
    async accepted(envelope, sequence = null) {
      if (this.busy) {
        this.status("Read snapshot pending \u2014 retry after sync");
        return false;
      }
      this.busy = true;
      try {
        const previous = JSON.parse(this.storage.getItem("form-brb-read-publisher-state-v1") || "null");
        const seq = sequence ?? (previous?.sequence || 0) + 1;
        const input = { state: envelope.state, diaryRev: envelope.rev, diaryUpdatedAt: envelope.updatedAt, publisherSequence: seq };
        const clean = project(input);
        const filtered = { diaryRev: clean.diaryRev, diaryUpdatedAt: clean.diaryUpdatedAt, publisherSequence: clean.publisherSequence, state: { profile: clean.targets, days: Object.fromEntries(clean.days.map((d) => [d.date, { foods: d.foods.map((f) => ({ id: f.id, name: f.name, slot: f.meal, portion: f.portion, ...f.nutrition, source: f.source, provenance: { estimated: f.estimated } })), steps: d.steps, ring: { ...d.ring, total_sleep: d.ring.totalSleepRaw, time_in_bed: d.ring.timeInBedRaw } }])), weights: clean.days.filter((d) => d.weight).map((d) => ({ date: d.date, kg: d.weight.kg, at: d.weight.measuredAt })), workouts: clean.days.flatMap((d) => d.training.map((w) => ({ id: w.id, date: d.date, exercise: w.exercise, unit: w.unit, eq: w.equipment, t: w.timed ? 1 : 0, sets: w.sets.map((x) => ({ w: x.weight, r: x.reps })) }))) } };
        await this.send(filtered);
        this.storage.setItem("form-brb-read-publisher-state-v1", JSON.stringify({ sequence: seq, diaryRev: envelope.rev }));
        this.status("Read snapshot updated");
        return true;
      } catch {
        this.status("Read snapshot pending \u2014 diary sync is unaffected");
        return false;
      } finally {
        this.busy = false;
      }
    }
  };
  return __toCommonJS(publisher_exports);
})();

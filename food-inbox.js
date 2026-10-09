var FORM_FOOD_INBOX = (() => {
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

  // inbox/importer.mjs
  var importer_exports = {};
  __export(importer_exports, {
    InboxImporter: () => InboxImporter,
    QUEUE_KEY: () => QUEUE_KEY,
    mergeImportedMarkers: () => mergeImportedMarkers
  });
  var clone = (x) => JSON.parse(JSON.stringify(x));
  var QUEUE_KEY = "form-brb-inbox-queue-v1";
  var InboxImporter = class {
    constructor(storage) {
      this.storage = storage;
      this.busy = false;
    }
    queue() {
      const raw = this.storage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) throw Error("Inbox queue needs recovery");
      return items;
    }
    stage(items) {
      const existing = this.queue(), map = new Map(existing.map((x) => [x.id, x]));
      for (const item of items) {
        if (item.expired || !item.food) throw Error("An inbox entry expired before import \u2014 review required");
        if (!/^inbox-[0-9a-f-]{36}$/i.test(item.id) || item.id !== "inbox-" + item.food.submissionId) throw Error("Inbox entry invalid");
        if (map.has(item.id) && JSON.stringify(map.get(item.id)) !== JSON.stringify(item)) throw Error("Inbox entry conflict");
        map.set(item.id, item);
      }
      const out = [...map.values()];
      this.storage.setItem(QUEUE_KEY, JSON.stringify(out));
      return out;
    }
    merge(state) {
      const next = clone(state), seen = new Set(next.foodInboxImportedIds || []);
      next.days ??= {};
      for (const item of this.queue()) {
        const f = item.food;
        if (seen.has(item.id)) continue;
        const already = Object.values(next.days).some((d) => d.foods?.some((x) => x.id === item.id));
        if (!already && !(next.deletedIds || []).includes(item.id)) {
          next.days[f.date] ??= {};
          next.days[f.date].foods ??= [];
          next.days[f.date].foods.push({ id: item.id, name: f.name, ...f.nutrition, slot: f.slot, snack: f.slot === "snack", source: "cipher-inbox", portion: clone(f.portion), provenance: { estimated: f.estimate, basis: f.estimateBasis || "", inboxId: item.id } });
        }
        seen.add(item.id);
      }
      next.foodInboxImportedIds = [...seen];
      return next;
    }
    confirmedIds(envelope) {
      const s = envelope?.state;
      if (!s) return [];
      const seen = new Set(s.foodInboxImportedIds || []), deleted = new Set(s.deletedIds || []), foods = new Set(Object.values(s.days || {}).flatMap((d) => (d.foods || []).map((f) => f.id)));
      return this.queue().filter((x) => seen.has(x.id) && (foods.has(x.id) || deleted.has(x.id))).map((x) => x.id);
    }
    drop(ids) {
      const remove = new Set(ids);
      this.storage.setItem(QUEUE_KEY, JSON.stringify(this.queue().filter((x) => !remove.has(x.id))));
    }
    async open({ fetchPending, getState, saveLocal, sync, status }) {
      if (this.busy) return;
      this.busy = true;
      try {
        status("Checking food inbox\u2026");
        const items = await fetchPending();
        this.stage(items);
        const next = this.merge(getState());
        saveLocal(next);
        status(this.queue().length ? "Inbox foods saved on this phone \u2014 awaiting sync" : "Food inbox checked");
        await sync();
      } catch {
        status("Food inbox import paused \u2014 pending entries kept. Retry on next open.");
      } finally {
        this.busy = false;
      }
    }
    async acknowledge(envelope, ack) {
      const ids = this.confirmedIds(envelope);
      if (!ids.length) return;
      await ack(ids);
      this.drop(ids);
    }
  };
  function mergeImportedMarkers(local, remote) {
    return [.../* @__PURE__ */ new Set([...remote?.foodInboxImportedIds || [], ...local?.foodInboxImportedIds || []])];
  }
  return __toCommonJS(importer_exports);
})();

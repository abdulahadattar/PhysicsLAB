// src/data/fun-facts-util.ts
// Utility for serving unique fun facts per user (by login or guest ID)

import funFacts from "./fun-facts.json";

// Helper: get or generate a guest ID
export function getGuestId() {
  let id: string | null = null;
  try {
    id = localStorage.getItem("guest_id");
  } catch (e) {
    console.error('Error reading guest_id from localStorage:', e);
  }
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 12);
    try {
      localStorage.setItem("guest_id", id);
    } catch (e) {
      console.error('Error writing guest_id to localStorage:', e);
    }
  }
  return id;
}

// Helper: get shown fact indices for a user/guest
function getShownFactIndices(userId: string) {
  const key = `shown_facts_${userId}`;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch (e) {
    console.error('Error reading shown_facts from localStorage:', e);
  }
  return raw ? JSON.parse(raw) : [];
}

// Helper: set shown fact indices for a user/guest
function setShownFactIndices(userId: string, indices: number[]) {
  const key = `shown_facts_${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(indices));
  } catch (e) {
    console.error('Error writing shown_facts to localStorage:', e);
  }
}

// Main: get a new, unseen fun fact for the user/guest
export function getNextFunFactForUser(userId: string) {
  const shown = getShownFactIndices(userId);
  const unseen = funFacts
    .map((fact, idx) => ({ ...fact, _idx: idx }))
    .filter(f => !shown.includes(f._idx));
  if (unseen.length === 0) {
    // Reset if all have been shown
    setShownFactIndices(userId, []);
    return getNextFunFactForUser(userId);
  }
  // Pick a random unseen fact
  const next = unseen[Math.floor(Math.random() * unseen.length)];
  setShownFactIndices(userId, [...shown, next._idx]);
  // Remove _idx before returning
  const { _idx, ...fact } = next;
  return fact;
}

import { randomUUID } from 'node:crypto';

const jobs = new Map();
const TTL_MS = 1000 * 60 * 30;

export function createJob() {
  const id = randomUUID();
  jobs.set(id, {
    id,
    status: 'processing',
    progress: 0,
    srt: null,
    error: null,
    stage: 'En cola…',
    createdAt: Date.now(),
  });
  setTimeout(() => jobs.delete(id), TTL_MS);
  return id;
}

export function getJob(id) {
  return jobs.get(id);
}

export function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, patch);
}

export function failJob(id, message) {
  updateJob(id, { status: 'error', error: message });
}
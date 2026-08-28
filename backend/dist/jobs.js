"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJob = updateJob;
const jobs = new Map();
function createJob(url, filename) {
    const id = crypto.randomUUID();
    const job = {
        id,
        url,
        filename,
        status: "pending",
        progress: 0
    };
    jobs.set(id, job);
    return job;
}
function getJob(id) {
    return jobs.get(id);
}
function updateJob(id, updates) {
    const job = jobs.get(id);
    if (!job) {
        return;
    }
    Object.assign(job, updates);
}

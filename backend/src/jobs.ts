export type DownloadStatus =
  | "pending"
  | "downloading"
  | "completed"
  | "error";

export interface DownloadJob {
  id: string;
  url: string;
  filename: string;
  status: DownloadStatus;
  progress: number;
  filePath?: string;
  error?: string;
}

const jobs = new Map<string, DownloadJob>();

export function createJob(
  url: string,
  filename: string
): DownloadJob {

  const id = crypto.randomUUID();

  const job: DownloadJob = {
    id,
    url,
    filename,
    status: "pending",
    progress: 0
  };

  jobs.set(id, job);

  return job;
}

export function getJob(
  id: string
): DownloadJob | undefined {

  return jobs.get(id);
}

export function updateJob(
  id: string,
  updates: Partial<DownloadJob>
): void {

  const job = jobs.get(id);

  if (!job) {
    return;
  }

  Object.assign(job, updates);
}
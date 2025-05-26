import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { error } = req.body;
  if (!error) {
    res.status(400).json({ error: 'No error message provided' });
    return;
  }
  const logPath = path.resolve(process.cwd(), 'debug-log.txt');
  try {
    fs.appendFileSync(logPath, error + '\n');
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write to log file' });
  }
}

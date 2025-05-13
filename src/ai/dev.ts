
import { config } from 'dotenv';
config();

import '@/ai/flows/provide-resume-suggestions.ts';
import '@/ai/flows/extract-resume-text.ts';
import '@/ai/flows/calculate-ats-score.ts';

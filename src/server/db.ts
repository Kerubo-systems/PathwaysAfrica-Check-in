import fs from 'fs';
import path from 'path';

export interface CheckinRecord {
  id: string;
  identify: boolean;
  name: string;
  email: string;
  feeling: string; // 'Excited' | 'Motivated' | 'Okay' | 'Overwhelmed' | 'Burnt Out'
  feelingDetail: string;
  confidence: number; // 1 to 10
  stressAreas: string[];
  otherStressArea: string;
  supportNeeds: string[];
  otherSupportNeed: string;
  aboutYourself: string;
  mindShare: string;
  weeklyWin: string;
  cohort: string; // 'Cohort 1' | 'Cohort 2' | 'Cohort 3' | 'Other'
  module: string; // 'Module 1' | 'Module 2' | 'Module 3' | 'Other'
  createdAt: string; // ISO String
  isDeleted: boolean; // Soft delete support
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'checkins.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export interface AppConfig {
  cohorts: string[];
  modules: string[];
}

export function initializeConfig(): AppConfig {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultConfig: AppConfig = {
    cohorts: ['Cohort 1', 'Cohort 2', 'Cohort 3'],
    modules: ['Module 1', 'Module 2', 'Module 3']
  };

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading config.json, returning default...', e);
    }
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  return defaultConfig;
}

export function saveConfig(config: AppConfig): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// Helper to ensure data file exists and is seeded
export function initializeDb(): CheckinRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading checkins.json, recreating...', e);
    }
  }

  // Seed data - start with seeded records so the platform has active data
  const seedRecords = generateSeedData();
  saveDb(seedRecords);
  return seedRecords;
}

export function saveDb(records: CheckinRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function generateSeedData(): CheckinRecord[] {
  const feelings = ['Excited', 'Motivated', 'Okay', 'Overwhelmed', 'Burnt Out'];
  const names = ['Kofi', 'Amina', 'Chinedu', 'Zola', 'Tariq', 'Fatoumata', 'Jabari', 'Nia', 'Tendai', 'Makena'];
  const emails = [
    'kofi.o@example.com', 'amina.d@example.com', 'chinedu.u@example.com', 
    'zola.m@example.com', 'tariq.s@example.com', 'fatoumata.b@example.com',
    'jabari.n@example.com', 'nia.t@example.com', 'tendai.c@example.com', 'makena.w@example.com'
  ];

  const essayComments = [
    'Struggling to make my personal statement sound authentic.',
    'I finished my first draft of Common App essay! Now looking at supplementals.',
    'Just started brainstorming, feeling a bit lost about what to write.',
    'Really stressed about balancing my studies with drafting 5 different essays.',
    'The essay prompt for Stanford is quite challenging.'
  ];

  const weeklyWins = [
    'Reaching out to my English teacher for the letter of recommendation!',
    'Finished the first full draft of my personal statement.',
    'Completed my Extracurricular list in Common App.',
    'I set up my application checklist spreadsheet and feel much more organized.',
    'I spent 2 hours writing on Saturday without checking my phone!',
    'Had a great conversation with a university alum.',
    'Registered for my SAT/ACT exam after saving up for the fee.',
    'Finally drafted my main activities list paragraphs.'
  ];

  const stressTopics = [
    ['Personal Statement', 'Supplemental Essays', 'Time Management'],
    ['Financial Aid', 'Time Management'],
    ['SAT/ACT', 'Motivation'],
    ['Recommendation Letters', 'Supplemental Essays'],
    ['Financial Aid', 'Activities List', 'Motivation'],
    ['Personal Statement', 'Balancing Responsibilities'],
    ['SAT/ACT', 'Time Management', 'Balancing Responsibilities'],
  ];

  const supportNeedsTopics = [
    ['Essay review', 'Application planning'],
    ['Financial aid support', 'General advice'],
    ['Essay brainstorming session', 'Study accountability'],
    ['Time management guidance', 'Application planning'],
    ['Essay review', 'Motivation'],
  ];

  const records: CheckinRecord[] = [];
  const baseTime = new Date('2026-06-01T10:00:00Z').getTime();
  const nowTime = new Date('2026-07-02T11:00:00Z').getTime();
  const timeStep = (nowTime - baseTime) / 30; // 30 entries staggered over June

  for (let i = 0; i < 30; i++) {
    const recordTime = new Date(baseTime + i * timeStep);
    const identify = Math.random() > 0.4;
    const nameIdx = i % names.length;
    const feeling = feelings[i % feelings.length];
    
    // Set realistic confidence based on feeling
    let confidence = 5;
    if (feeling === 'Excited') confidence = 8 + (i % 3);
    else if (feeling === 'Motivated') confidence = 7 + (i % 3);
    else if (feeling === 'Okay') confidence = 5 + (i % 2);
    else if (feeling === 'Overwhelmed') confidence = 3 + (i % 2);
    else if (feeling === 'Burnt Out') confidence = 1 + (i % 3);

    const cohortsList = ['Cohort 1', 'Cohort 2', 'Cohort 3'];
    const modulesList = ['Module 1', 'Module 2', 'Module 3'];
    const cohortVal = cohortsList[i % cohortsList.length];
    const moduleVal = modulesList[i % modulesList.length];

    records.push({
      id: `checkin_${1000 + i}`,
      identify,
      name: identify ? names[nameIdx] : '',
      email: identify ? emails[nameIdx] : '',
      feeling,
      feelingDetail: feeling === 'Overwhelmed' || feeling === 'Burnt Out' || Math.random() > 0.5 
        ? essayComments[i % essayComments.length] 
        : '',
      confidence,
      stressAreas: stressTopics[i % stressTopics.length],
      otherStressArea: '',
      supportNeeds: supportNeedsTopics[i % supportNeedsTopics.length],
      otherSupportNeed: '',
      aboutYourself: identify && Math.random() > 0.5 ? 'I love reading historical fiction and playing volleyball.' : '',
      mindShare: Math.random() > 0.6 ? 'Thank you to the mentors for always being so supportive!' : '',
      weeklyWin: weeklyWins[i % weeklyWins.length],
      cohort: cohortVal,
      module: moduleVal,
      createdAt: recordTime.toISOString(),
      isDeleted: false
    });
  }

  return records;
}

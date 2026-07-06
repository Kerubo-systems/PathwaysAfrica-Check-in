import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeDb, saveDb, CheckinRecord, initializeConfig, saveConfig } from './db';
import { calculateAnalytics } from './analytics';
import { generateToken, authMiddleware, AuthenticatedRequest, comparePassword, hashPassword } from './auth';

const router = Router();

// Zod schema for input validation
const checkinInputSchema = z.object({
  identify: z.boolean().default(false),
  name: z.string().max(100).nullish().transform(val => val ?? ''),
  email: z.string().max(150).nullish().transform(val => val ?? '').refine(val => {
    const trimmed = val.trim();
    return trimmed === '' || z.string().email().safeParse(trimmed).success;
  }, {
    message: "Invalid email format"
  }),
  feeling: z.enum(['Excited', 'Motivated', 'Okay', 'Overwhelmed', 'Burnt Out']),
  feelingDetail: z.string().max(1000).nullish().transform(val => val ?? ''),
  confidence: z.coerce.number().min(1).max(10, { message: "Confidence must be between 1 and 10" }),
  stressAreas: z.array(z.string()).min(1, { message: "Please select at least one stress area" }),
  otherStressArea: z.string().max(500).nullish().transform(val => val ?? ''),
  supportNeeds: z.array(z.string()).min(1, { message: "Please select at least one support need" }),
  otherSupportNeed: z.string().max(500).nullish().transform(val => val ?? ''),
  aboutYourself: z.string().max(1000).nullish().transform(val => val ?? ''),
  mindShare: z.string().max(2000).nullish().transform(val => val ?? ''),
  weeklyWin: z.string().max(2000).nullish().transform(val => val ?? '').refine(val => val.trim().length > 0, {
    message: "Weekly win is compulsory"
  }),
  cohort: z.string().max(100).nullish().transform(val => val ?? 'Cohort 1'),
  module: z.string().max(100).nullish().transform(val => val ?? 'Module 1'),
});

const ADMINS_FILE = path.join(process.cwd(), 'data', 'admins.json');

const defaultAdmins: any[] = [
  { id: 'coordinator', name: 'Kiera Fanning', email: 'KieraFanning', password: 'admin123', role: 'General Administrator', cohortAccess: 'all', isDisabled: false },
  { id: 'ashley', name: 'Ashley Kerubo', email: 'ashleykerubo77@gmail.com', password: 'admin123', role: 'General Administrator', cohortAccess: 'all', isDisabled: false },
  { id: 'cohort1', name: 'Cohort 1 Admin', email: 'cohort1', password: 'admin123', role: 'Cohort Administrator', cohortAccess: 'Cohort 1', isDisabled: false },
  { id: 'cohort2', name: 'Cohort 2 Admin', email: 'cohort2', password: 'admin123', role: 'Cohort Administrator', cohortAccess: 'Cohort 2', isDisabled: false },
  { id: 'cohort3', name: 'Cohort 3 Admin', email: 'cohort3', password: 'admin123', role: 'Cohort Administrator', cohortAccess: 'Cohort 3', isDisabled: false }
];

// Helper to check if a password is a bcrypt hash
const isBcryptHash = (str: string) => str.startsWith('$2a$') || str.startsWith('$2b$');

function getAdminsList() {
  const dataDir = path.dirname(ADMINS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const fileExists = fs.existsSync(ADMINS_FILE);
  let list = defaultAdmins;
  if (fileExists) {
    try {
      const parsed = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        list = parsed.filter((a: any) => a !== null && typeof a === 'object');
      }
    } catch (e) {
      console.error('Error reading admins.json', e);
    }
  }

  let modified = false;

  // Only seed default accounts if the file didn't exist at all,
  // which avoids re-seeding explicitly deleted custom/seed administrator accounts.
  if (!fileExists) {
    list = defaultAdmins.map(def => ({
      ...def,
      password: bcrypt.hashSync(def.password, 10),
      createdAt: new Date().toISOString()
    }));
    modified = true;
  } else {
    // Just ensure the remaining items have encrypted passwords and necessary fields
    list.forEach((adm: any, idx: number) => {
      let itemModified = false;
      if (!adm.role) {
        adm.role = adm.cohortAccess === 'all' ? 'General Administrator' : 'Cohort Administrator';
        itemModified = true;
      }
      if (!adm.cohortAccess) {
        adm.cohortAccess = 'all';
        itemModified = true;
      }
      if (adm.isDisabled === undefined) {
        adm.isDisabled = false;
        itemModified = true;
      }
      if (!isBcryptHash(adm.password)) {
        adm.password = bcrypt.hashSync(adm.password, 10);
        itemModified = true;
      }
      if (itemModified) {
        list[idx] = adm;
        modified = true;
      }
    });
  }

  if (modified || !fileExists) {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  }
  return list;
}

function saveAdminsList(list: any[]) {
  const dataDir = path.dirname(ADMINS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// 0. Get Dynamic App Configuration (Cohorts and Modules)
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = initializeConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch configuration.' });
  }
});

// Post dynamic configurations
router.post('/config/cohorts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privileges required.' });
  }
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid cohort name.' });
  }

  const config = initializeConfig();
  if (config.cohorts.map(c => c.toLowerCase()).includes(name.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Cohort already exists.' });
  }

  config.cohorts.push(name.trim());
  saveConfig(config);
  res.status(201).json({ success: true, message: 'Cohort added successfully!', data: config });
});

router.post('/config/modules', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privileges required.' });
  }
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid module name.' });
  }

  const config = initializeConfig();
  if (config.modules.map(m => m.toLowerCase()).includes(name.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Module already exists.' });
  }

  config.modules.push(name.trim());
  saveConfig(config);
  res.status(201).json({ success: true, message: 'Module added successfully!', data: config });
});

router.delete('/config/cohorts/:name', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privileges required.' });
  }
  const { name } = req.params;
  const config = initializeConfig();
  const filtered = config.cohorts.filter(c => c.toLowerCase() !== name.toLowerCase());
  
  if (filtered.length === config.cohorts.length) {
    return res.status(404).json({ success: false, message: 'Cohort not found.' });
  }

  config.cohorts = filtered;
  saveConfig(config);
  res.json({ success: true, message: 'Cohort deleted successfully.', data: config });
});

router.delete('/config/modules/:name', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privileges required.' });
  }
  const { name } = req.params;
  const config = initializeConfig();
  const filtered = config.modules.filter(m => m.toLowerCase() !== name.toLowerCase());

  if (filtered.length === config.modules.length) {
    return res.status(404).json({ success: false, message: 'Module not found.' });
  }

  config.modules = filtered;
  saveConfig(config);
  res.json({ success: true, message: 'Module deleted successfully.', data: config });
});


// 1. Submit a check-in (Public)
router.post('/checkins', (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = checkinInputSchema.parse(req.body);
    const db = initializeDb();

    // Create a new record with metadata
    const newRecord: CheckinRecord = {
      id: `checkin_${Date.now()}`,
      identify: !!validatedData.identify,
      name: validatedData.name ?? '',
      email: validatedData.email ?? '',
      feeling: validatedData.feeling,
      feelingDetail: validatedData.feelingDetail ?? '',
      confidence: validatedData.confidence,
      stressAreas: validatedData.stressAreas,
      otherStressArea: validatedData.otherStressArea ?? '',
      supportNeeds: validatedData.supportNeeds,
      otherSupportNeed: validatedData.otherSupportNeed ?? '',
      aboutYourself: validatedData.aboutYourself ?? '',
      mindShare: validatedData.mindShare ?? '',
      weeklyWin: validatedData.weeklyWin,
      cohort: validatedData.cohort ?? 'Cohort 1',
      module: validatedData.module ?? 'Module 1',
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    db.push(newRecord);
    saveDb(db);

    res.status(201).json({
      success: true,
      message: 'Check-in successfully submitted!',
      data: { id: newRecord.id }
    });
  } catch (error) {
    next(error);
  }
});

// 1.5. Public stats for landing page community counter
router.get('/public/stats', (req: Request, res: Response) => {
  try {
    const db = initializeDb();
    const activeSubmissions = db.filter(r => !r.isDeleted);
    res.json({
      success: true,
      totalCount: activeSubmissions.length
    });
  } catch (error) {
    res.status(500).json({ success: false, totalCount: 0 });
  }
});

// Enforce Role-Based Cohort Constraints
function getCohortFilterForUser(user: any, requestedCohort: string): string {
  if (!user) {
    return requestedCohort || 'all';
  }
  if (user.role === 'Cohort Administrator') {
    // Cohort admin can ONLY view their assigned cohort
    return user.cohortAccess || 'all';
  }
  return requestedCohort || 'all';
}

// 2. Admin dashboard summary metrics (Protected)
router.get('/dashboard/summary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = initializeDb();
  const requestedCohort = req.query.cohort as string;
  const enforcedCohort = getCohortFilterForUser(req.user, requestedCohort);

  let filteredDb = db;
  if (enforcedCohort && enforcedCohort !== 'all') {
    filteredDb = db.filter(r => r.cohort === enforcedCohort);
  }
  const summary = calculateAnalytics(filteredDb);

  // If coordinator is viewing 'all', compile a dynamic cohort comparative breakdown
  let cohortSummaries = undefined;
  if (enforcedCohort === 'all') {
    const config = initializeConfig();
    cohortSummaries = config.cohorts.map(cohortName => {
      const cohortRecords = db.filter(r => r.cohort === cohortName);
      const cohortAnalytics = calculateAnalytics(cohortRecords);
      return {
        cohort: cohortName,
        totalCount: cohortAnalytics.totalCount,
        averageConfidence: cohortAnalytics.averageConfidence,
        topStressArea: cohortAnalytics.topStressAreas[0]?.area || 'N/A',
        topSupportNeed: cohortAnalytics.topSupportNeeds[0]?.need || 'N/A',
        moodDistribution: cohortAnalytics.moodDistribution,
      };
    });
  }

  res.json({
    success: true,
    data: {
      ...summary,
      cohortSummaries
    }
  });
});

// 3. Admin dashboard submissions list (with filtering, pagination, and sorting) (Protected)
router.get('/dashboard/submissions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = initializeDb();
  let activeSubmissions = db.filter(r => !r.isDeleted);

  const requestedCohort = req.query.cohort as string;
  const enforcedCohort = getCohortFilterForUser(req.user, requestedCohort);

  // Sorting logic (default: newest first)
  const sortBy = req.query.sortBy === 'confidence' ? 'confidence' : 'createdAt';
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  activeSubmissions.sort((a, b) => {
    if (sortBy === 'confidence') {
      return order === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence;
    } else {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  // Filtering by cohort boundary
  if (enforcedCohort && enforcedCohort !== 'all') {
    activeSubmissions = activeSubmissions.filter(r => r.cohort === enforcedCohort);
  }

  // Filtering by feeling
  if (req.query.feeling) {
    activeSubmissions = activeSubmissions.filter(r => r.feeling === req.query.feeling);
  }

  // Filtering by identity choice
  if (req.query.identify !== undefined) {
    const mustIdentify = req.query.identify === 'true';
    activeSubmissions = activeSubmissions.filter(r => r.identify === mustIdentify);
  }

  // Search filter
  if (req.query.search) {
    const searchStr = String(req.query.search).toLowerCase();
    activeSubmissions = activeSubmissions.filter(r => 
      (r.identify && r.name.toLowerCase().includes(searchStr)) || 
      r.feelingDetail.toLowerCase().includes(searchStr) ||
      r.weeklyWin.toLowerCase().includes(searchStr)
    );
  }

  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const total = activeSubmissions.length;
  const paginatedSubmissions = activeSubmissions.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      submissions: paginatedSubmissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// 4. Retrieve trends analytics (separately, for graph layouts) (Protected)
router.get('/dashboard/trends', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = initializeDb();
  const requestedCohort = req.query.cohort as string;
  const enforcedCohort = getCohortFilterForUser(req.user, requestedCohort);

  let filteredDb = db;
  if (enforcedCohort && enforcedCohort !== 'all') {
    filteredDb = db.filter(r => r.cohort === enforcedCohort);
  }
  const summary = calculateAnalytics(filteredDb);
  res.json({
    success: true,
    data: {
      confidenceOverTime: summary.confidenceOverTime,
      weeklyActivity: summary.weeklyActivity,
      moodDistribution: summary.moodDistribution
    }
  });
});

// 5. Soft-delete a submission (Protected)
router.delete('/checkins/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = initializeDb();
  const index = db.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Submission with ID ${id} not found.`
    });
  }

  // Enforce boundary: Cohort Admins can only delete check-ins of their cohort
  if (req.user?.role === 'Cohort Administrator' && db[index].cohort !== req.user?.cohortAccess) {
    return res.status(403).json({ success: false, message: 'Access denied. You can only delete your cohort submissions.' });
  }

  // Soft delete
  db[index].isDeleted = true;
  saveDb(db);

  res.json({
    success: true,
    message: 'Submission successfully soft-deleted.'
  });
});

// 5.5 Clear all submissions for a cohort (Protected)
router.post('/admin/clear-cohort', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = initializeDb();
  let cohortToClear: string | null = null;
  
  if (req.user?.role === 'Cohort Administrator') {
    cohortToClear = req.user.cohortAccess;
  } else if (req.user?.role === 'General Administrator') {
    cohortToClear = req.body.cohort;
  }

  if (!cohortToClear) {
    return res.status(400).json({ success: false, message: 'Invalid cohort target.' });
  }

  let updatedCount = 0;
  const updatedDb = db.map(record => {
    if (record.cohort === cohortToClear && !record.isDeleted) {
      updatedCount++;
      return { ...record, isDeleted: true };
    }
    return record;
  });

  saveDb(updatedDb);
  res.json({
    success: true,
    message: `Successfully cleared ${updatedCount} submissions for "${cohortToClear}".`
  });
});

// 5.6 Wipe the entire check-ins database (Protected - General Administrator only)
router.post('/admin/wipe-database', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Access denied. Only General Administrators can wipe the entire database.' });
  }

  const db = initializeDb();
  const updatedDb = db.map(record => ({ ...record, isDeleted: true }));
  saveDb(updatedDb);

  res.json({
    success: true,
    message: 'The entire database of check-ins has been successfully wiped.'
  });
});

// 6. Admin Authentication Login (Public)
router.post('/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email/username and password.' });
  }

  const customAdmins = getAdminsList();
  const matched = customAdmins.find(
    (a: any) => a.email.toLowerCase() === email.toLowerCase() || a.name.toLowerCase() === email.toLowerCase()
  );

  if (!matched) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
  }

  if (matched.isDisabled) {
    return res.status(403).json({ success: false, message: 'This account has been disabled. Please contact the main coordinator.' });
  }

  const isMatch = await comparePassword(password, matched.password);
  if (isMatch) {
    const userPayload = {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role || (matched.cohortAccess === 'all' ? 'General Administrator' : 'Cohort Administrator') as any,
      cohortAccess: matched.cohortAccess || 'all'
    };

    const token = generateToken(userPayload);

    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      user: userPayload
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please try again.'
    });
  }
});

// 6.5. Admin Change Password (Protected)
router.post('/admin/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.user?.email;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide old password and new password.' });
  }

  const customAdmins = getAdminsList();
  const adminIndex = customAdmins.findIndex(
    (a: any) => a.email.toLowerCase() === username?.toLowerCase()
  );

  if (adminIndex === -1) {
    return res.status(404).json({ success: false, message: 'Admin profile not found.' });
  }

  const admin = customAdmins[adminIndex];
  const isMatch = await comparePassword(oldPassword, admin.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Incorrect current password.' });
  }

  admin.password = await hashPassword(newPassword);
  customAdmins[adminIndex] = admin;
  saveAdminsList(customAdmins);

  res.json({
    success: true,
    message: 'Password successfully updated!'
  });
});

// 7. Get Administrators list (Protected)
router.get('/admin/list', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // Only General Admins can view other administrators profiles
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privilege required.' });
  }

  const customAdmins = getAdminsList();
  // Safe returned properties (do not send real raw hashes unless masked or as placeholder)
  const safeList = customAdmins.map((a: any) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role || (a.cohortAccess === 'all' ? 'General Administrator' : 'Cohort Administrator'),
    cohortAccess: a.cohortAccess || 'all',
    isDisabled: !!a.isDisabled,
    createdAt: a.createdAt
  }));

  res.json({
    success: true,
    admins: safeList
  });
});

// 8. Add a new Administrator (Protected)
router.post('/admin/add', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privilege required.' });
  }

  const { name, email, password, role, cohortAccess } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
  }

  const customAdmins = getAdminsList();
  if (customAdmins.some((a: any) => a.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'An administrator with this email already exists.' });
  }

  const securedPassword = await hashPassword(password);
  const newAdmin = {
    id: `admin_${Date.now()}`,
    name,
    email,
    password: securedPassword,
    role: role || 'Cohort Administrator',
    cohortAccess: cohortAccess || 'Cohort 1',
    isDisabled: false,
    createdAt: new Date().toISOString()
  };

  customAdmins.push(newAdmin);
  saveAdminsList(customAdmins);

  res.status(201).json({
    success: true,
    message: 'Administrator added successfully!',
    admin: { name: newAdmin.name, email: newAdmin.email }
  });
});

// 8.5. Toggle Disabled Status of an Administrator (Protected)
router.post('/admin/toggle-status/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privilege required.' });
  }

  const { id } = req.params;
  const customAdmins = getAdminsList();
  const index = customAdmins.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Administrator not found.' });
  }

  // Prevent primary coordinators from disabling themselves
  if (customAdmins[index].email.toLowerCase() === 'kierafanning' || customAdmins[index].id === 'coordinator') {
    return res.status(400).json({ success: false, message: 'The primary general administrator cannot be disabled.' });
  }

  customAdmins[index].isDisabled = !customAdmins[index].isDisabled;
  saveAdminsList(customAdmins);

  res.json({
    success: true,
    message: `Administrator ${customAdmins[index].isDisabled ? 'disabled' : 'enabled'} successfully.`,
    admin: { id, isDisabled: customAdmins[index].isDisabled }
  });
});

// 8.6. Edit Administrator Details (Protected)
router.post('/admin/edit/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privilege required.' });
  }

  const { id } = req.params;
  const { name, email, password, role, cohortAccess } = req.body;

  const customAdmins = getAdminsList();
  const index = customAdmins.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Administrator not found.' });
  }

  if (name) customAdmins[index].name = name;
  if (email) customAdmins[index].email = email;
  if (role) customAdmins[index].role = role;
  if (cohortAccess) customAdmins[index].cohortAccess = cohortAccess;
  
  if (password && password.trim()) {
    customAdmins[index].password = await hashPassword(password);
  }

  saveAdminsList(customAdmins);

  res.json({
    success: true,
    message: 'Administrator account updated successfully!'
  });
});

// 9. Delete a custom Administrator (Protected)
router.delete('/admin/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'General Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden. General admin privilege required.' });
  }

  const { id } = req.params;
  const customAdmins = getAdminsList();

  const toDelete = customAdmins.find((a: any) => a.id === id);
  if (toDelete && (toDelete.email.toLowerCase() === 'kierafanning' || toDelete.id === 'coordinator')) {
    return res.status(400).json({ success: false, message: 'The primary general administrator cannot be deleted.' });
  }

  const filtered = customAdmins.filter((a: any) => a.id !== id);

  if (filtered.length === customAdmins.length) {
    return res.status(404).json({ success: false, message: 'Administrator not found.' });
  }

  saveAdminsList(filtered);
  res.json({
    success: true,
    message: 'Administrator removed successfully.'
  });
});

export default router;

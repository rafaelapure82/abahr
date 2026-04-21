"use strict";
// ══════════════════════════════════════════════════════════════════════════════
//  ABA Talent Management – Database Seed
//  Creates: Super Admin + HR staff + sample org + leave policies + benefits
//  Run: npm run prisma:seed
// ══════════════════════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// ── helpers ──────────────────────────────────────────────────────────────────
const hash = (pw) => bcryptjs_1.default.hash(pw, 12);
let empCounter = 1;
const nextCode = () => `EMP-${String(empCounter++).padStart(4, '0')}`;
async function createUser(email, password, roleName, emp) {
    // Find the role
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role)
        throw new Error(`Role ${roleName} not found in database. Create roles first.`);
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: await hash(password),
            isActive: true,
            isEmailVerified: true,
            roles: {
                create: {
                    roleId: role.id,
                },
            },
        },
    });
    const employee = await prisma.employee.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            employeeCode: nextCode(),
            userId: user.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            jobTitle: emp.jobTitle,
            workPhone: emp.phone,
            gender: emp.gender ?? client_1.Gender.PREFER_NOT_TO_SAY,
            employmentType: client_1.EmploymentType.FULL_TIME,
            employmentStatus: client_1.EmploymentStatus.ACTIVE,
            hireDate: emp.hireDate ?? new Date('2023-01-01'),
            departmentId: emp.departmentId,
            positionId: emp.positionId,
            managerId: emp.managerId,
            baseSalary: emp.baseSalary ?? 60000,
            currency: 'USD',
            salaryFrequency: client_1.PayrollFrequency.MONTHLY,
        },
    });
    return { user, employee };
}
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🌱 Starting ABA Talent Management seed...\n');
    // ═══════════════════════════════════════
    // 0. ROLES & PERMISSIONS (RBAC Dinámico)
    // ═══════════════════════════════════════
    console.log('🔐 Setting up Roles and Permissions...');
    const resources = ['USER', 'EMPLOYEE', 'ROLE', 'PERMISSION', 'DEPARTMENT', 'LEAVE', 'PAYROLL', 'DOCUMENT', 'RECRUITMENT', 'ONBOARDING', 'PERFORMANCE', 'BENEFIT', 'AUDIT', 'SYSTEM'];
    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE', 'APPROVE', 'REJECT', 'EXPORT'];
    const allPermissions = [];
    // Create permissions for each resource/action
    for (const res of resources) {
        for (const act of actions) {
            const perm = await prisma.permission.upsert({
                where: { action_resource: { action: act, resource: res } },
                update: {},
                create: { action: act, resource: res, description: `Can ${act.toLowerCase()} ${res.toLowerCase()}` }
            });
            allPermissions.push({ action: act, resource: res });
        }
    }
    // Create Default Roles
    const roleNames = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'PAYROLL_ADMIN', 'RECRUITER', 'EMPLOYEE', 'VIEWER'];
    const createdRoles = {};
    for (const rName of roleNames) {
        const role = await prisma.role.upsert({
            where: { name: rName },
            update: {},
            create: { name: rName, description: `System ${rName} role`, isSystem: true }
        });
        createdRoles[rName] = role;
    }
    // Link SUPER_ADMIN to ALL MANAGE permissions
    const manageAllPerm = await prisma.permission.findFirst({ where: { action: 'MANAGE', resource: 'SYSTEM' } });
    if (manageAllPerm) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: createdRoles['SUPER_ADMIN'].id, permissionId: manageAllPerm.id } },
            update: {},
            create: { roleId: createdRoles['SUPER_ADMIN'].id, permissionId: manageAllPerm.id }
        });
    }
    // Link HR_ADMIN to Employee/Documents permissions
    const hrResources = ['EMPLOYEE', 'DOCUMENT', 'ONBOARDING', 'BENEFIT', 'LEAVE'];
    for (const res of hrResources) {
        const perms = await prisma.permission.findMany({ where: { resource: res, action: { in: ['CREATE', 'READ', 'UPDATE', 'APPROVE'] } } });
        for (const p of perms) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: createdRoles['HR_ADMIN'].id, permissionId: p.id } },
                update: {},
                create: { roleId: createdRoles['HR_ADMIN'].id, permissionId: p.id }
            });
        }
    }
    // ═══════════════════════════════════════
    // 1. OFFICE LOCATIONS
    // ═══════════════════════════════════════
    console.log('📍 Creating office locations...');
    const hq = await prisma.officeLocation.upsert({
        where: { code: 'HQ' },
        update: {},
        create: {
            name: 'Headquarters',
            code: 'HQ',
            address: '100 Corporate Blvd',
            city: 'Miami',
            country: 'US',
            timeZone: 'America/New_York',
            isHQ: true,
        },
    });
    await prisma.officeLocation.upsert({
        where: { code: 'LA' },
        update: {},
        create: {
            name: 'West Coast Office',
            code: 'LA',
            city: 'Los Angeles',
            country: 'US',
            timeZone: 'America/Los_Angeles',
        },
    });
    // ═══════════════════════════════════════
    // 2. DEPARTMENTS
    // ═══════════════════════════════════════
    console.log('🏢 Creating departments...');
    const hrDept = await prisma.department.upsert({
        where: { code: 'HR' },
        update: {},
        create: {
            name: 'Human Resources',
            code: 'HR',
            description: 'People, culture and talent management',
            color: '#22C55E',
        },
    });
    const techDept = await prisma.department.upsert({
        where: { code: 'TECH' },
        update: {},
        create: {
            name: 'Technology',
            code: 'TECH',
            description: 'Engineering, product and infrastructure',
            color: '#3B82F6',
        },
    });
    const financeDept = await prisma.department.upsert({
        where: { code: 'FIN' },
        update: {},
        create: {
            name: 'Finance',
            code: 'FIN',
            description: 'Accounting, payroll and financial planning',
            color: '#F59E0B',
        },
    });
    const salesDept = await prisma.department.upsert({
        where: { code: 'SALES' },
        update: {},
        create: {
            name: 'Sales & Marketing',
            code: 'SALES',
            description: 'Revenue generation and brand management',
            color: '#EC4899',
        },
    });
    const opsDept = await prisma.department.upsert({
        where: { code: 'OPS' },
        update: {},
        create: {
            name: 'Operations',
            code: 'OPS',
            description: 'Business operations and logistics',
            color: '#8B5CF6',
        },
    });
    // Sub-department example
    const frontendTeam = await prisma.department.upsert({
        where: { code: 'TECH-FE' },
        update: {},
        create: {
            name: 'Frontend Engineering',
            code: 'TECH-FE',
            parentId: techDept.id,
            color: '#60A5FA',
        },
    });
    const backendTeam = await prisma.department.upsert({
        where: { code: 'TECH-BE' },
        update: {},
        create: {
            name: 'Backend Engineering',
            code: 'TECH-BE',
            parentId: techDept.id,
            color: '#34D399',
        },
    });
    // ═══════════════════════════════════════
    // 3. POSITIONS
    // ═══════════════════════════════════════
    console.log('💼 Creating positions...');
    const positions = {};
    const positionData = [
        { code: 'HR-DIR', title: 'HR Director', dept: hrDept.id, min: 90000, max: 130000, level: 5 },
        { code: 'HR-MGR', title: 'HR Manager', dept: hrDept.id, min: 65000, max: 95000, level: 4 },
        { code: 'HR-SPEC', title: 'HR Specialist', dept: hrDept.id, min: 45000, max: 65000, level: 2 },
        { code: 'CTO', title: 'Chief Technology Officer', dept: techDept.id, min: 150000, max: 250000, level: 6 },
        { code: 'ENG-MGR', title: 'Engineering Manager', dept: techDept.id, min: 110000, max: 160000, level: 5 },
        { code: 'SEN-ENG', title: 'Senior Engineer', dept: backendTeam.id, min: 85000, max: 130000, level: 4 },
        { code: 'ENG', title: 'Software Engineer', dept: backendTeam.id, min: 65000, max: 95000, level: 3 },
        { code: 'FE-ENG', title: 'Frontend Engineer', dept: frontendTeam.id, min: 65000, max: 95000, level: 3 },
        { code: 'CFO', title: 'Chief Financial Officer', dept: financeDept.id, min: 140000, max: 200000, level: 6 },
        { code: 'PAY-ADMIN', title: 'Payroll Administrator', dept: financeDept.id, min: 50000, max: 75000, level: 3 },
        { code: 'SALES-DIR', title: 'Sales Director', dept: salesDept.id, min: 100000, max: 160000, level: 5 },
        { code: 'AE', title: 'Account Executive', dept: salesDept.id, min: 55000, max: 90000, level: 3 },
        { code: 'OPS-MGR', title: 'Operations Manager', dept: opsDept.id, min: 70000, max: 100000, level: 4 },
    ];
    for (const p of positionData) {
        const pos = await prisma.position.upsert({
            where: { code: p.code },
            update: {},
            create: {
                title: p.title,
                code: p.code,
                departmentId: p.dept,
                minSalary: p.min,
                maxSalary: p.max,
                level: p.level,
            },
        });
        positions[p.code] = pos.id;
    }
    // ═══════════════════════════════════════
    // 4. USERS & EMPLOYEES
    // ═══════════════════════════════════════
    console.log('👤 Creating users and employees...');
    // ── Super Admin ─────────────────────────────────────────────────────────
    const { employee: superAdminEmp } = await createUser('admin@abatalent.com', 'Admin@123!', 'SUPER_ADMIN', {
        firstName: 'Rafael',
        lastName: 'Apure',
        jobTitle: 'System Administrator',
        departmentId: hrDept.id,
        positionId: positions['HR-DIR'],
        baseSalary: 110000,
        gender: client_1.Gender.MALE,
        hireDate: new Date('2022-01-01'),
    });
    // ── HR Manager ──────────────────────────────────────────────────────────
    const { employee: hrManagerEmp } = await createUser('hr.manager@abatalent.com', 'HrManager@123!', 'HR_MANAGER', {
        firstName: 'María',
        lastName: 'González',
        jobTitle: 'HR Manager',
        departmentId: hrDept.id,
        positionId: positions['HR-MGR'],
        managerId: superAdminEmp.id,
        baseSalary: 78000,
        gender: client_1.Gender.FEMALE,
        hireDate: new Date('2022-03-15'),
    });
    // ── HR Specialist ────────────────────────────────────────────────────────
    await createUser('hr.specialist@abatalent.com', 'HrSpec@123!', 'HR_ADMIN', {
        firstName: 'Carlos',
        lastName: 'Mendez',
        jobTitle: 'HR Specialist',
        departmentId: hrDept.id,
        positionId: positions['HR-SPEC'],
        managerId: hrManagerEmp.id,
        baseSalary: 52000,
        gender: client_1.Gender.MALE,
        hireDate: new Date('2023-02-01'),
    });
    // ── Department Manager (Tech) ─────────────────────────────────────────────
    const { employee: techMgrEmp } = await createUser('tech.manager@abatalent.com', 'TechMgr@123!', 'DEPARTMENT_MANAGER', {
        firstName: 'James',
        lastName: 'Carter',
        jobTitle: 'Engineering Manager',
        departmentId: techDept.id,
        positionId: positions['ENG-MGR'],
        managerId: superAdminEmp.id,
        baseSalary: 135000,
        gender: client_1.Gender.MALE,
        hireDate: new Date('2022-06-01'),
    });
    // ── Senior Engineer ──────────────────────────────────────────────────────
    const { employee: seniorEngEmp } = await createUser('senior.eng@abatalent.com', 'SenEng@123!', 'EMPLOYEE', {
        firstName: 'Aisha',
        lastName: 'Johnson',
        jobTitle: 'Senior Software Engineer',
        departmentId: backendTeam.id,
        positionId: positions['SEN-ENG'],
        managerId: techMgrEmp.id,
        baseSalary: 112000,
        gender: client_1.Gender.FEMALE,
        hireDate: new Date('2022-09-01'),
    });
    // ── Junior Engineers ─────────────────────────────────────────────────────
    await createUser('eng1@abatalent.com', 'Eng1@123!', 'EMPLOYEE', {
        firstName: 'Lucas',
        lastName: 'Silva',
        jobTitle: 'Software Engineer',
        departmentId: backendTeam.id,
        positionId: positions['ENG'],
        managerId: seniorEngEmp.id,
        baseSalary: 75000,
        gender: client_1.Gender.MALE,
        hireDate: new Date('2023-04-01'),
    });
    await createUser('eng2@abatalent.com', 'Eng2@123!', 'EMPLOYEE', {
        firstName: 'Sophie',
        lastName: 'Martin',
        jobTitle: 'Frontend Engineer',
        departmentId: frontendTeam.id,
        positionId: positions['FE-ENG'],
        managerId: techMgrEmp.id,
        baseSalary: 72000,
        gender: client_1.Gender.FEMALE,
        hireDate: new Date('2023-06-15'),
    });
    // ── Payroll Admin ────────────────────────────────────────────────────────
    await createUser('payroll.admin@abatalent.com', 'Payroll@123!', 'PAYROLL_ADMIN', {
        firstName: 'Diana',
        lastName: 'Torres',
        jobTitle: 'Payroll Administrator',
        departmentId: financeDept.id,
        positionId: positions['PAY-ADMIN'],
        managerId: superAdminEmp.id,
        baseSalary: 62000,
        gender: client_1.Gender.FEMALE,
        hireDate: new Date('2022-11-01'),
    });
    // ── Recruiter ─────────────────────────────────────────────────────────────
    await createUser('recruiter@abatalent.com', 'Recruiter@123!', 'RECRUITER', {
        firstName: 'Marco',
        lastName: 'Rivera',
        jobTitle: 'Talent Acquisition Specialist',
        departmentId: hrDept.id,
        positionId: positions['HR-SPEC'],
        managerId: hrManagerEmp.id,
        baseSalary: 55000,
        gender: client_1.Gender.MALE,
        hireDate: new Date('2023-08-01'),
    });
    // ── Employee (viewer portal) ──────────────────────────────────────────────
    await createUser('employee@abatalent.com', 'Employee@123!', 'EMPLOYEE', {
        firstName: 'Emma',
        lastName: 'Wilson',
        jobTitle: 'Account Executive',
        departmentId: salesDept.id,
        positionId: positions['AE'],
        managerId: superAdminEmp.id,
        baseSalary: 68000,
        gender: client_1.Gender.FEMALE,
        hireDate: new Date('2023-09-01'),
    });
    // ═══════════════════════════════════════
    // 5. LEAVE POLICIES
    // ═══════════════════════════════════════
    console.log('🏖  Creating leave policies...');
    const leavePolicies = [
        { type: client_1.LeaveType.VACATION, days: 15, carryover: 5, accrual: 1.25, notice: 3, minTenure: 90 },
        { type: client_1.LeaveType.SICK, days: 10, carryover: 0, accrual: null, notice: 0, minTenure: 0 },
        { type: client_1.LeaveType.PERSONAL, days: 3, carryover: 0, accrual: null, notice: 1, minTenure: 0 },
        { type: client_1.LeaveType.MATERNITY, days: 90, carryover: 0, accrual: null, notice: 14, minTenure: 180 },
        { type: client_1.LeaveType.PATERNITY, days: 14, carryover: 0, accrual: null, notice: 14, minTenure: 180 },
        { type: client_1.LeaveType.BEREAVEMENT, days: 5, carryover: 0, accrual: null, notice: 0, minTenure: 0 },
        { type: client_1.LeaveType.UNPAID, days: 30, carryover: 0, accrual: null, notice: 7, minTenure: 365 },
        { type: client_1.LeaveType.COMPENSATORY, days: 10, carryover: 5, accrual: null, notice: 1, minTenure: 0 },
        { type: client_1.LeaveType.STUDY, days: 5, carryover: 0, accrual: null, notice: 7, minTenure: 365 },
    ];
    for (const p of leavePolicies) {
        await prisma.leavePolicy.upsert({
            where: { leaveType: p.type },
            update: {},
            create: {
                name: `${p.type.charAt(0) + p.type.slice(1).toLowerCase().replace('_', ' ')} Leave`,
                leaveType: p.type,
                daysAllowed: p.days,
                carryoverDays: p.carryover,
                accrualRate: p.accrual,
                requiresApproval: true,
                minNoticeDays: p.notice,
                eligibleAfterDays: p.minTenure,
            },
        });
    }
    // ═══════════════════════════════════════
    // 6. BENEFIT PLANS
    // ═══════════════════════════════════════
    console.log('🎁 Creating benefit plans...');
    const benefitPlans = [
        {
            name: 'Premium Health Insurance',
            category: client_1.BenefitCategory.HEALTH,
            provider: 'BlueCross BlueShield',
            employerCost: 450,
            employeeCost: 150,
            description: 'Comprehensive medical, including vision & dental essentials',
        },
        {
            name: 'Dental Coverage',
            category: client_1.BenefitCategory.DENTAL,
            provider: 'Delta Dental',
            employerCost: 80,
            employeeCost: 20,
            description: 'Full dental coverage including orthodontics',
        },
        {
            name: 'Vision Plan',
            category: client_1.BenefitCategory.VISION,
            provider: 'VSP',
            employerCost: 30,
            employeeCost: 10,
            description: 'Annual eye exams and frames allowance',
        },
        {
            name: '401(k) Retirement',
            category: client_1.BenefitCategory.RETIREMENT,
            provider: 'Fidelity',
            employerCost: 0,
            employeeCost: 0,
            description: 'Company matches 100% up to 4% of salary',
        },
        {
            name: 'Life Insurance',
            category: client_1.BenefitCategory.LIFE_INSURANCE,
            provider: 'MetLife',
            employerCost: 25,
            employeeCost: 0,
            description: '2x annual salary life insurance coverage',
        },
        {
            name: 'Wellness Stipend',
            category: client_1.BenefitCategory.WELLNESS,
            provider: 'Internal',
            employerCost: 100,
            employeeCost: 0,
            description: '$100/month for gym, wellness apps, fitness equipment',
        },
        {
            name: 'Education Assistance',
            category: client_1.BenefitCategory.EDUCATION,
            provider: 'Internal',
            employerCost: 500,
            employeeCost: 0,
            description: 'Up to $6,000/year for eligible educational expenses',
        },
        {
            name: 'Remote Work Stipend',
            category: client_1.BenefitCategory.OTHER,
            provider: 'Internal',
            employerCost: 75,
            employeeCost: 0,
            description: '$75/month home office expense reimbursement',
        },
    ];
    for (const b of benefitPlans) {
        const existing = await prisma.benefitPlan.findFirst({ where: { name: b.name } });
        if (!existing) {
            await prisma.benefitPlan.create({
                data: {
                    ...b,
                    currency: 'USD',
                    isActive: true,
                    eligibleTypes: [client_1.EmploymentType.FULL_TIME],
                    effectiveDate: new Date('2025-01-01'),
                },
            });
        }
    }
    // ═══════════════════════════════════════
    // 7. ONBOARDING TEMPLATE
    // ═══════════════════════════════════════
    console.log('🚀 Creating onboarding template...');
    const defaultOnboarding = await prisma.onboardingTemplate.upsert({
        where: { id: 'default-onboarding-template' },
        update: {},
        create: {
            id: 'default-onboarding-template',
            name: 'Standard Employee Onboarding',
            description: 'Default onboarding checklist for all new hires',
            isDefault: true,
        },
    });
    const onboardingTasks = [
        { title: 'Sign employment contract', category: client_1.TaskCategory.DOCUMENTATION, order: 1, due: 1 },
        { title: 'Complete tax forms (W-4)', category: client_1.TaskCategory.DOCUMENTATION, order: 2, due: 1 },
        { title: 'Submit government ID copy', category: client_1.TaskCategory.DOCUMENTATION, order: 3, due: 2 },
        { title: 'Setup company email', category: client_1.TaskCategory.IT_SETUP, order: 4, due: 1 },
        { title: 'Install required software', category: client_1.TaskCategory.IT_SETUP, order: 5, due: 3 },
        { title: 'Setup VPN access', category: client_1.TaskCategory.ACCESS, order: 6, due: 3 },
        { title: 'Receive laptop & equipment', category: client_1.TaskCategory.EQUIPMENT, order: 7, due: 1 },
        { title: 'Company orientation session', category: client_1.TaskCategory.ORIENTATION, order: 8, due: 3 },
        { title: 'Meet your manager & team', category: client_1.TaskCategory.MEETING, order: 9, due: 3 },
        { title: 'HR policies & handbook review', category: client_1.TaskCategory.COMPLIANCE, order: 10, due: 5 },
        { title: 'Security & data privacy training', category: client_1.TaskCategory.TRAINING, order: 11, due: 7 },
        { title: 'Benefits enrollment', category: client_1.TaskCategory.OTHER, order: 12, due: 14 },
        { title: '30-day check-in with manager', category: client_1.TaskCategory.MEETING, order: 13, due: 30 },
        { title: 'Complete onboarding survey', category: client_1.TaskCategory.SURVEY, order: 14, due: 30 },
    ];
    for (const t of onboardingTasks) {
        const existing = await prisma.onboardingTemplateTask.findFirst({
            where: { templateId: defaultOnboarding.id, title: t.title },
        });
        if (!existing) {
            await prisma.onboardingTemplateTask.create({
                data: {
                    templateId: defaultOnboarding.id,
                    title: t.title,
                    category: t.category,
                    order: t.order,
                    dueDays: t.due,
                    isRequired: true,
                },
            });
        }
    }
    // ═══════════════════════════════════════
    // 8. OFFBOARDING TEMPLATE
    // ═══════════════════════════════════════
    console.log('👋 Creating offboarding template...');
    const defaultOffboarding = await prisma.offboardingTemplate.upsert({
        where: { id: 'default-offboarding-template' },
        update: {},
        create: {
            id: 'default-offboarding-template',
            name: 'Standard Employee Offboarding',
            description: 'Default offboarding checklist for departing employees',
            isDefault: true,
        },
    });
    const offboardingTasks = [
        { title: 'Exit interview scheduled', category: client_1.TaskCategory.EXIT_INTERVIEW, order: 1, due: -7 },
        { title: 'Knowledge transfer documentation', category: client_1.TaskCategory.KNOWLEDGE_TRANSFER, order: 2, due: -5 },
        { title: 'Return laptop & equipment', category: client_1.TaskCategory.RETURN_EQUIPMENT, order: 3, due: 0 },
        { title: 'Return access badges & keys', category: client_1.TaskCategory.RETURN_EQUIPMENT, order: 4, due: 0 },
        { title: 'Revoke system access (IT)', category: client_1.TaskCategory.IT_SETUP, order: 5, due: 0 },
        { title: 'Complete exit interview', category: client_1.TaskCategory.EXIT_INTERVIEW, order: 6, due: -2 },
        { title: 'Final payroll processing', category: client_1.TaskCategory.DOCUMENTATION, order: 7, due: 0 },
        { title: 'Benefits termination notice', category: client_1.TaskCategory.COMPLIANCE, order: 8, due: 0 },
        { title: 'Reference letter (if applicable)', category: client_1.TaskCategory.DOCUMENTATION, order: 9, due: 5 },
        { title: 'Update org chart', category: client_1.TaskCategory.OTHER, order: 10, due: 1 },
    ];
    for (const t of offboardingTasks) {
        const existing = await prisma.offboardingTemplateTask.findFirst({
            where: { templateId: defaultOffboarding.id, title: t.title },
        });
        if (!existing) {
            await prisma.offboardingTemplateTask.create({
                data: {
                    templateId: defaultOffboarding.id,
                    title: t.title,
                    category: t.category,
                    order: t.order,
                    dueDays: t.due,
                    isRequired: true,
                },
            });
        }
    }
    // ═══════════════════════════════════════
    // 9. PUBLIC HOLIDAYS (US 2025)
    // ═══════════════════════════════════════
    console.log('📅 Creating public holidays...');
    const holidays2025 = [
        { name: 'New Year\'s Day', date: '2025-01-01' },
        { name: 'Martin Luther King Jr. Day', date: '2025-01-20' },
        { name: 'Presidents\' Day', date: '2025-02-17' },
        { name: 'Memorial Day', date: '2025-05-26' },
        { name: 'Juneteenth', date: '2025-06-19' },
        { name: 'Independence Day', date: '2025-07-04' },
        { name: 'Labor Day', date: '2025-09-01' },
        { name: 'Columbus Day', date: '2025-10-13' },
        { name: 'Veterans Day', date: '2025-11-11' },
        { name: 'Thanksgiving Day', date: '2025-11-27' },
        { name: 'Christmas Day', date: '2025-12-25' },
    ];
    for (const h of holidays2025) {
        await prisma.publicHoliday.upsert({
            where: { date_country: { date: new Date(h.date), country: 'US' } },
            update: {},
            create: { name: h.name, date: new Date(h.date), country: 'US' },
        });
    }
    // ═══════════════════════════════════════
    // 10. SYSTEM CONFIG
    // ═══════════════════════════════════════
    console.log('⚙️  Creating system configuration...');
    const configs = [
        { key: 'company.name', value: 'ABA Talent Management', category: 'general', isPublic: true },
        { key: 'company.logo', value: '/assets/logo.png', category: 'general', isPublic: true },
        { key: 'company.currency', value: 'USD', category: 'payroll', isPublic: true },
        { key: 'payroll.frequency', value: 'MONTHLY', category: 'payroll', isPublic: false },
        { key: 'payroll.tax_rate', value: 0.22, category: 'payroll', isPublic: false },
        { key: 'attendance.work_hours_per_day', value: 8, category: 'attendance', isPublic: true },
        { key: 'attendance.overtime_threshold', value: 40, category: 'attendance', isPublic: true },
        { key: 'leave.fiscal_year_start', value: '01-01', category: 'leave', isPublic: false },
        { key: 'notifications.email_enabled', value: true, category: 'notifications', isPublic: false },
        { key: 'auth.session_timeout_minutes', value: 60, category: 'auth', isPublic: false },
    ];
    for (const c of configs) {
        await prisma.systemConfig.upsert({
            where: { key: c.key },
            update: {},
            create: {
                key: c.key,
                value: c.value,
                category: c.category,
                isPublic: c.isPublic,
            },
        });
    }
    // ═══════════════════════════════════════
    // DONE
    // ═══════════════════════════════════════
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║      ✅  Seed completed successfully!      ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    console.log('📋 Default credentials:');
    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│ Role              │ Email                     │ Password  │');
    console.log('├──────────────────────────────────────────────────────────┤');
    console.log('│ SUPER_ADMIN       │ admin@abatalent.com        │ Admin@123!│');
    console.log('│ HR_MANAGER        │ hr.manager@abatalent.com   │ HrManager@123!│');
    console.log('│ HR_ADMIN          │ hr.specialist@abatalent.com│ HrSpec@123!│');
    console.log('│ DEPT_MANAGER      │ tech.manager@abatalent.com │ TechMgr@123!│');
    console.log('│ PAYROLL_ADMIN     │ payroll.admin@abatalent.com│ Payroll@123! │');
    console.log('│ RECRUITER         │ recruiter@abatalent.com    │ Recruiter@123!│');
    console.log('│ EMPLOYEE          │ employee@abatalent.com     │ Employee@123!│');
    console.log('└──────────────────────────────────────────────────────────┘\n');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
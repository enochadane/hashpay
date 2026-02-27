import { PrismaClient } from '../generated/prisma/client';
import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY);
const acct = (label: string) => `HP-${label}`;

async function main() {
    console.log('🌱 Starting seeding...\n');

    // Clear
    console.log('Clearing existing data...');
    try {
        await prisma.$executeRawUnsafe(`
            TRUNCATE TABLE
                "public"."notifications",
                "public"."transactions",
                "public"."contacts",
                "public"."accounts",
                "public"."profiles",
                "public"."currencies"
            RESTART IDENTITY CASCADE;
        `);
        console.log('  ✔ Data cleared');
    } catch (e: any) {
        console.warn('  ⚠ TRUNCATE failed:', e.message);
        await prisma.notifications.deleteMany().catch(() => { });
        await prisma.transactions.deleteMany().catch(() => { });
        await prisma.contacts.deleteMany().catch(() => { });
        await prisma.accounts.deleteMany().catch(() => { });
        await prisma.profiles.deleteMany().catch(() => { });
        await prisma.currencies.deleteMany().catch(() => { });
    }

    // Currencies
    console.log('Seeding currencies...');
    const currencyData = [
        { code: 'USD', name: 'US Dollar', symbol: '$', country_code: 'US' },
        { code: 'EUR', name: 'Euro', symbol: '€', country_code: 'EU' },
        { code: 'GBP', name: 'British Pound', symbol: '£', country_code: 'GB' },
        { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country_code: 'KE' },
        { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country_code: 'ET' },
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country_code: 'NG' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country_code: 'JP' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country_code: 'CH' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', country_code: 'IN' },
        { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', country_code: 'IR' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country_code: 'CN' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country_code: 'BR' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country_code: 'CA' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country_code: 'AU' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', country_code: 'ZA' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country_code: 'AE' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country_code: 'TR' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', country_code: 'SA' },
    ];
    const cur: Record<string, any> = {};
    for (const c of currencyData) {
        cur[c.code] = await prisma.currencies.upsert({
            where: { code: c.code }, update: c, create: c,
        });
    }
    console.log(`  ✔ ${Object.keys(cur).length} currencies`);

    // Auth Users & Profiles
    console.log('Seeding users & profiles...');
    const testUsers = [
        { email: 'alice@hashpay.test', firstName: 'Alice', lastName: 'Johnson' },
        { email: 'bob@hashpay.test', firstName: 'Bob', lastName: 'Smith' },
        { email: 'charlie@hashpay.test', firstName: 'Charlie', lastName: 'Brown' },
        { email: 'david@hashpay.test', firstName: 'David', lastName: 'Wilson' },
        { email: 'eve@hashpay.test', firstName: 'Eve', lastName: 'Davis' },
        { email: 'frank@hashpay.test', firstName: 'Frank', lastName: 'Miller' },
    ];
    const prof: Record<string, any> = {};
    for (const u of testUsers) {
        let authUserId: string | undefined;
        const existing = await prisma.users.findFirst({ where: { email: u.email } });
        if (existing) {
            authUserId = existing.id;
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email: u.email, password: 'Test1234!', email_confirm: true,
            });
            if (error) { console.error(`  ✗ ${u.email}: ${error.message}`); continue; }
            authUserId = data.user!.id;
        }
        prof[u.firstName.toLowerCase()] = await prisma.profiles.upsert({
            where: { id: authUserId },
            update: { first_name: u.firstName, last_name: u.lastName },
            create: { id: authUserId, first_name: u.firstName, last_name: u.lastName },
        });
        console.log(`  ✔ ${u.firstName} ${u.lastName}`);
    }

    // Accounts
    console.log('Seeding accounts...');
    const accountDefs = [
        { user: 'alice', cur: 'USD', bal: 12500.50, num: acct('AL-USD-1'), label: 'Primary Checking' },
        { user: 'alice', cur: 'USD', bal: 34000.00, num: acct('AL-USD-2'), label: 'Business Savings' },
        { user: 'alice', cur: 'EUR', bal: 4500.00, num: acct('AL-EUR-1'), label: 'Travel Wallet' },
        { user: 'alice', cur: 'GBP', bal: 1200.00, num: acct('AL-GBP-1'), label: 'Freelance UK' },
        { user: 'alice', cur: 'KES', bal: 750000, num: acct('AL-KES-1'), label: 'Nairobi Office' },
        { user: 'alice', cur: 'INR', bal: 85000, num: acct('AL-INR-1'), label: 'Mumbai Freelance' },

        { user: 'bob', cur: 'USD', bal: 5000.00, num: acct('BO-USD-1'), label: 'Personal' },
        { user: 'bob', cur: 'USD', bal: 22000.00, num: acct('BO-USD-2'), label: 'Business' },
        { user: 'bob', cur: 'EUR', bal: 3100.00, num: acct('BO-EUR-1'), label: 'EU Savings' },
        { user: 'bob', cur: 'GBP', bal: 1200.00, num: acct('BO-GBP-1'), label: 'London Ops' },
        { user: 'bob', cur: 'INR', bal: 45000, num: acct('BO-INR-1'), label: 'Project Fund' },
        { user: 'bob', cur: 'IRR', bal: 50000000, num: acct('BO-IRR-1'), label: 'Tehran Office' },

        { user: 'charlie', cur: 'USD', bal: 2500.25, num: acct('CH-USD-1'), label: 'Main Account' },
        { user: 'charlie', cur: 'USD', bal: 8000.00, num: acct('CH-USD-2'), label: 'Side Project' },
        { user: 'charlie', cur: 'EUR', bal: 2200.00, num: acct('CH-EUR-1'), label: 'Berlin Office' },
        { user: 'charlie', cur: 'GBP', bal: 950.00, num: acct('CH-GBP-1'), label: 'Manchester' },
        { user: 'charlie', cur: 'ETB', bal: 120000, num: acct('CH-ETB-1'), label: 'Family Support' },
        { user: 'charlie', cur: 'CNY', bal: 18000, num: acct('CH-CNY-1'), label: 'Shanghai Ops' },

        { user: 'david', cur: 'USD', bal: 15600.00, num: acct('DV-USD-1'), label: 'Primary' },
        { user: 'david', cur: 'USD', bal: 4500.00, num: acct('DV-USD-2'), label: 'Travel Fund' },
        { user: 'david', cur: 'EUR', bal: 21000.00, num: acct('DV-EUR-1'), label: 'EU Operations' },
        { user: 'david', cur: 'GBP', bal: 3400.00, num: acct('DV-GBP-1'), label: 'UK Ventures' },
        { user: 'david', cur: 'AED', bal: 45000, num: acct('DV-AED-1'), label: 'Dubai Fund' },
        { user: 'david', cur: 'INR', bal: 92000, num: acct('DV-INR-1'), label: 'Tech Services' },

        { user: 'eve', cur: 'USD', bal: 900.00, num: acct('EV-USD-1'), label: 'Starter' },
        { user: 'eve', cur: 'EUR', bal: 1800.00, num: acct('EV-EUR-1'), label: 'Paris Fund' },
        { user: 'eve', cur: 'GBP', bal: 720.00, num: acct('EV-GBP-1'), label: 'UK Savings' },
        { user: 'eve', cur: 'INR', bal: 125000, num: acct('EV-INR-1'), label: 'Mumbai Savings' },
        { user: 'eve', cur: 'INR', bal: 50000, num: acct('EV-INR-2'), label: 'Freelance' },
        { user: 'eve', cur: 'BRL', bal: 7600, num: acct('EV-BRL-1'), label: 'São Paulo' },

        { user: 'frank', cur: 'USD', bal: 3200.00, num: acct('FR-USD-1'), label: 'Daily Use' },
        { user: 'frank', cur: 'EUR', bal: 2700.00, num: acct('FR-EUR-1'), label: 'Amsterdam' },
        { user: 'frank', cur: 'GBP', bal: 1100.00, num: acct('FR-GBP-1'), label: 'UK Branch' },
        { user: 'frank', cur: 'CAD', bal: 5500, num: acct('FR-CAD-1'), label: 'Toronto Office' },
        { user: 'frank', cur: 'ZAR', bal: 42000, num: acct('FR-ZAR-1'), label: 'Cape Town' },
    ];

    const acc: Record<string, any> = {};
    for (const a of accountDefs) {
        acc[a.num] = await prisma.accounts.upsert({
            where: { account_number: a.num },
            update: { balance: a.bal, provider_details: a.label },
            create: {
                user_id: prof[a.user].id,
                currency_id: cur[a.cur].id,
                balance: a.bal,
                account_number: a.num,
                provider_details: a.label,
            },
        });
    }
    console.log(`  ✔ ${Object.keys(acc).length} accounts`);

    // Transactions
    console.log('Seeding transactions...');
    const A = (label: string) => acc[acct(label)];
    const txns = [
        // Alice <-> Bob (USD, EUR, GBP)
        { from: 'AL-USD-1', to: 'BO-USD-1', amt: 250.00, cur: 'USD', st: 'APPROVED', d: 28 },
        { from: 'BO-USD-1', to: 'AL-USD-1', amt: 1000.00, cur: 'USD', st: 'APPROVED', d: 25 },
        { from: 'AL-USD-2', to: 'BO-USD-2', amt: 5000.00, cur: 'USD', st: 'APPROVED', d: 24 },
        { from: 'BO-USD-1', to: 'AL-USD-1', amt: 500.00, cur: 'USD', st: 'PENDING', d: 1 },
        { from: 'AL-EUR-1', to: 'BO-EUR-1', amt: 320.00, cur: 'EUR', st: 'APPROVED', d: 20 },
        { from: 'BO-EUR-1', to: 'AL-EUR-1', amt: 150.00, cur: 'EUR', st: 'APPROVED', d: 14 },
        { from: 'AL-GBP-1', to: 'BO-GBP-1', amt: 200.00, cur: 'GBP', st: 'APPROVED', d: 10 },

        // Alice <-> Charlie (USD, EUR, GBP)
        { from: 'AL-USD-1', to: 'CH-USD-1', amt: 150.00, cur: 'USD', st: 'APPROVED', d: 22 },
        { from: 'CH-USD-1', to: 'AL-USD-1', amt: 45.00, cur: 'USD', st: 'APPROVED', d: 15 },
        { from: 'AL-EUR-1', to: 'CH-EUR-1', amt: 88.00, cur: 'EUR', st: 'APPROVED', d: 11 },
        { from: 'CH-GBP-1', to: 'AL-GBP-1', amt: 120.00, cur: 'GBP', st: 'PENDING', d: 2 },

        // Alice <-> David (USD, EUR, INR)
        { from: 'DV-USD-1', to: 'AL-USD-1', amt: 3000.00, cur: 'USD', st: 'APPROVED', d: 18 },
        { from: 'AL-USD-1', to: 'DV-USD-1', amt: 200.00, cur: 'USD', st: 'PENDING', d: 0.5 },
        { from: 'DV-EUR-1', to: 'AL-EUR-1', amt: 100.00, cur: 'EUR', st: 'APPROVED', d: 9 },
        { from: 'AL-INR-1', to: 'DV-INR-1', amt: 8000, cur: 'INR', st: 'APPROVED', d: 6 },

        // Alice <-> Eve (USD, EUR, INR)
        { from: 'AL-USD-1', to: 'EV-USD-1', amt: 75.00, cur: 'USD', st: 'APPROVED', d: 16 },
        { from: 'AL-USD-2', to: 'EV-USD-1', amt: 75.00, cur: 'USD', st: 'PENDING', d: 16 },
        { from: 'EV-USD-1', to: 'AL-USD-1', amt: 40.00, cur: 'USD', st: 'APPROVED', d: 8 },
        { from: 'AL-INR-1', to: 'EV-INR-1', amt: 15000, cur: 'INR', st: 'APPROVED', d: 13 },
        { from: 'EV-INR-1', to: 'AL-INR-1', amt: 5000, cur: 'INR', st: 'APPROVED', d: 7 },
        { from: 'AL-EUR-1', to: 'EV-EUR-1', amt: 60.00, cur: 'EUR', st: 'PENDING', d: 0.3 },

        // Alice <-> Frank (USD, EUR, GBP)
        { from: 'FR-USD-1', to: 'AL-USD-1', amt: 88.00, cur: 'USD', st: 'APPROVED', d: 4 },
        { from: 'AL-USD-1', to: 'FR-USD-1', amt: 500.00, cur: 'USD', st: 'PENDING', d: 0.1 },
        { from: 'AL-EUR-1', to: 'FR-EUR-1', amt: 220.00, cur: 'EUR', st: 'APPROVED', d: 12 },
        { from: 'FR-GBP-1', to: 'AL-GBP-1', amt: 65.00, cur: 'GBP', st: 'APPROVED', d: 3 },

        // Bob <-> Charlie (USD, EUR, GBP)
        { from: 'BO-USD-1', to: 'CH-USD-1', amt: 300.00, cur: 'USD', st: 'APPROVED', d: 19 },
        { from: 'CH-USD-2', to: 'BO-USD-2', amt: 750.00, cur: 'USD', st: 'APPROVED', d: 12 },
        { from: 'BO-EUR-1', to: 'CH-EUR-1', amt: 180.00, cur: 'EUR', st: 'APPROVED', d: 8 },
        { from: 'CH-GBP-1', to: 'BO-GBP-1', amt: 95.00, cur: 'GBP', st: 'PENDING', d: 1 },

        // Bob <-> David (USD, GBP, INR)
        { from: 'DV-USD-2', to: 'BO-USD-1', amt: 1500.00, cur: 'USD', st: 'APPROVED', d: 17 },
        { from: 'BO-USD-1', to: 'DV-USD-1', amt: 800.00, cur: 'USD', st: 'APPROVED', d: 14 },
        { from: 'DV-GBP-1', to: 'BO-GBP-1', amt: 250.00, cur: 'GBP', st: 'APPROVED', d: 7 },
        { from: 'DV-INR-1', to: 'BO-INR-1', amt: 12000, cur: 'INR', st: 'APPROVED', d: 2 },

        // Bob <-> Eve (USD, EUR, GBP)
        { from: 'BO-USD-1', to: 'EV-USD-1', amt: 60.00, cur: 'USD', st: 'APPROVED', d: 12 },
        { from: 'EV-USD-1', to: 'BO-USD-1', amt: 30.00, cur: 'USD', st: 'APPROVED', d: 5 },
        { from: 'BO-EUR-1', to: 'EV-EUR-1', amt: 140.00, cur: 'EUR', st: 'APPROVED', d: 9 },
        { from: 'EV-GBP-1', to: 'BO-GBP-1', amt: 55.00, cur: 'GBP', st: 'PENDING', d: 0.5 },

        // Charlie <-> David (USD, EUR, GBP)
        { from: 'CH-USD-1', to: 'DV-USD-1', amt: 400.00, cur: 'USD', st: 'APPROVED', d: 21 },
        { from: 'DV-USD-1', to: 'CH-USD-1', amt: 125.00, cur: 'USD', st: 'APPROVED', d: 10 },
        { from: 'CH-EUR-1', to: 'DV-EUR-1', amt: 200.00, cur: 'EUR', st: 'APPROVED', d: 6 },
        { from: 'DV-GBP-1', to: 'CH-GBP-1', amt: 110.00, cur: 'GBP', st: 'PENDING', d: 1.5 },

        // Charlie <-> Frank (USD, EUR, GBP)
        { from: 'CH-USD-1', to: 'FR-USD-1', amt: 300.00, cur: 'USD', st: 'APPROVED', d: 8 },
        { from: 'FR-USD-1', to: 'CH-USD-1', amt: 50.00, cur: 'USD', st: 'PENDING', d: 2 },
        { from: 'FR-EUR-1', to: 'CH-EUR-1', amt: 175.00, cur: 'EUR', st: 'APPROVED', d: 5 },
        { from: 'CH-GBP-1', to: 'FR-GBP-1', amt: 80.00, cur: 'GBP', st: 'APPROVED', d: 3 },

        // David <-> Eve (USD, EUR, INR)
        { from: 'DV-USD-1', to: 'EV-USD-1', amt: 400.00, cur: 'USD', st: 'APPROVED', d: 6 },
        { from: 'EV-USD-1', to: 'DV-USD-1', amt: 100.00, cur: 'USD', st: 'PENDING', d: 0.25 },
        { from: 'DV-EUR-1', to: 'EV-EUR-1', amt: 260.00, cur: 'EUR', st: 'APPROVED', d: 4 },
        { from: 'EV-INR-1', to: 'DV-INR-1', amt: 7500, cur: 'INR', st: 'APPROVED', d: 11 },

        // David <-> Frank (USD, EUR, GBP)
        { from: 'DV-USD-1', to: 'FR-USD-1', amt: 175.00, cur: 'USD', st: 'APPROVED', d: 5 },
        { from: 'FR-USD-1', to: 'DV-USD-1', amt: 90.00, cur: 'USD', st: 'APPROVED', d: 3 },
        { from: 'DV-EUR-1', to: 'FR-EUR-1', amt: 310.00, cur: 'EUR', st: 'APPROVED', d: 7 },
        { from: 'FR-GBP-1', to: 'DV-GBP-1', amt: 140.00, cur: 'GBP', st: 'PENDING', d: 0.8 },

        // Eve <-> Frank (USD, EUR, GBP)
        { from: 'EV-USD-1', to: 'FR-USD-1', amt: 30.00, cur: 'USD', st: 'APPROVED', d: 3 },
        { from: 'FR-USD-1', to: 'EV-USD-1', amt: 45.00, cur: 'USD', st: 'APPROVED', d: 1 },
        { from: 'FR-EUR-1', to: 'EV-EUR-1', amt: 100.00, cur: 'EUR', st: 'APPROVED', d: 6 },
        { from: 'EV-GBP-1', to: 'FR-GBP-1', amt: 35.00, cur: 'GBP', st: 'PENDING', d: 0.4 },
    ];

    let txnCount = 0;
    for (const t of txns) {
        const fromAcc = A(t.from);
        const toAcc = A(t.to);
        if (!fromAcc || !toAcc) { console.warn(`  ⚠ Skip ${t.from}→${t.to}`); continue; }
        txnCount++;
        await prisma.transactions.create({
            data: {
                from_account_id: fromAcc.id,
                to_account_id: toAcc.id,
                amount: t.amt,
                currency_id: cur[t.cur].id,
                status: t.st as any,
                created_at: ago(t.d),
                processed_at: t.st === 'APPROVED' ? ago(t.d) : null,
                idempotency_key: `seed-${t.from}-${t.to}-${t.d}-${t.amt}`,
                reference_number: `SEED-${String(txnCount).padStart(6, '0')}`,
            },
        });
    }
    console.log(`  ✔ ${txnCount} transactions`);

    // Contacts (auto-derived from transactions)
    console.log('Seeding contacts...');
    const contactPairs = new Set<string>();
    for (const t of txns) {
        const fromAcc = A(t.from);
        const toAcc = A(t.to);
        if (!fromAcc || !toAcc) continue;
        const s = fromAcc.user_id;
        const r = toAcc.user_id;
        if (s === r) continue;
        contactPairs.add(`${s}::${r}`);
        contactPairs.add(`${r}::${s}`);
    }
    let contactCount = 0;
    for (const pair of contactPairs) {
        const [u1, u2] = pair.split('::');
        try {
            await prisma.contacts.upsert({
                where: { user_id_contact_user_id: { user_id: u1, contact_user_id: u2 } },
                update: {},
                create: { user_id: u1, contact_user_id: u2 },
            });
            contactCount++;
        } catch { }
    }
    console.log(`  ✔ ${contactCount} contacts`);

    // Notifications
    console.log('Seeding notifications...');
    const notifications = [
        { user_id: prof.alice.id, title: 'Welcome!', message: 'Multiple accounts per currency enabled.', is_read: false },
        { user_id: prof.alice.id, title: 'Payment Received', message: 'Bob sent you 1000 USD.', is_read: true },
        { user_id: prof.bob.id, title: 'New Contact', message: 'Eve Davis was added to your contacts.', is_read: false },
        { user_id: prof.david.id, title: 'Transfer Approved', message: 'Your 3000 USD to Alice was approved.', is_read: true },
        { user_id: prof.eve.id, title: 'Welcome!', message: 'Start transacting with your contacts.', is_read: false },
        { user_id: prof.frank.id, title: 'GBP Transfer', message: 'You received 65.00 GBP from Alice.', is_read: false },
    ];
    for (const n of notifications) {
        await prisma.notifications.create({ data: n });
    }
    console.log(`  ✔ ${notifications.length} notifications`);

    console.log('\n🎉 Seeding completed successfully!');
}

main()
    .catch((e) => { console.error('Error during seeding:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });

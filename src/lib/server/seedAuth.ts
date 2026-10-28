import { executeNeonQuery, isNeonConfigured } from './neon';
import { hashPassword } from './auth';

/**
 * Ensures initial production tenants and administrative users exist in Neon PostgreSQL
 */
export async function ensureInitialNeonUsers(): Promise<{ seeded: boolean; userCount: number }> {
  if (!isNeonConfigured()) {
    return { seeded: false, userCount: 0 };
  }

  // Check if users already exist
  const existingUsers = await executeNeonQuery<{ count: string }>('SELECT count(*) as count FROM users');
  const count = parseInt(existingUsers[0]?.count || '0', 10);

  if (count > 0) {
    return { seeded: false, userCount: count };
  }

  console.log('⚡ Initializing default tenants and users in Neon DB...');

  // 1. Ensure Default Tenant
  const tenantCheck = await executeNeonQuery<{ id: string }>('SELECT id FROM tenants WHERE id = $1', ['samity-ekota']);
  if (tenantCheck.length === 0) {
    await executeNeonQuery(
      `INSERT INTO tenants (
        id, code, name, slogan, registration_no, phone, email, address,
        theme_color, currency, timezone, subscription_plan, status, sms_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        'samity-ekota',
        'EKOTA',
        'একতা বহুমুখী সমবায় সমিতি লিমিটেড',
        'একতাই বল, সঞ্চয়েই উজ্জ্বল ভবিষ্যৎ',
        'REG-DHAKA-2018-9842',
        '01711223344',
        'info@ekotasamity.org',
        'বাড়ি ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা-১২১৯',
        '#059669',
        'BDT',
        'Asia/Dhaka',
        'STANDARD',
        'ACTIVE',
        500
      ]
    );
  }

  // 2. Prepare default users with secure bcrypt hashes
  const defaultPassword = await hashPassword('Admin@123456');
  const managerPassword = await hashPassword('Manager@123456');
  const collectorPassword = await hashPassword('Collector@123456');
  const memberPassword = await hashPassword('Member@123456');

  const usersToSeed = [
    {
      id: 'user-superadmin',
      tenantId: null,
      name: 'ইঞ্জিঃ সাজ্জাদ হোসাইন (সুপার অ্যাডমিন)',
      phone: '01700000001',
      email: 'admin@samitypro.com',
      passwordHash: defaultPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    },
    {
      id: 'user-rafiq',
      tenantId: 'samity-ekota',
      name: 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)',
      phone: '01711223344',
      email: 'president@ekotasamity.org',
      passwordHash: defaultPassword,
      role: 'SAMITY_ADMIN',
      status: 'ACTIVE'
    },
    {
      id: 'user-tareq',
      tenantId: 'samity-ekota',
      name: 'মো: তারেক হাসান (ম্যানেজার)',
      phone: '01711556677',
      email: 'manager@ekotasamity.org',
      passwordHash: managerPassword,
      role: 'MANAGER',
      status: 'ACTIVE'
    },
    {
      id: 'user-sumon',
      tenantId: 'samity-ekota',
      name: 'সুমন চন্দ্র দে (মাঠ কর্মী)',
      phone: '01811889900',
      email: 'collector@ekotasamity.org',
      passwordHash: collectorPassword,
      role: 'FIELD_COLLECTOR',
      status: 'ACTIVE'
    },
    {
      id: 'user-kabir',
      tenantId: 'samity-ekota',
      name: 'মো: কবির আহমেদ (সদস্য)',
      phone: '01712000001',
      email: 'kabir@gmail.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE'
    }
  ];

  for (const u of usersToSeed) {
    await executeNeonQuery(
      `INSERT INTO users (
        id, tenant_id, name, phone, email, password_hash, role, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (phone) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [u.id, u.tenantId, u.name, u.phone, u.email, u.passwordHash, u.role, u.status]
    );
  }

  console.log(`✅ Seeded ${usersToSeed.length} initial administrative users into Neon PostgreSQL.`);
  return { seeded: true, userCount: usersToSeed.length };
}

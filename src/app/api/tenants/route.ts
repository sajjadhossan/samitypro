import { NextRequest, NextResponse } from 'next/server';
import { executeNeonQuery, isNeonConfigured } from '@/lib/server/neon';
import { getSessionUser } from '@/lib/server/auth';
import { INITIAL_TENANTS } from '@/lib/db';
import { Tenant } from '@/types';

export const dynamic = 'force-dynamic';

interface DbTenantRow {
  id: string;
  code: string;
  name: string;
  slogan: string | null;
  registration_no: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  theme_color: string | null;
  currency: string;
  timezone: string;
  subscription_plan: string;
  status: string;
  sms_balance: number;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

function mapDbRowToTenant(row: DbTenantRow): Tenant {
  const s = (row.settings || {}) as Record<string, any>;
  return {
    id: row.id,
    samityId: row.code,
    nameBn: row.name,
    nameEn: row.name,
    slug: row.code.toLowerCase(),
    type: 'SAMITY',
    registrationNo: row.registration_no || row.code,
    phone: row.phone,
    email: row.email || '',
    address: row.address || '',
    currency: row.currency || 'BDT',
    plan: (row.subscription_plan as any) || 'STANDARD',
    status: (row.status as any) || 'ACTIVE',
    validUntil: s.validUntil || '2028-12-31',
    smsBalance: row.sms_balance ?? 100,
    establishedYear: 2020,
    settings: {
      enableDps: s.enableDps ?? s.enableSavings ?? true,
      enableSavings: s.enableSavings ?? s.enableDps ?? true,
      enableLoans: s.enableLoans ?? true,
      enableFdr: s.enableFdr ?? true,
      enableShares: s.enableShares ?? true,
      enableStaffPayroll: s.enableStaffPayroll ?? true,
      enableAssetInventory: s.enableAssetInventory ?? true,
      enableProjects: s.enableProjects ?? true,
      enableElections: s.enableElections ?? true,
      enableSmsAlerts: s.enableSmsAlerts ?? true,
      enableOnlinePayment: s.enableOnlinePayment ?? true,
      enableDocumentGenerator: s.enableDocumentGenerator ?? true,
      enableMemberPortal: s.enableMemberPortal ?? true,
      enableFieldOfficers: s.enableFieldOfficers ?? true,
      enablePropertyProjects: s.enablePropertyProjects ?? true,
      enableFixedMonthlySavings: s.enableFixedMonthlySavings ?? false,
      fixedMonthlyAmount: s.fixedMonthlyAmount ?? 10000,
      enableMicroLoans: s.enableMicroLoans ?? (s.enableLoans ?? true),
      samityOperatingModel: s.samityOperatingModel || (s.enableFieldOfficers === false ? 'INVESTMENT_PROPERTY' : 'MULTI_PURPOSE'),
      isSavingsOnlySamity: s.isSavingsOnlySamity ?? (s.samityOperatingModel === 'SAVINGS_ONLY'),
      strictNoLoanPolicy: s.strictNoLoanPolicy ?? (s.samityOperatingModel === 'SAVINGS_ONLY' || s.enableLoans === false),
      targetMemberCount: s.targetMemberCount ?? 50,
      monthlySavingsPerMember: s.monthlySavingsPerMember ?? 2000,
      maxMembers: s.maxMembers ?? 500,
      maxStaff: s.maxStaff ?? 15,
      memberCanApplyLoanOnline: s.memberCanApplyLoanOnline ?? true,
      memberCanDownloadReceipt: s.memberCanDownloadReceipt ?? true,
      autoSmsOnDeposit: s.autoSmsOnDeposit ?? true,
      autoSmsOnLoanRepay: s.autoSmsOnLoanRepay ?? true,
      shareFaceValue: s.shareFaceValue ?? 500,
      defaultSavingsInterestRate: s.defaultSavingsInterestRate ?? 8.5,
      defaultLoanInterestRate: s.defaultLoanInterestRate ?? 12.0,
      penaltyPerMissedInstallment: s.penaltyPerMissedInstallment ?? 50,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  try {
    if (isNeonConfigured()) {
      const rows = await executeNeonQuery<DbTenantRow>(
        'SELECT * FROM tenants WHERE deleted_at IS NULL ORDER BY created_at ASC'
      );
      if (rows.length > 0) {
        const tenants = rows.map(mapDbRowToTenant);
        return NextResponse.json({
          success: true,
          message: 'Tenants retrieved from Neon PostgreSQL',
          data: tenants,
          meta: {
            total: tenants.length,
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tenants retrieved successfully',
      data: INITIAL_TENANTS,
      meta: {
        total: INITIAL_TENANTS.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      message: msg,
      errorCode: 'DB_FETCH_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'শুধুমাত্র সুপার অ্যাডমিন নতুন সমিতি তৈরি করতে পারেন (Super Admin required)',
        errorCode: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    const data = await request.json();
    const { nameBn, phone, email, plan = 'STANDARD', status = 'ACTIVE', settings = {}, maxMembers = 500 } = data;

    if (!nameBn || !phone) {
      return NextResponse.json({
        success: false,
        message: 'সমিতির নাম এবং মোবাইল নম্বর আবশ্যক',
        errorCode: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const tenantId = data.id || `tenant-${Date.now()}`;
    const rawCode = nameBn.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase() || 'SAMITY';
    const tenantCode = data.registrationNo || `${rawCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullSettings = {
      enableSavings: settings.enableSavings ?? true,
      enableDps: settings.enableDps ?? true,
      enableLoans: settings.enableLoans ?? true,
      enableFdr: settings.enableFdr ?? true,
      enableShares: settings.enableShares ?? true,
      enableStaffPayroll: settings.enableStaffPayroll ?? true,
      enableAssetInventory: settings.enableAssetInventory ?? true,
      enableProjects: settings.enableProjects ?? true,
      enableElections: settings.enableElections ?? true,
      enableSmsAlerts: settings.enableSmsAlerts ?? true,
      enableOnlinePayment: settings.enableOnlinePayment ?? true,
      enableDocumentGenerator: settings.enableDocumentGenerator ?? true,
      enableMemberPortal: settings.enableMemberPortal ?? true,
      enableFieldOfficers: settings.enableFieldOfficers ?? true,
      enablePropertyProjects: settings.enablePropertyProjects ?? true,
      enableFixedMonthlySavings: settings.enableFixedMonthlySavings ?? false,
      fixedMonthlyAmount: settings.fixedMonthlyAmount ?? 10000,
      enableMicroLoans: settings.enableMicroLoans ?? (settings.enableLoans ?? true),
      samityOperatingModel: settings.samityOperatingModel || (settings.enableFieldOfficers === false ? 'INVESTMENT_PROPERTY' : 'MULTI_PURPOSE'),
      isSavingsOnlySamity: settings.isSavingsOnlySamity ?? (settings.samityOperatingModel === 'SAVINGS_ONLY'),
      strictNoLoanPolicy: settings.strictNoLoanPolicy ?? (settings.samityOperatingModel === 'SAVINGS_ONLY' || settings.enableLoans === false),
      targetMemberCount: settings.targetMemberCount ?? 50,
      monthlySavingsPerMember: settings.monthlySavingsPerMember ?? 2000,
      maxMembers: maxMembers,
      validUntil: data.validUntil || '2028-12-31'
    };

    if (isNeonConfigured()) {
      await executeNeonQuery(
        `INSERT INTO tenants (
          id, code, name, phone, email, subscription_plan, status, sms_balance, settings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tenantId, tenantCode, nameBn, phone, email || null, plan, status, data.smsBalance || 500, JSON.stringify(fullSettings)]
      );

      // Audit log
      await executeNeonQuery(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity, entity_id, new_values, user_agent)
         VALUES (gen_random_uuid()::text, $1, $2, 'CREATE', 'tenants', $1, $3::jsonb, $4)`,
        [tenantId, session.userId, JSON.stringify({ action: 'SUPER_ADMIN_CREATED_TENANT', nameBn }), request.headers.get('user-agent') || 'Unknown']
      );
    }

    return NextResponse.json({
      success: true,
      message: 'সমিতি সফলভাবে তৈরি হয়েছে (Samity created successfully)',
      data: {
        id: tenantId,
        code: tenantCode,
        name: nameBn,
        plan,
        status,
        settings: fullSettings
      }
    }, { status: 201 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      message: msg,
      errorCode: 'CREATE_FAILED'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'শুধুমাত্র সুপার অ্যাডমিন সমিতির ফিচার ও লাইসেন্স পরিবর্তন করতে পারেন',
        errorCode: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    const data = await request.json();
    const { id, status, plan, smsBalance, settings } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Tenant ID is required',
        errorCode: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    if (isNeonConfigured()) {
      // Fetch existing settings
      const existing = await executeNeonQuery<DbTenantRow>('SELECT * FROM tenants WHERE id = $1', [id]);
      if (existing.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'সমিতি পাওয়া যায়নি (Tenant not found)',
          errorCode: 'NOT_FOUND'
        }, { status: 404 });
      }

      const mergedSettings = {
        ...(existing[0].settings || {}),
        ...(settings || {})
      };

      await executeNeonQuery(
        `UPDATE tenants 
         SET status = COALESCE($1, status),
             subscription_plan = COALESCE($2, subscription_plan),
             sms_balance = COALESCE($3, sms_balance),
             settings = $4::jsonb,
             updated_at = NOW()
         WHERE id = $5`,
        [status || null, plan || null, smsBalance !== undefined ? smsBalance : null, JSON.stringify(mergedSettings), id]
      );

      // Audit Log
      await executeNeonQuery(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity, entity_id, new_values, user_agent)
         VALUES (gen_random_uuid()::text, $1, $2, 'UPDATE', 'tenants', $1, $3::jsonb, $4)`,
        [id, session.userId, JSON.stringify({ action: 'SUPER_ADMIN_UPDATED_MODULES', status, plan, settings }), request.headers.get('user-agent') || 'Unknown']
      );
    }

    return NextResponse.json({
      success: true,
      message: 'সমিতির ফিচার ও লাইসেন্স সফলভাবে হালনাগাদ করা হয়েছে (Settings updated successfully)',
      data
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      message: msg,
      errorCode: 'UPDATE_FAILED'
    }, { status: 500 });
  }
}

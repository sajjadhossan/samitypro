-- =============================================================================
-- SamityPro Multi-Tenant Cloud Database Schema (PostgreSQL)
-- Supports Vercel, Supabase, Neon, AWS RDS, Local PostgreSQL
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slogan VARCHAR(255),
    registration_no VARCHAR(100),
    logo_url TEXT,
    seal_url TEXT,
    signature_url TEXT,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    theme_color VARCHAR(32) DEFAULT '#059669',
    currency VARCHAR(16) DEFAULT 'BDT',
    timezone VARCHAR(64) DEFAULT 'Asia/Dhaka',
    subscription_plan VARCHAR(32) DEFAULT 'STANDARD',
    status VARCHAR(32) DEFAULT 'ACTIVE',
    sms_balance INT DEFAULT 100,
    auto_sms_enabled BOOLEAN DEFAULT true,
    auto_wa_enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'MEMBER',
    status VARCHAR(32) DEFAULT 'ACTIVE',
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 3. Members Table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_no VARCHAR(64) NOT NULL,
    name_bangla VARCHAR(255) NOT NULL,
    name_english VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(100),
    nid VARCHAR(64),
    father_or_spouse VARCHAR(255),
    mother_name VARCHAR(255),
    address TEXT,
    photo_url TEXT,
    signature_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relation VARCHAR(100),
    nominee_phone VARCHAR(32),
    nominee_nid VARCHAR(64),
    nominee_share_pct NUMERIC(5,2) DEFAULT 100.00,
    admission_fee NUMERIC(15,2) DEFAULT 0.00,
    share_capital NUMERIC(15,2) DEFAULT 0.00,
    monthly_fee_due NUMERIC(15,2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_member_tenant UNIQUE(tenant_id, member_no)
);

CREATE INDEX IF NOT EXISTS idx_members_tenant ON members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(tenant_id, phone);

-- 4. Savings Accounts Table
CREATE TABLE IF NOT EXISTS savings_accounts (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id VARCHAR(64) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    account_no VARCHAR(64) NOT NULL,
    account_type VARCHAR(32) DEFAULT 'GENERAL',
    target_amount NUMERIC(15,2),
    installment_amt NUMERIC(15,2) DEFAULT 0.00,
    total_deposited NUMERIC(15,2) DEFAULT 0.00,
    total_withdrawn NUMERIC(15,2) DEFAULT 0.00,
    current_balance NUMERIC(15,2) DEFAULT 0.00,
    interest_rate_pct NUMERIC(5,2) DEFAULT 0.00,
    duration_months INT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_savings_tenant_acc UNIQUE(tenant_id, account_no)
);

CREATE INDEX IF NOT EXISTS idx_savings_tenant_member ON savings_accounts(tenant_id, member_id);

-- 5. Savings Transactions Table
CREATE TABLE IF NOT EXISTS savings_transactions (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL,
    savings_account_id VARCHAR(64) NOT NULL REFERENCES savings_accounts(id) ON DELETE CASCADE,
    voucher_no VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    balance_after NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'CASH',
    collector_id VARCHAR(64),
    trx_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sav_tx_acc ON savings_transactions(tenant_id, savings_account_id);

-- 6. Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id VARCHAR(64) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    loan_no VARCHAR(64) NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    interest_rate_pct NUMERIC(5,2) NOT NULL,
    total_interest NUMERIC(15,2) NOT NULL,
    total_repayable NUMERIC(15,2) NOT NULL,
    duration_months INT NOT NULL,
    installment_type VARCHAR(32) DEFAULT 'MONTHLY',
    installment_amt NUMERIC(15,2) NOT NULL,
    total_paid NUMERIC(15,2) DEFAULT 0.00,
    remaining_due NUMERIC(15,2) NOT NULL,
    penalty_amount NUMERIC(15,2) DEFAULT 0.00,
    purpose TEXT,
    guarantor1_name VARCHAR(255),
    guarantor1_phone VARCHAR(32),
    guarantor2_name VARCHAR(255),
    guarantor2_phone VARCHAR(32),
    disbursed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_loans_tenant_no UNIQUE(tenant_id, loan_no)
);

CREATE INDEX IF NOT EXISTS idx_loans_tenant_member ON loans(tenant_id, member_id);

-- 7. Loan Repayments Table
CREATE TABLE IF NOT EXISTS loan_repayments (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL,
    loan_id VARCHAR(64) NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    voucher_no VARCHAR(64) NOT NULL,
    installment_no INT NOT NULL,
    principal_paid NUMERIC(15,2) NOT NULL,
    interest_paid NUMERIC(15,2) NOT NULL,
    penalty_paid NUMERIC(15,2) DEFAULT 0.00,
    total_paid NUMERIC(15,2) NOT NULL,
    remaining_after NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'CASH',
    collector_id VARCHAR(64),
    trx_id VARCHAR(100),
    paid_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loan_rep_loan ON loan_repayments(tenant_id, loan_id);

-- 8. Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    voucher_no VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    narration TEXT NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'CASH',
    bank_account VARCHAR(100),
    cheque_no VARCHAR(100),
    approved_by VARCHAR(64),
    created_by VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'POSTED',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vouchers_no UNIQUE(tenant_id, voucher_no)
);

CREATE INDEX IF NOT EXISTS idx_vouchers_tenant_date ON vouchers(tenant_id, date);

-- 9. Staff & HR Payroll Tables
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_no VARCHAR(64) NOT NULL,
    name_bangla VARCHAR(255) NOT NULL,
    name_english VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(64) DEFAULT 'FIELD',
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(100),
    basic_salary NUMERIC(15,2) NOT NULL,
    house_rent NUMERIC(15,2) DEFAULT 0.00,
    medical_allowance NUMERIC(15,2) DEFAULT 0.00,
    transport_allowance NUMERIC(15,2) DEFAULT 0.00,
    bank_account_no VARCHAR(100),
    bank_name VARCHAR(100),
    joining_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_staff_no UNIQUE(tenant_id, staff_no)
);

CREATE TABLE IF NOT EXISTS staff_attendances (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL,
    staff_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'PRESENT',
    in_time VARCHAR(16),
    out_time VARCHAR(16),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_staff_att_date UNIQUE(tenant_id, staff_id, date)
);

CREATE TABLE IF NOT EXISTS staff_payrolls (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    salary_month VARCHAR(16) NOT NULL,
    basic_salary NUMERIC(15,2) NOT NULL,
    allowances NUMERIC(15,2) DEFAULT 0.00,
    bonus NUMERIC(15,2) DEFAULT 0.00,
    advance_deduction NUMERIC(15,2) DEFAULT 0.00,
    other_deductions NUMERIC(15,2) DEFAULT 0.00,
    net_payable NUMERIC(15,2) NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'PENDING',
    paid_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(32) DEFAULT 'BANK',
    voucher_no VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_staff_payroll_month UNIQUE(tenant_id, staff_id, salary_month)
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(32) NOT NULL,
    recipient_name VARCHAR(255),
    member_id VARCHAR(64) REFERENCES members(id) ON DELETE SET NULL,
    channel VARCHAR(32) NOT NULL,
    category VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'SENT',
    gateway_provider VARCHAR(64),
    gateway_trx_id VARCHAR(100),
    credits_used INT DEFAULT 1,
    error_details TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_date ON notifications(tenant_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(tenant_id, recipient_phone);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(64),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_ts ON audit_logs(tenant_id, timestamp);

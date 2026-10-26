import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MEMBERS } from '@/lib/db';
import { Member } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    const status = request.nextUrl.searchParams.get('status');
    const category = request.nextUrl.searchParams.get('category');
    const bloodGroup = request.nextUrl.searchParams.get('bloodGroup');
    const query = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);

    let list = tenantId 
      ? INITIAL_MEMBERS.filter(m => m.tenantId === tenantId)
      : INITIAL_MEMBERS;

    if (status && status !== 'ALL') {
      list = list.filter(m => m.status === status);
    }
    if (category && category !== 'ALL') {
      list = list.filter(m => m.category === category);
    }
    if (bloodGroup && bloodGroup !== 'ALL') {
      list = list.filter(m => m.bloodGroup === bloodGroup);
    }
    if (query) {
      list = list.filter(m => 
        m.nameBn.toLowerCase().includes(query) ||
        m.nameEn.toLowerCase().includes(query) ||
        m.memberCode.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        m.nid.includes(query)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      message: 'সদস্য তালিকা সফলভাবে লোড হয়েছে (Member list fetched successfully)',
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages
      },
      errors: []
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'সদস্য তালিকা লোড করতে সমস্যা হয়েছে',
      errorCode: 'MEMBERS_FETCH_FAILED',
      errors: [{ field: 'server', message: error.message || 'Internal server error' }]
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validationErrors: { field: string; message: string }[] = [];
    if (!body.tenantId) validationErrors.push({ field: 'tenantId', message: 'সমিতি নির্বাচন আবশ্যক (Tenant ID is required)' });
    if (!body.nameBn?.trim()) validationErrors.push({ field: 'nameBn', message: 'সদস্যের নাম (বাংলা) আবশ্যক' });
    if (!body.phone?.trim()) validationErrors.push({ field: 'phone', message: 'মোবাইল নম্বর আবশ্যক' });
    if (!body.nid?.trim()) validationErrors.push({ field: 'nid', message: 'জাতীয় পরিচয়পত্র নম্বর আবশ্যক' });

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'তথ্য যাচাইকরণে ত্রুটি পাওয়া গেছে (Validation Error)',
        errorCode: 'VALIDATION_ERROR',
        errors: validationErrors
      }, { status: 422 });
    }

    const newMember: Member = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      tenantId: body.tenantId,
      memberCode: body.memberCode || `MEM-${Date.now().toString().slice(-4)}`,
      nameBn: body.nameBn.trim(),
      nameEn: body.nameEn?.trim() || body.nameBn.trim(),
      fatherHusbandName: body.fatherHusbandName?.trim() || '',
      motherName: body.motherName?.trim() || '',
      spouseName: body.spouseName?.trim(),
      phone: body.phone.trim(),
      whatsappNumber: body.whatsappNumber?.trim() || body.phone.trim(),
      alternatePhone: body.alternatePhone?.trim(),
      email: body.email?.trim(),
      nid: body.nid.trim(),
      nidType: body.nidType || 'SMART_NID',
      birthRegistrationNo: body.birthRegistrationNo?.trim(),
      dateOfBirth: body.dateOfBirth || '1990-01-01',
      age: body.age,
      gender: body.gender || 'MALE',
      bloodGroup: body.bloodGroup || 'B+',
      religion: body.religion || 'ISLAM',
      maritalStatus: body.maritalStatus || 'MARRIED',
      occupation: body.occupation?.trim() || 'ব্যবসায়ী',
      education: body.education?.trim(),
      designation: body.designation?.trim() || 'সাধারণ সদস্য',
      category: body.category || 'GENERAL',
      status: body.status || 'ACTIVE',
      admissionDate: body.admissionDate || new Date().toISOString().split('T')[0],
      admissionFee: Number(body.admissionFee) || 1000,
      monthlySubscriptionAmount: Number(body.monthlySubscriptionAmount) || 1500,
      sharesHeld: Number(body.sharesHeld) || 10,
      shareValue: Number(body.shareValue) || 10000,
      savingsBalance: 0,
      dpsBalance: 0,
      loanOutstanding: 0,
      photoUrl: body.photoUrl,
      nidFrontUrl: body.nidFrontUrl,
      nidBackUrl: body.nidBackUrl,
      signatureUrl: body.signatureUrl,
      presentAddress: body.presentAddress?.trim() || '',
      presentDivision: body.presentDivision,
      presentDistrict: body.presentDistrict,
      presentUpazila: body.presentUpazila,
      permanentAddress: body.permanentAddress?.trim() || '',
      permanentDivision: body.permanentDivision,
      permanentDistrict: body.permanentDistrict,
      permanentUpazila: body.permanentUpazila,
      isSameAddress: body.isSameAddress ?? false,
      nominee: body.nominee || {
        name: 'মনোনীত ব্যক্তি',
        relation: 'স্ত্রী/স্বামী',
        nidOrBirthCert: 'N/A',
        phone: body.phone,
        sharePercentage: 100
      },
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      emergencyContactRelation: body.emergencyContactRelation,
      createdBy: body.createdBy || 'ADMIN',
      createdAt: new Date().toISOString().split('T')[0],
      syncVersion: 1,
      isSynced: true
    };

    return NextResponse.json({
      success: true,
      message: 'নতুন সদস্য সফলভাবে ডাটাবেজে অন্তর্ভুক্ত হয়েছে',
      data: newMember,
      meta: {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1
      },
      errors: []
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'নতুন সদস্য সংরক্ষণ ব্যর্থ হয়েছে',
      errorCode: 'MEMBER_CREATE_FAILED',
      errors: [{ field: 'server', message: err.message || 'Unknown server error' }]
    }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({
        success: false,
        message: 'সদস্য আইডি (ID) আবশ্যক',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'id', message: 'Member ID is required' }]
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে',
      data: {
        ...body,
        updatedAt: new Date().toISOString()
      },
      meta: { page: 1, limit: 1, total: 1, totalPages: 1 },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'সদস্য তথ্য আপডেট ব্যর্থ হয়েছে',
      errorCode: 'MEMBER_UPDATE_FAILED',
      errors: [{ field: 'server', message: err.message }]
    }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('id');
    const reason = request.nextUrl.searchParams.get('reason') || 'সদস্যপদ প্রত্যাহার / স্থানান্তর';

    if (!memberId) {
      return NextResponse.json({
        success: false,
        message: 'সদস্য আইডি (id) আবশ্যক',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'id', message: 'Member ID is required' }]
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `সদস্য আইডি ${memberId} সফলভাবে সফট ডিলিট / স্থগিত করা হয়েছে (${reason})`,
      data: { id: memberId, status: 'INACTIVE', deletedAt: new Date().toISOString() },
      meta: { page: 1, limit: 1, total: 1, totalPages: 1 },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'সদস্য ডিলিট ব্যর্থ হয়েছে',
      errorCode: 'MEMBER_DELETE_FAILED',
      errors: [{ field: 'server', message: err.message }]
    }, { status: 500 });
  }
}

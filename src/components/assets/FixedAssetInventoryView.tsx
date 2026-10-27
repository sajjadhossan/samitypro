'use client';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Plus, Search, Filter, Printer, CheckCircle2, 
  AlertTriangle, ArrowUpRight, TrendingDown, Calendar, User, 
  DollarSign, FileText, ChevronRight, X, Clock, ShieldCheck, 
  RefreshCw, Award, Package, Layers, Sparkles, AlertCircle, 
  MapPin, Wrench, BarChart3, ArrowDownLeft, ArrowUpRightFromSquare
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  FixedAsset, FixedAssetCategory, AssetDepreciationMethod, 
  AssetStatus, AssetDepreciationLog, InventoryItem, 
  InventoryItemCategory, InventoryMovement, InventoryMovementType 
} from '@/types';

export default function FixedAssetInventoryView() {
  const { 
    fixedAssets, assetDepreciations, inventoryItems, inventoryMovements, 
    letterhead, signatureSeal, createFixedAsset, runAssetDepreciation, 
    disposeFixedAsset, createInventoryItem, recordStockMovement, 
    language, activeTenant 
  } = useSamityStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<'assets' | 'depreciation' | 'inventory' | 'movements'>('assets');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDepreciationModalOpen, setIsDepreciationModalOpen] = useState(false);
  const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
  const [isInventoryItemModalOpen, setIsInventoryItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isPrintRegisterModalOpen, setIsPrintRegisterModalOpen] = useState(false);

  const [selectedAssetForAction, setSelectedAssetForAction] = useState<FixedAsset | null>(null);
  const [selectedInventoryItemForAction, setSelectedInventoryItemForAction] = useState<InventoryItem | null>(null);

  // New Asset Form State
  const [newAssetNameBn, setNewAssetNameBn] = useState('');
  const [newAssetNameEn, setNewAssetNameEn] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<FixedAssetCategory>('FURNITURE_FIXTURE');
  const [newPurchaseDate, setNewPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPurchasePrice, setNewPurchasePrice] = useState<number>(35000);
  const [newSalvageValue, setNewSalvageValue] = useState<number>(3000);
  const [newUsefulLifeYears, setNewUsefulLifeYears] = useState<number>(5);
  const [newDepMethod, setNewDepMethod] = useState<AssetDepreciationMethod>('STRAIGHT_LINE');
  const [newLocation, setNewLocation] = useState('প্রধান কার্যালয়, বনশ্রী');
  const [newCustodian, setNewCustodian] = useState('তানভীর আহমেদ (ক্যাশিয়ার)');
  const [newSerial, setNewSerial] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newWarranty, setNewWarranty] = useState('');
  const [newAssetNotes, setNewAssetNotes] = useState('');

  // Depreciation Run Form State
  const [depFiscalYear, setDepFiscalYear] = useState('২০২৫-২০২৬');
  const [depResult, setDepResult] = useState<{ totalDepreciation: number; processedAssetsCount: number; voucherNo: string } | null>(null);

  // Disposal Form State
  const [disposalType, setDisposalType] = useState<'SOLD' | 'SCRAPPED'>('SOLD');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposalAmount, setDisposalAmount] = useState<number>(0);
  const [buyerName, setBuyerName] = useState('');
  const [disposalReason, setDisposalReason] = useState('প্রযুক্তিগত স্থবিরতা ও নতুন মডেল ক্রয়ের সিদ্ধান্ত');

  // New Inventory Item Form State
  const [newItemNameBn, setNewItemNameBn] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItemCategory>('STATIONERY');
  const [newItemUnit, setNewItemUnit] = useState('পিস');
  const [newItemCurrentStock, setNewItemCurrentStock] = useState<number>(50);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState<number>(10);
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(150);
  const [newItemLocation, setNewItemLocation] = useState('স্টেশনারি আলমারি-১');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Stock Movement Form State
  const [movementItemId, setMovementItemId] = useState(inventoryItems[0]?.id || '');
  const [movementType, setMovementType] = useState<InventoryMovementType>('STOCK_OUT');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementUnitCost, setMovementUnitCost] = useState<number>(0);
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);
  const [movementRecipient, setMovementRecipient] = useState('মাঠ কালেকশন কর্মকর্তা');
  const [movementRefNo, setMovementRefNo] = useState(`REQ-${Date.now().toString().slice(-4)}`);
  const [movementPurpose, setMovementPurpose] = useState('দৈনিক সদস্য সঞ্চয় ও কিস্তি কালেকশনের জন্য সরবরাহ');

  // KPI Calculations
  const kpis = useMemo(() => {
    const activeAssets = fixedAssets.filter(a => a.status === 'ACTIVE');
    const totalOriginalCost = activeAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
    const totalCurrentBookValue = activeAssets.reduce((sum, a) => sum + a.currentBookValue, 0);
    const totalAccumulatedDep = activeAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);

    const totalInventoryValue = inventoryItems.reduce((sum, i) => sum + i.totalStockValue, 0);
    const lowStockCount = inventoryItems.filter(i => i.currentStock <= i.reorderLevel).length;

    return {
      totalOriginalCost,
      totalCurrentBookValue,
      totalAccumulatedDep,
      totalInventoryValue,
      activeAssetsCount: activeAssets.length,
      lowStockCount,
      totalItemsCount: inventoryItems.length
    };
  }, [fixedAssets, inventoryItems]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return fixedAssets.filter(asset => {
      const matchesSearch = 
        asset.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.custodianOfficer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || asset.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [fixedAssets, searchQuery, categoryFilter, statusFilter]);

  // Submit New Asset
  const handleSubmitAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetNameBn || newPurchasePrice <= 0) {
      alert('সম্পদের নাম ও সঠিক ক্রয়মূল্য প্রদান করুন');
      return;
    }

    try {
      createFixedAsset({
        nameBn: newAssetNameBn,
        nameEn: newAssetNameEn,
        category: newAssetCategory,
        purchaseDate: newPurchaseDate,
        purchasePrice: newPurchasePrice,
        salvageValue: newSalvageValue,
        usefulLifeYears: newUsefulLifeYears,
        depreciationMethod: newDepMethod,
        location: newLocation,
        custodianOfficer: newCustodian,
        serialNumber: newSerial,
        vendorOrSupplier: newVendor,
        warrantyExpiryDate: newWarranty,
        notes: newAssetNotes
      });
      setIsAssetModalOpen(false);
      alert('স্থায়ী সম্পদ সফলভাবে নিবন্ধিত হয়েছে এবং ক্রয় ভাউচার পোস্টিং সম্পন্ন হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`সম্পদ যোগ করতে সমস্যা: ${errorMsg}`);
    }
  };

  // Submit Depreciation
  const handleRunDepreciation = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = runAssetDepreciation(depFiscalYear);
      setDepResult(res);
      alert(`অর্থবছর ${depFiscalYear}-এর অবচয় গণনা সম্পন্ন! মোট অবচয়: ৳${res.totalDepreciation.toLocaleString()} (${res.processedAssetsCount}টি সম্পদ)। ভাউচার নং: ${res.voucherNo}`);
      setIsDepreciationModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`অবচয় গণনায় সমস্যা: ${errorMsg}`);
    }
  };

  // Submit Disposal
  const handleSubmitDispose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForAction) return;

    if (!confirm(`আপনি কি নিশ্চিত যে ${selectedAssetForAction.nameBn} (${selectedAssetForAction.assetCode}) নিষ্পত্তি করতে চান?`)) {
      return;
    }

    try {
      disposeFixedAsset(selectedAssetForAction.id, {
        disposalType,
        disposalDate,
        disposalAmount,
        buyerName,
        reason: disposalReason
      });
      setIsDisposeModalOpen(false);
      alert('স্থায়ী সম্পদ নিষ্পত্তি ও বিক্রয় হিসাব ভাউচার কার্যকর হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`সম্পদ নিষ্পত্তিতে ব্যর্থ: ${errorMsg}`);
    }
  };

  // Submit New Inventory Item
  const handleSubmitInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameBn || newItemCurrentStock < 0 || newItemUnitCost < 0) {
      alert('পণ্যের নাম, প্রারম্ভিক স্টক ও একক মূল্য সঠিক দিন');
      return;
    }

    try {
      createInventoryItem({
        nameBn: newItemNameBn,
        nameEn: newItemNameEn,
        category: newItemCategory,
        unit: newItemUnit,
        currentStock: newItemCurrentStock,
        reorderLevel: newItemReorderLevel,
        unitCost: newItemUnitCost,
        location: newItemLocation,
        notes: newItemNotes
      });
      setIsInventoryItemModalOpen(false);
      alert('নতুন ইনভেন্টরি পণ্য সফলভাবে সংরক্ষণ করা হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`পণ্য যোগ করতে সমস্যা: ${errorMsg}`);
    }
  };

  // Submit Stock Movement
  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItemId || movementQty <= 0) {
      alert('পণ্য ও সঠিক পরিমাণ নির্বাচন করুন');
      return;
    }

    try {
      recordStockMovement({
        itemId: movementItemId,
        type: movementType,
        quantity: movementQty,
        unitCost: movementUnitCost > 0 ? movementUnitCost : undefined,
        date: movementDate,
        recipientOrSource: movementRecipient,
        referenceNo: movementRefNo,
        purpose: movementPurpose,
        performedBy: signatureSeal?.cashierName || 'ক্যাশিয়ার'
      });
      setIsMovementModalOpen(false);
      alert('স্টক মুভমেন্ট রেকর্ড সফলভাবে সম্পন্ন হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`স্টক মুভমেন্ট ব্যর্থ: ${errorMsg}`);
    }
  };

  // Category Names
  const getCategoryNameBn = (cat: FixedAssetCategory) => {
    switch(cat) {
      case 'LAND_BUILDING': return 'জমি ও ভবন';
      case 'FURNITURE_FIXTURE': return 'আসবাবপত্র ও ডেকোরেশন';
      case 'COMPUTER_IT': return 'কম্পিউটার ও আইটি';
      case 'OFFICE_APPLIANCES': return 'অফিস ইলেকট্রনিক্স ও প্রিন্টার';
      case 'VEHICLE': return 'যানবাহন ও মোটরসাইকেল';
      default: return 'অন্যান্য সম্পদ';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-800/40 shadow-xl shadow-indigo-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              মডিউল ৬
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Fixed Asset Register & Inventory Stock
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-400" />
            স্থাবর সম্পদ ও ইনভেন্টরি স্টক ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            স্থায়ী সম্পদ রেজিস্টার, সরলরৈখিক/ক্রমহ্রাসমান অবচয় ইঞ্জিন ও দাপ্তরিক স্টেশনারি ইনভেন্টরি নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPrintRegisterModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            রেজিস্টার প্রিন্ট
          </button>
          <button
            onClick={() => setIsDepreciationModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
          >
            <TrendingDown className="w-4 h-4" />
            বার্ষিক অবচয় গণনা
          </button>
          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            নতুন সম্পদ অন্তর্ভুক্তি
          </button>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Net Book Value */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">বর্তমান নিট পুস্তক মূল্য (Book Value)</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-indigo-300 tracking-tight">
              ৳{kpis.totalCurrentBookValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              মূল ক্রয়মূল্য: ৳{kpis.totalOriginalCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Accumulated Depreciation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">সর্বমোট পুঞ্জীভূত অবচয় (১০৫০)</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
              ৳{kpis.totalAccumulatedDep.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.activeAssetsCount} টি সক্রিয় স্থায়ী সম্পদ
            </div>
          </div>
        </div>

        {/* Card 3: Inventory Stock Valuation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">দাপ্তরিক ইনভেন্টরি স্টক মূল্য</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
              ৳{kpis.totalInventoryValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.totalItemsCount} টি সক্রিয় ইনভেন্টরি আইটেম
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alert Warning */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">রি-অর্ডার মাত্রা সতর্কবার্তা</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
              {kpis.lowStockCount} টি আইটেম
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.lowStockCount > 0 ? 'দ্রুত নতুন স্টক গ্রহণ প্রয়োজন' : 'পর্যাপ্ত স্টক মজুদ আছে'}
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'assets'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          স্থাবর সম্পদ রেজিস্টার ({fixedAssets.length})
        </button>

        <button
          onClick={() => setActiveTab('depreciation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'depreciation'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          অবচয় গণনা ও লগ ({assetDepreciations.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          স্টেশনারি ও পাসবুক ইনভেন্টরি ({inventoryItems.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'movements'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          স্টক মুভমেন্ট লগ ({inventoryMovements.length})
        </button>
      </div>

      {/* TAB 1: FIXED ASSET REGISTER */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          
          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সম্পদের নাম, কোড, অবস্থান, কর্মকর্তা দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">সকল ক্যাটাগরি</option>
                <option value="FURNITURE_FIXTURE">আসবাবপত্র ও ডেকোরেশন</option>
                <option value="COMPUTER_IT">কম্পিউটার ও আইটি</option>
                <option value="OFFICE_APPLIANCES">অফিস ইলেকট্রনিক্স</option>
                <option value="VEHICLE">যানবাহন / মোটরসাইকেল</option>
                <option value="LAND_BUILDING">জমি ও ভবন</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">সব স্ট্যাটাস</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="DISPOSED">নিষ্পত্তিকৃত (Disposed)</option>
                <option value="SCRAPPED">স্ক্র্যাপ (Scrapped)</option>
              </select>
            </div>
          </div>

          {/* Asset Register Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">সম্পদ কোড ও নাম</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">ক্রয় তারিখ</th>
                    <th className="py-3.5 px-4 text-right">ক্রয়মূল্য (৳)</th>
                    <th className="py-3.5 px-4 text-right">পুঞ্জীভূত অবচয়</th>
                    <th className="py-3.5 px-4 text-right">বর্তমান বুক ভ্যালু</th>
                    <th className="py-3.5 px-4">অবস্থান ও জিম্মাদার</th>
                    <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        কোনো স্থায়ী সম্পদ রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {asset.nameBn}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-400/90">
                            {asset.assetCode} {asset.serialNumber && `• S/N: ${asset.serialNumber}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {getCategoryNameBn(asset.category)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                          {asset.purchaseDate}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          ৳{asset.purchasePrice.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-rose-400">
                          -৳{asset.accumulatedDepreciation.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-indigo-300">
                          ৳{asset.currentBookValue.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="text-slate-200 font-medium">{asset.location}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-500" />
                            {asset.custodianOfficer}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            asset.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                          }`}>
                            {asset.status === 'ACTIVE' ? 'সচল' : 'নিষ্পত্তিকৃত'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {asset.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                setSelectedAssetForAction(asset);
                                setDisposalAmount(asset.currentBookValue);
                                setIsDisposeModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                            >
                              নিষ্পত্তি / বিক্রয়
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPRECIATION LOG */}
      {activeTab === 'depreciation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-indigo-400" />
                বার্ষিক অবচয় গণনা হিস্ট্রি ও জাবেদা ভাউচার
              </h2>
              <p className="text-xs text-slate-400">সমিতির পুঞ্জীভূত অবচয় তহবিল (১০৫০) ও অবচয় ব্যয় (৪০৮০)</p>
            </div>
            <button
              onClick={() => setIsDepreciationModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              <TrendingDown className="w-4 h-4" />
              নতুন অবচয় পোস্টিং চালান
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">কার্যকর তারিখ</th>
                    <th className="py-3 px-4">অর্থবছর</th>
                    <th className="py-3 px-4">স্থায়ী সম্পদ</th>
                    <th className="py-3 px-4 text-right">প্রারম্ভিক বুক ভ্যালু</th>
                    <th className="py-3 px-4 text-right">ধার্যকৃত অবচয়</th>
                    <th className="py-3 px-4 text-right">সমাপনী বুক ভ্যালু</th>
                    <th className="py-3 px-4">জাবেদা ভাউচার নং</th>
                    <th className="py-3 px-4">হিসাবরক্ষক</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assetDepreciations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        কোনো অবচয় গণনার ইতিহাস পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    assetDepreciations.map(dep => (
                      <tr key={dep.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-slate-300">{dep.depreciationDate}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-300">{dep.financialYear}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {dep.assetNameBn || dep.nameBn} <span className="text-[11px] font-mono text-slate-400">({dep.assetCode})</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          ৳{dep.openingBookValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400">
                          -৳{dep.depreciationAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          ৳{dep.closingBookValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{dep.voucherNo}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{dep.calculatedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY STOCK */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                দাপ্তরিক সরঞ্জাম ও স্টেশনারি ইনভেন্টরি স্টক
              </h2>
              <p className="text-xs text-slate-400">সদস্য পাসবুক, ঋণ আবেদন ফরম প্যাড, রশিদ বহি ও প্রিন্টার সামগ্রী</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                <ArrowUpRightFromSquare className="w-3.5 h-3.5 text-teal-400" />
                স্টক ইন/আউট এন্ট্রি
              </button>
              <button
                onClick={() => setIsInventoryItemModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                নতুন পণ্য যোগ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems.map(item => {
              const isLowStock = item.currentStock <= item.reorderLevel;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                    isLowStock ? 'border-amber-700/60 shadow-lg shadow-amber-950/20' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                        {item.itemCode}
                      </span>
                      {isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> রি-অর্ডার সতর্কবার্তা
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          পর্যাপ্ত মজুদ
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{item.nameBn}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.notes}</p>

                    <div className="my-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">বর্তমান স্টক</div>
                        <div className={`font-black text-base mt-0.5 ${isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.currentStock} {item.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">সতর্কীকরণ মাত্রা</div>
                        <div className="font-semibold text-slate-300 mt-0.5">{item.reorderLevel} {item.unit}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">একক ক্রয়মূল্য</div>
                        <div className="font-mono text-slate-300 mt-0.5">৳{item.unitCost}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">মোট স্টক মূল্য</div>
                        <div className="font-bold text-teal-400 mt-0.5">৳{item.totalStockValue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                    </span>
                    <button
                      onClick={() => {
                        setMovementItemId(item.id);
                        setIsMovementModalOpen(true);
                      }}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      মুভমেন্ট <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STOCK MOVEMENTS LOG */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              ইনভেন্টরি স্টক ইন-আউট মুভমেন্ট রেজিস্টার
            </h2>
            <div className="text-xs text-slate-400">মোট {inventoryMovements.length} টি মুভমেন্ট রেকর্ড</div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">আইটেম কোড ও নাম</th>
                    <th className="py-3 px-4 text-center">মুভমেন্ট ধরন</th>
                    <th className="py-3 px-4 text-center">পরিমাণ</th>
                    <th className="py-3 px-4 text-right">মোট খরচ (৳)</th>
                    <th className="py-3 px-4">গ্রহীতা / সরবরাহকারী</th>
                    <th className="py-3 px-4">চালান / রিকুইজিশন নং</th>
                    <th className="py-3 px-4">উদ্দেশ্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventoryMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        কোনো স্টক মুভমেন্ট রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    inventoryMovements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-slate-300">{m.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {m.itemNameBn} <span className="text-[10px] font-mono text-slate-500">({m.itemCode})</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.type === 'STOCK_IN' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {m.type === 'STOCK_IN' ? 'স্টক ইন (প্রাপ্তি)' : 'স্টক আউট (প্রদান)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-200">{m.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          ৳{m.totalCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-200">{m.recipientOrSource}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{m.referenceNo}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-xs">{m.purpose}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW FIXED ASSET */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  নতুন স্থাবর সম্পদ অন্তর্ভুক্তি ও ক্রয় ভাউচার পোস্টিং
                </h3>
                <p className="text-xs text-slate-400">অফিস আসবাবপত্র, কম্পিউটার, ইলেকট্রনিক্স ও যানবাহন নিবন্ধন</p>
              </div>
              <button onClick={() => setIsAssetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">সম্পদের পূর্ণ নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    value={newAssetNameBn}
                    onChange={e => setNewAssetNameBn(e.target.value)}
                    placeholder="যেমন: শাখা কার্যালয় কনফারেন্স টেবিল ও ১০টি রিভলভিং চেয়ার"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">সম্পদের ক্যাটাগরি *</label>
                  <select
                    value={newAssetCategory}
                    onChange={e => setNewAssetCategory(e.target.value as FixedAssetCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  >
                    <option value="FURNITURE_FIXTURE">আসবাবপত্র ও ডেকোরেশন</option>
                    <option value="COMPUTER_IT">কম্পিউটার ও আইটি সরঞ্জাম</option>
                    <option value="OFFICE_APPLIANCES">অফিস ইলেকট্রনিক্স ও প্রিন্টার</option>
                    <option value="VEHICLE">যানবাহন ও মোটরসাইকেল</option>
                    <option value="LAND_BUILDING">জমি ও কার্যালয় ভবন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ক্রয় তারিখ *</label>
                  <input
                    type="date"
                    value={newPurchaseDate}
                    onChange={e => setNewPurchaseDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">প্রকৃত ক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={newPurchasePrice}
                    onChange={e => setNewPurchasePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">কার্যকাল (Useful Life - বছর) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newUsefulLifeYears}
                    onChange={e => setNewUsefulLifeYears(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">স্ক্র্যাপ / অবশিষ্ট মূল্য (Salvage ৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={newSalvageValue}
                    onChange={e => setNewSalvageValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">অবচয় পদ্ধতি</label>
                  <select
                    value={newDepMethod}
                    onChange={e => setNewDepMethod(e.target.value as AssetDepreciationMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  >
                    <option value="STRAIGHT_LINE">সরলরৈখিক পদ্ধতি (Straight Line)</option>
                    <option value="REDUCING_BALANCE">ক্রমহ্রাসমান জের পদ্ধতি (Reducing Balance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">অবস্থান / শাখা *</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">দায়িত্বপ্রাপ্ত কর্মকর্তা *</label>
                  <input
                    type="text"
                    value={newCustodian}
                    onChange={e => setNewCustodian(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">সরবরাহকারী প্রতিষ্ঠান</label>
                  <input
                    type="text"
                    value={newVendor}
                    onChange={e => setNewVendor(e.target.value)}
                    placeholder="দোকান বা ভেন্ডরের নাম"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">সিরিয়াল / চেসিস নং</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={e => setNewSerial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  সম্পদ সংরক্ষণ ও ভাউচার তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RUN DEPRECIATION */}
      {isDepreciationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-indigo-400" />
                বার্ষিক অবচয় গণনা ও জাবেদা ভাউচার পোস্টিং
              </h3>
              <button onClick={() => setIsDepreciationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunDepreciation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">অর্থবছর নির্বাচন *</label>
                <select
                  value={depFiscalYear}
                  onChange={e => setDepFiscalYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="২০২৫-২০২৬">২০২৫-২০২৬ অর্থবছর</option>
                  <option value="২০২৬-২০২৭">২০২৬-২০২৭ অর্থবছর</option>
                  <option value="২০২৪-২০২৫">২০২৪-২০২৫ অর্থবছর</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs space-y-2">
                <div className="font-semibold text-indigo-300">স্বয়ংক্রিয় হিসাবরক্ষণ প্রক্রিয়া:</div>
                <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
                  <li>সকল সচল স্থায়ী সম্পদের কার্যকাল ও স্ক্র্যাপ ভ্যালু বিবেচনায় অবচয় গণনা হবে।</li>
                  <li>জাবেদা ডেবিট: <strong>৪০৮০ (স্থাবর সম্পদের অবচয় ব্যয়)</strong></li>
                  <li>জাবেদা ক্রেডিট: <strong>১০৫০ (পুঞ্জীভূত অবচয় সঞ্চিতি তহবিল)</strong></li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDepreciationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  অবচয় গণনা ও ভাউচার কার্যকর করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPOSE ASSET */}
      {isDisposeModalOpen && selectedAssetForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                সম্পদ নিষ্পত্তি ও বিক্রয় পোস্টিং
              </h3>
              <button onClick={() => setIsDisposeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispose} className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-100">{selectedAssetForAction.nameBn}</div>
                <div className="text-slate-400">কোড: {selectedAssetForAction.assetCode} • বর্তমান বুক ভ্যালু: ৳{selectedAssetForAction.currentBookValue.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">নিষ্পত্তির ধরন *</label>
                <select
                  value={disposalType}
                  onChange={e => setDisposalType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="SOLD">বিক্রয় (Sold with Cash Receipt)</option>
                  <option value="SCRAPPED">অকেজো ও স্ক্র্যাপ ঘোষণা (Scrapped)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">বিক্রয় প্রাপ্তি অঙ্ক (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={disposalAmount}
                  onChange={e => setDisposalAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ক্রেতার নাম</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="ক্রেতার নাম বা প্রতিষ্ঠান..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">নিষ্পত্তির কারণ</label>
                <input
                  type="text"
                  value={disposalReason}
                  onChange={e => setDisposalReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDisposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  সম্পদ নিষ্পত্তি নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW INVENTORY ITEM */}
      {isInventoryItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                নতুন ইনভেন্টরি পণ্য নিবন্ধন
              </h3>
              <button onClick={() => setIsInventoryItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInventoryItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  value={newItemNameBn}
                  onChange={e => setNewItemNameBn(e.target.value)}
                  placeholder="যেমন: সদস্য সঞ্চয় ও কিস্তি পাসবুক"
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  >
                    <option value="PASSBOOK">পাসবুক (Passbook)</option>
                    <option value="LOAN_FORM">ঋণ ফরম প্যাড (Loan Pad)</option>
                    <option value="VOUCHER_PAD">রশিদ বহি (Receipt Book)</option>
                    <option value="STATIONERY">স্টেশনারি পেপার (Paper)</option>
                    <option value="IT_ACCESSORY">আইটি এক্সেসরিজ (Toner)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">একক (Unit) *</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    placeholder="যেমন: বই / প্যাড / রিম"
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">প্রারম্ভিক স্টক *</label>
                  <input
                    type="number"
                    min={0}
                    value={newItemCurrentStock}
                    onChange={e => setNewItemCurrentStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">রি-অর্ডার মাত্রা *</label>
                  <input
                    type="number"
                    min={1}
                    value={newItemReorderLevel}
                    onChange={e => setNewItemReorderLevel(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">একক ক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={newItemUnitCost}
                    onChange={e => setNewItemUnitCost(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">স্টোরেজ অবস্থান</label>
                  <input
                    type="text"
                    value={newItemLocation}
                    onChange={e => setNewItemLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInventoryItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  পণ্য নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RECORD STOCK MOVEMENT */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRightFromSquare className="w-5 h-5 text-teal-400" />
                স্টক ইন / স্টক আউট মুভমেন্ট এন্ট্রি
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ইনভেন্টরি আইটেম *</label>
                <select
                  value={movementItemId}
                  onChange={e => setMovementItemId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                >
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nameBn} (মজুদ: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">মুভমেন্ট ধরন *</label>
                  <select
                    value={movementType}
                    onChange={e => setMovementType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  >
                    <option value="STOCK_OUT">স্টক আউট (অফিসারকে প্রদান)</option>
                    <option value="STOCK_IN">স্টক ইন (নতুন ক্রয়/মুদ্রণ গ্রহণ)</option>
                    <option value="ADJUSTMENT">অডিট অ্যাডজাস্টমেন্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">পরিমাণ *</label>
                  <input
                    type="number"
                    min={1}
                    value={movementQty}
                    onChange={e => setMovementQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">গ্রহীতা / উৎস কর্মকর্তা *</label>
                <input
                  type="text"
                  value={movementRecipient}
                  onChange={e => setMovementRecipient(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">রিকুইজিশন / চালান নং</label>
                  <input
                    type="text"
                    value={movementRefNo}
                    onChange={e => setMovementRefNo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={movementDate}
                    onChange={e => setMovementDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ব্যবহারের উদ্দেশ্য</label>
                <input
                  type="text"
                  value={movementPurpose}
                  onChange={e => setMovementPurpose(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  মুভমেন্ট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE ASSET & INVENTORY REGISTER SHEET */}
      {isPrintRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 print:shadow-none print:m-0 print:rounded-none">
            
            {/* Toolbar */}
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
              <span className="font-bold text-sm">স্থাবর সম্পদ ও ইনভেন্টরি অফিসিয়াল রেজিস্টার</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট করুন (A4 Sheet)
                </button>
                <button onClick={() => setIsPrintRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-8 sm:p-12 space-y-6">
              <div className="text-center border-b border-slate-300 pb-4 space-y-1">
                <h1 className="text-2xl font-black text-slate-950">
                  {letterhead?.samityNameBn || activeTenant?.nameBn || 'একতা বহুমুখী সমবায় সমিতি লিমিটেড'}
                </h1>
                <p className="text-xs text-slate-600">
                  {letterhead?.addressBn || activeTenant?.address || 'বনশ্রী, ঢাকা-১২১৯'} | নিবন্ধন নং: {activeTenant?.registrationNo || 'REG-DHAKA-2018-9842'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-1 rounded bg-slate-900 text-white font-bold text-xs">
                    স্থাবর সম্পদ ও ইনভেন্টরি স্টক অডিট প্রতিবেদন - ২০২৬
                  </span>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50">
                <div>
                  <div className="text-[10px] text-slate-500">মূল ক্রয়মূল্য</div>
                  <div className="font-bold text-slate-900">৳{kpis.totalOriginalCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">পুঞ্জীভূত অবচয়</div>
                  <div className="font-bold text-rose-700">-৳{kpis.totalAccumulatedDep.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">নিট পুস্তক মূল্য</div>
                  <div className="font-bold text-indigo-900">৳{kpis.totalCurrentBookValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">ইনভেন্টরি মজুদ মূল্য</div>
                  <div className="font-bold text-emerald-800">৳{kpis.totalInventoryValue.toLocaleString()}</div>
                </div>
              </div>

              {/* Assets Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">১. স্থাবর সম্পদ বিবরণী</h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">কোড</th>
                      <th className="p-2 border-r border-slate-300">সম্পদের নাম</th>
                      <th className="p-2 border-r border-slate-300">ক্রয় তারিখ</th>
                      <th className="p-2 border-r border-slate-300 text-right">ক্রয়মূল্য</th>
                      <th className="p-2 border-r border-slate-300 text-right">পুঞ্জীভূত অবচয়</th>
                      <th className="p-2 border-r border-slate-300 text-right">বর্তমান বুক ভ্যালু</th>
                      <th className="p-2">দায়িত্বপ্রাপ্ত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {fixedAssets.map(a => (
                      <tr key={a.id}>
                        <td className="p-2 font-mono border-r border-slate-300">{a.assetCode}</td>
                        <td className="p-2 font-medium border-r border-slate-300">{a.nameBn}</td>
                        <td className="p-2 font-mono border-r border-slate-300">{a.purchaseDate}</td>
                        <td className="p-2 text-right border-r border-slate-300">৳{a.purchasePrice.toLocaleString()}</td>
                        <td className="p-2 text-right border-r border-slate-300 text-rose-700">৳{a.accumulatedDepreciation.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold border-r border-slate-300">৳{a.currentBookValue.toLocaleString()}</td>
                        <td className="p-2">{a.custodianOfficer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventory Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">২. দাপ্তরিক সরঞ্জাম ও স্টেশনারি মজুদ বিবরণী</h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">কোড</th>
                      <th className="p-2 border-r border-slate-300">পণ্যের নাম</th>
                      <th className="p-2 border-r border-slate-300 text-center">বর্তমান মজুদ</th>
                      <th className="p-2 border-r border-slate-300 text-center">সতর্কীকরণ মাত্রা</th>
                      <th className="p-2 border-r border-slate-300 text-right">একক মূল্য</th>
                      <th className="p-2 border-r border-slate-300 text-right">মোট মূল্য</th>
                      <th className="p-2">অবস্থান</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inventoryItems.map(i => (
                      <tr key={i.id}>
                        <td className="p-2 font-mono border-r border-slate-300">{i.itemCode}</td>
                        <td className="p-2 font-medium border-r border-slate-300">{i.nameBn}</td>
                        <td className="p-2 text-center font-bold border-r border-slate-300">{i.currentStock} {i.unit}</td>
                        <td className="p-2 text-center border-r border-slate-300">{i.reorderLevel} {i.unit}</td>
                        <td className="p-2 text-right border-r border-slate-300">৳{i.unitCost}</td>
                        <td className="p-2 text-right font-bold border-r border-slate-300">৳{i.totalStockValue.toLocaleString()}</td>
                        <td className="p-2">{i.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-12 flex justify-between items-end text-center text-xs">
                <div>
                  <div className="border-t border-slate-600 pt-1 font-bold">ইনভেন্টরি ও সম্পদ তত্ত্বাবধায়ক</div>
                  <div className="text-[10px] text-slate-500">সমিতি কার্যালয়</div>
                </div>
                <div>
                  <div className="border-t border-slate-600 pt-1 font-bold">হিসাবরক্ষক / ক্যাশিয়ার</div>
                  <div className="text-[10px] text-slate-500">{signatureSeal?.cashierName || 'সুমাইয়া আক্তার'}</div>
                </div>
                <div>
                  <div className="border-t border-slate-600 pt-1 font-bold">সভাপতি / সেক্রেটারি</div>
                  <div className="text-[10px] text-slate-500">{signatureSeal?.presidentName || 'আলহাজ্ব রফিকুল ইসলাম'}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

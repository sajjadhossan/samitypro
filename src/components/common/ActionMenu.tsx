'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, Eye, Edit3, Type, Copy, 
  Printer, Download, Share2, Archive, Trash2 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';

export interface ActionMenuCustomItem {
  labelBn: string;
  labelEn: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

export interface ActionMenuItemOptions {
  onView?: () => void;
  onEdit?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  isApproved?: boolean;
  customItems?: ActionMenuCustomItem[];
}

interface ActionMenuProps {
  readonly options: ActionMenuItemOptions;
  readonly itemName?: string;
}

export function ActionMenu({ options, itemName }: ActionMenuProps) {
  const { language } = useSamityStore();
  const isBn = language === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (cb?: () => void, requiresConfirmation = false, confirmMsg?: string) => {
    if (!cb) return;
    setIsOpen(false);
    if (requiresConfirmation) {
      const defaultMsg = isBn 
        ? `আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছে ফেলতে চান?` 
        : `Are you sure you want to delete this record?`;
      if (window.confirm(confirmMsg || defaultMsg)) {
        cb();
      }
    } else {
      cb();
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        aria-label="Options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100">
          {options.onView && (
            <button
              onClick={() => handleAction(options.onView)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
            </button>
          )}

          {options.onEdit && (
            <button
              onClick={() => {
                if (options.isApproved) {
                  const warnMsg = isBn
                    ? '⚠️ সতর্কবার্তা: এটি একটি অনুমোদিত রেকর্ড। সম্পাদনা করলে এর অনুমোদন স্ট্যাটাস পেন্ডিং-এ চলে যাবে। আপনি কি নিশ্চিত?'
                    : '⚠️ Warning: This is an approved record. Editing will reset status to Pending Approval. Proceed?';
                  if (!window.confirm(warnMsg)) return;
                }
                handleAction(options.onEdit);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'সম্পাদনা করুন' : 'Edit Record'}</span>
            </button>
          )}

          {options.onRename && (
            <button
              onClick={() => handleAction(options.onRename)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'পুনঃনামকরণ' : 'Rename'}</span>
            </button>
          )}

          {options.onDuplicate && (
            <button
              onClick={() => handleAction(options.onDuplicate)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'অনুরূপ তৈরি (Duplicate)' : 'Duplicate'}</span>
            </button>
          )}

          {options.customItems && options.customItems.length > 0 && (
            <>
              <div className="my-1 border-t border-slate-800" />
              {options.customItems.map((item, idx) => {
                const IconComponent = item.icon;
                const textColor = item.variant === 'danger'
                  ? 'text-red-400 hover:bg-red-500/10'
                  : item.variant === 'success'
                  ? 'text-emerald-400 hover:bg-emerald-500/10'
                  : item.variant === 'warning'
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-cyan-400';
                return (
                  <button
                    key={`custom-item-${idx}`}
                    type="button"
                    onClick={() => handleAction(item.onClick)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition cursor-pointer ${textColor}`}
                  >
                    {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
                    <span>{isBn ? item.labelBn : item.labelEn}</span>
                  </button>
                );
              })}
            </>
          )}

          {(options.onPrint || options.onDownloadPdf) && <div className="my-1 border-t border-slate-800" />}

          {options.onPrint && (
            <button
              onClick={() => handleAction(options.onPrint)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'প্রিন্ট রসিদ/ডকুমেন্ট' : 'Print Document'}</span>
            </button>
          )}

          {options.onDownloadPdf && (
            <button
              onClick={() => handleAction(options.onDownloadPdf)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
            </button>
          )}

          {options.onShare && (
            <button
              onClick={() => handleAction(options.onShare)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-cyan-400 text-left transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে শেয়ার' : 'Share to WhatsApp'}</span>
            </button>
          )}

          {(options.onArchive || options.onDelete) && <div className="my-1 border-t border-slate-800" />}

          {options.onArchive && (
            <button
              onClick={() => handleAction(options.onArchive)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-amber-400 text-left transition cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'আর্কাইভ করুন' : 'Archive'}</span>
            </button>
          )}

          {options.onDelete && (
            <button
              onClick={() => handleAction(options.onDelete, true, isBn ? `${itemName || 'এই রেকর্ডটি'} মুছে ফেলতে চান? এটি অডিট লগে রেকর্ড হবে।` : undefined)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 hover:text-red-400 text-red-400 text-left transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'মুছে ফেলুন (Soft Delete)' : 'Delete Record'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

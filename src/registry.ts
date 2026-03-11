import { lazy, ComponentType } from 'react';
import {
  TbFileText, TbLetterCase, TbTextWrap,
  TbPhotoDown, TbQrcode, TbScan,
  TbCash, TbCurrencyDollar, TbReceipt,
  TbSearch, TbBuildingBank, TbMoonStars,
  TbScale, TbCalendar, TbRulerMeasure,
  TbAlarm, TbNote, TbDice5, TbPasswordFingerprint,
  TbMailPlus, TbSignature,
} from 'react-icons/tb';
import {
  HiDocumentText, HiPhotograph, HiCurrencyDollar,
  HiSearchCircle, HiCalculator, HiClock,
} from 'react-icons/hi';
import type { IconType } from 'react-icons';

export interface ToolMeta {
  id: string;
  icon: IconType;
  category: CategoryId;
  component: React.LazyExoticComponent<ComponentType>;
  isNew?: boolean;
}

export type CategoryId =
  | 'text'
  | 'image'
  | 'finance'
  | 'vn-lookup'
  | 'calculator'
  | 'productivity';

export interface Category {
  id: CategoryId;
  icon: IconType;
}

export const categories: Category[] = [
  { id: 'text', icon: HiDocumentText },
  { id: 'image', icon: HiPhotograph },
  { id: 'finance', icon: HiCurrencyDollar },
  { id: 'vn-lookup', icon: HiSearchCircle },
  { id: 'calculator', icon: HiCalculator },
  { id: 'productivity', icon: HiClock },
];

export const tools: ToolMeta[] = [
  // Văn bản
  {
    id: 'word-counter',
    icon: TbFileText,
    category: 'text',
    component: lazy(() => import('./tools/word-counter/WordCounter')),
  },
  {
    id: 'case-converter',
    icon: TbLetterCase,
    category: 'text',
    component: lazy(() => import('./tools/case-converter/CaseConverter')),
  },
  {
    id: 'lorem-generator',
    icon: TbTextWrap,
    category: 'text',
    component: lazy(() => import('./tools/lorem-generator/LoremGenerator')),
  },

  // Hình ảnh
  {
    id: 'image-compressor',
    icon: TbPhotoDown,
    category: 'image',
    component: lazy(() => import('./tools/image-compressor/ImageCompressor')),
  },
  {
    id: 'qr-generator',
    icon: TbQrcode,
    category: 'image',
    component: lazy(() => import('./tools/qr-generator/QrGenerator')),
  },
  {
    id: 'qr-scanner',
    icon: TbScan,
    category: 'image',
    component: lazy(() => import('./tools/qr-scanner/QrScanner')),
    isNew: true,
  },

  // Tài chính
  {
    id: 'salary-calculator',
    icon: TbCash,
    category: 'finance',
    component: lazy(() => import('./tools/salary-calculator/SalaryCalculator')),
  },
  {
    id: 'loan-calculator',
    icon: TbCurrencyDollar,
    category: 'finance',
    component: lazy(() => import('./tools/loan-calculator/LoanCalculator')),
  },
  {
    id: 'currency-converter',
    icon: TbReceipt,
    category: 'finance',
    component: lazy(() => import('./tools/currency-converter/CurrencyConverter')),
  },
  {
    id: 'split-bill',
    icon: TbReceipt,
    category: 'finance',
    component: lazy(() => import('./tools/split-bill/SplitBill')),
  },

  // Tra cứu VN
  {
    id: 'mst-lookup',
    icon: TbSearch,
    category: 'vn-lookup',
    component: lazy(() => import('./tools/mst-lookup/MstLookup')),
  },
  {
    id: 'bank-info',
    icon: TbBuildingBank,
    category: 'vn-lookup',
    component: lazy(() => import('./tools/bank-info/BankInfo')),
  },
  {
    id: 'lunar-calendar',
    icon: TbMoonStars,
    category: 'vn-lookup',
    component: lazy(() => import('./tools/lunar-calendar/LunarCalendar')),
    isNew: true,
  },

  // Tính toán
  {
    id: 'bmi-calculator',
    icon: TbScale,
    category: 'calculator',
    component: lazy(() => import('./tools/bmi-calculator/BmiCalculator')),
  },
  {
    id: 'age-calculator',
    icon: TbCalendar,
    category: 'calculator',
    component: lazy(() => import('./tools/age-calculator/AgeCalculator')),
  },
  {
    id: 'unit-converter',
    icon: TbRulerMeasure,
    category: 'calculator',
    component: lazy(() => import('./tools/unit-converter/UnitConverter')),
  },

  // Năng suất
  {
    id: 'pomodoro',
    icon: TbAlarm,
    category: 'productivity',
    component: lazy(() => import('./tools/pomodoro/PomodoroTimer')),
  },
  {
    id: 'sticky-notes',
    icon: TbNote,
    category: 'productivity',
    component: lazy(() => import('./tools/sticky-notes/StickyNotes')),
  },
  {
    id: 'random-picker',
    icon: TbDice5,
    category: 'productivity',
    component: lazy(() => import('./tools/random-picker/RandomPicker')),
  },
  {
    id: 'password-generator',
    icon: TbPasswordFingerprint,
    category: 'productivity',
    component: lazy(() => import('./tools/password-generator/PasswordGenerator')),
  },
  {
    id: 'temp-mail',
    icon: TbMailPlus,
    category: 'productivity',
    component: lazy(() => import('./tools/temp-mail/TempMail')),
    isNew: true,
  },
  {
    id: 'email-signature',
    icon: TbSignature,
    category: 'productivity',
    component: lazy(() => import('./tools/email-signature/EmailSignature')),
    isNew: true,
  },
];

export function getToolsByCategory(categoryId: CategoryId): ToolMeta[] {
  return tools.filter((t) => t.category === categoryId);
}

export function getToolById(id: string): ToolMeta | undefined {
  return tools.find((t) => t.id === id);
}

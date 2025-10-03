import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Language translations
const translations = {
  en: {
    orders: 'Orders',
    orderManagement: 'Order Management',
    received: 'Received',
    preparing: 'Preparing',
    ready: 'Ready',
    enRoute: 'En Route',
    delivered: 'Delivered',
    allOrders: 'All Orders',
    sortBy: 'Sort By',
    orderTime: 'Order Time',
    status: 'Status',
    title: 'Title',
    location: 'Location',
    ascending: 'Ascending',
    descending: 'Descending',
    perPage: 'Per Page',
    ordersPerPage: 'Orders',
    filter: 'Filter',
    listView: 'List View',
    mapView: 'Map View',
    live: 'Live',
    offline: 'Offline',
    showing: 'Showing',
    of: 'of',
    ordersCount: 'orders',
    noOrdersFound: 'No orders found',
    ordersWillAppear: 'Orders will appear here when they are created.',
    errorLoadingOrders: 'Error loading orders',
    items: 'items',
    actions: 'Actions',
    subItems: 'Sub-Items',
    orderId: 'Order ID',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    autoRefresh: 'Auto Refresh',
    on: 'On',
    off: 'Off',
    language: 'Language',
    order: 'Order',
    display: 'Display',
    paginated: 'Paginated',
    showAll: 'Show All',
    oneOrder: '1 Order',
    twoOrders: '2 Orders',
    threeOrders: '3 Orders',
    fourOrders: '4 Orders',
  },
  he: {
    orders: 'הזמנות',
    orderManagement: 'ניהול הזמנות',
    received: 'התקבל',
    preparing: 'בהכנה',
    ready: 'מוכן',
    enRoute: 'בדרך',
    delivered: 'נמסר',
    allOrders: 'כל ההזמנות',
    sortBy: 'מיון לפי',
    orderTime: 'זמן הזמנה',
    status: 'סטטוס',
    title: 'כותרת',
    location: 'מיקום',
    ascending: 'עולה',
    descending: 'יורד',
    perPage: 'לעמוד',
    ordersPerPage: 'הזמנות',
    filter: 'סינון',
    listView: 'תצוגת רשימה',
    mapView: 'תצוגת מפה',
    live: 'חי',
    offline: 'לא מקוון',
    showing: 'מציג',
    of: 'מתוך',
    ordersCount: 'הזמנות',
    noOrdersFound: 'לא נמצאו הזמנות',
    ordersWillAppear: 'הזמנות יופיעו כאן כאשר הן נוצרות.',
    errorLoadingOrders: 'שגיאה בטעינת הזמנות',
    items: 'פריטים',
    actions: 'פעולות',
    subItems: 'תת-פריטים',
    orderId: 'מזהה הזמנה',
    darkMode: 'מצב כהה',
    lightMode: 'מצב בהיר',
    autoRefresh: 'רענון אוטומטי',
    on: 'פועל',
    off: 'כבוי',
    language: 'שפה',
    order: 'סדר',
    display: 'תצוגה',
    paginated: 'מעודכן',
    showAll: 'הצג הכל',
    oneOrder: '1 הזמנה',
    twoOrders: '2 הזמנות',
    threeOrders: '3 הזמנות',
    fourOrders: '4 הזמנות',
  },
  ar: {
    orders: 'الطلبات',
    orderManagement: 'إدارة الطلبات',
    received: 'تم الاستلام',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    enRoute: 'في الطريق',
    delivered: 'تم التسليم',
    allOrders: 'جميع الطلبات',
    sortBy: 'ترتيب حسب',
    orderTime: 'وقت الطلب',
    status: 'الحالة',
    title: 'العنوان',
    location: 'الموقع',
    ascending: 'تصاعدي',
    descending: 'تنازلي',
    perPage: 'في الصفحة',
    ordersPerPage: 'طلبات',
    filter: 'تصفية',
    listView: 'عرض القائمة',
    mapView: 'عرض الخريطة',
    live: 'مباشر',
    offline: 'غير متصل',
    showing: 'عرض',
    of: 'من',
    ordersCount: 'طلبات',
    noOrdersFound: 'لم يتم العثور على طلبات',
    ordersWillAppear: 'ستظهر الطلبات هنا عند إنشائها.',
    errorLoadingOrders: 'خطأ في تحميل الطلبات',
    items: 'عناصر',
    actions: 'الإجراءات',
    subItems: 'العناصر الفرعية',
    orderId: 'معرف الطلب',
    darkMode: 'الوضع المظلم',
    lightMode: 'الوضع المضيء',
    autoRefresh: 'التحديث التلقائي',
    on: 'تشغيل',
    off: 'إيقاف',
    language: 'اللغة',
    order: 'ترتيب',
    display: 'العرض',
    paginated: 'مقسم',
    showAll: 'عرض الكل',
    oneOrder: 'طلب واحد',
    twoOrders: 'طلبين',
    threeOrders: '3 طلبات',
    fourOrders: '4 طلبات',
  },
};

type Language = 'en' | 'he' | 'ar';

interface LanguageContextType {
  language: Language;
  rtl: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { language, rtl } = useSelector((state: RootState) => state.settings);
  
  const t = (key: string): string => {
    return translations[language as Language]?.[key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: language as Language, rtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

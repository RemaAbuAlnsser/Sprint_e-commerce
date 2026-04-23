// API Configuration
// في بيئة الإنتاج، يجب تعيين NEXT_PUBLIC_BACKEND_URL في ملف .env.local
// مثال: NEXT_PUBLIC_BACKEND_URL=https://api.mymakeup.com

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';

// Helper function للتحقق من أننا في بيئة الإنتاج
export const isProduction = process.env.NODE_ENV === 'production';

// Helper function لعرض تحذير إذا كان API_URL لا يزال localhost في الإنتاج
if (typeof window !== 'undefined' && isProduction && API_URL.includes('localhost')) {
  console.warn(
    '⚠️ تحذير: تستخدم localhost في بيئة الإنتاج!\n' +
    'يرجى تعيين NEXT_PUBLIC_BACKEND_URL في ملف .env.local\n' +
    'مثال: NEXT_PUBLIC_BACKEND_URL=https://api.mymakeup.com'
  );
}

// Helper function لإنشاء fetch مع credentials
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};


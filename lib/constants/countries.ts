export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  regex: RegExp;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1',   flag: '🇺🇸', regex: /^\d{10}$/ },                     // 1234567890
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', regex: /^(\d{10}|7\d{9})$/ },           // 0123456789 or 07123456789
  { code: 'IN', name: 'India',          dialCode: '+91', flag: '🇮🇳', regex: /^\d{10}$/ },                     // 9876543210
  { code: 'CA', name: 'Canada',         dialCode: '+1',  flag: '🇨🇦', regex: /^\d{10}$/ },                     // same as US
  { code: 'AU', name: 'Australia',      dialCode: '+61', flag: '🇦🇺', regex: /^\d{9}$/ },                     // 412345678
  { code: 'DE', name: 'Germany',        dialCode: '+49', flag: '🇩🇪', regex: /^\d{10,11}$/ },                 // 10-11 digits
  { code: 'FR', name: 'France',         dialCode: '+33', flag: '🇫🇷', regex: /^0\d{9}$/ },                   // 0123456789 (leading 0)
  { code: 'IT', name: 'Italy',          dialCode: '+39', flag: '🇮🇹', regex: /^\d{9,10}$/ },                 // 9-10 digits
  { code: 'ES', name: 'Spain',          dialCode: '+34', flag: '🇪🇸', regex: /^\d{9}$/ },                   // 612345678
  { code: 'BR', name: 'Brazil',         dialCode: '+55', flag: '🇧🇷', regex: /^\d{11}$/ },                  // 11987654321
  { code: 'MX', name: 'Mexico',         dialCode: '+52', flag: '🇲🇽', regex: /^\d{10}$/ },                  // 5512345678
  { code: 'AR', name: 'Argentina',      dialCode: '+54', flag: '🇦🇷', regex: /^\d{10}$/ },                  // 1123456789
  { code: 'CN', name: 'China',          dialCode: '+86', flag: '🇨🇳', regex: /^\d{11}$/ },                  // 13800138000
  { code: 'JP', name: 'Japan',          dialCode: '+81', flag: '🇯🇵', regex: /^\d{10}$/ },                  // 09012345678
  { code: 'KR', name: 'South Korea',    dialCode: '+82', flag: '🇰🇷', regex: /^\d{9,10}$/ },                // 10-123-4567 → 101234567
  { code: 'SG', name: 'Singapore',      dialCode: '+65', flag: '🇸🇬', regex: /^\d{8}$/ },                   // 61234567
  { code: 'AE', name: 'UAE',            dialCode: '+971',flag: '🇦🇪', regex: /^\d{9}$/ },                   // 501234567
  { code: 'SA', name: 'Saudi Arabia',   dialCode: '+966',flag: '🇸🇦', regex: /^\d{9}$/ },                   // 501234567
  { code: 'ZA', name: 'South Africa',   dialCode: '+27', flag: '🇿🇦', regex: /^\d{9}$/ },                   // 821234567
  { code: 'NG', name: 'Nigeria',        dialCode: '+234',flag: '🇳🇬', regex: /^\d{10}$/ },                  // 8012345678
  { code: 'KE', name: 'Kenya',          dialCode: '+254',flag: '🇰🇪', regex: /^\d{9}$/ },                   // 712345678
  { code: 'EG', name: 'Egypt',          dialCode: '+20', flag: '🇪🇬', regex: /^\d{10}$/ },                  // 1001234567
  { code: 'RU', name: 'Russia',         dialCode: '+7',  flag: '🇷🇺', regex: /^\d{10}$/ },                  // 9123456789
  { code: 'TR', name: 'Turkey',         dialCode: '+90', flag: '🇹🇷', regex: /^\d{10}$/ },                  // 5321234567
  { code: 'PL', name: 'Poland',         dialCode: '+48', flag: '🇵🇱', regex: /^\d{9}$/ },                   // 512345678
  { code: 'NL', name: 'Netherlands',    dialCode: '+31', flag: '🇳🇱', regex: /^\d{9}$/ },                   // 612345678
  { code: 'BE', name: 'Belgium',        dialCode: '+32', flag: '🇧🇪', regex: /^\d{9}$/ },                   // 471234567
  { code: 'SE', name: 'Sweden',         dialCode: '+46', flag: '🇸🇪', regex: /^\d{9,10}$/ },                // 701234567 or 712345678
  { code: 'NO', name: 'Norway',         dialCode: '+47', flag: '🇳🇴', regex: /^\d{8}$/ },                   // 41234567
  { code: 'DK', name: 'Denmark',        dialCode: '+45', flag: '🇩🇰', regex: /^\d{8}$/ },                   // 20123456
  { code: 'FI', name: 'Finland',        dialCode: '+358',flag: '🇫🇮', regex: /^\d{7,10}$/ },                // 9123456 … 9123456789
  { code: 'CH', name: 'Switzerland',    dialCode: '+41', flag: '🇨🇭', regex: /^\d{9}$/ },                   // 791234567
  { code: 'AT', name: 'Austria',        dialCode: '+43', flag: '🇦🇹', regex: /^\d{10,13}$/ },               // 10-13 digits
  { code: 'PT', name: 'Portugal',       dialCode: '+351',flag: '🇵🇹', regex: /^\d{9}$/ },                   // 912345678
  { code: 'GR', name: 'Greece',         dialCode: '+30', flag: '🇬🇷', regex: /^\d{10}$/ },                  // 6912345678
  { code: 'IL', name: 'Israel',         dialCode: '+972',flag: '🇮🇱', regex: /^\d{9}$/ },                   // 501234567
  { code: 'TH', name: 'Thailand',       dialCode: '+66', flag: '🇹🇭', regex: /^\d{9}$/ },                   // 812345678
  { code: 'MY', name: 'Malaysia',       dialCode: '+60', flag: '🇲🇾', regex: /^\d{9,10}$/ },                // 12-1234567 or 123456789
  { code: 'ID', name: 'Indonesia',      dialCode: '+62', flag: '🇮🇩', regex: /^\d{9,12}$/ },                // 812345678 … 81234567890
  { code: 'PH', name: 'Philippines',    dialCode: '+63', flag: '🇵🇭', regex: /^\d{10}$/ },                  // 9123456789
  { code: 'VN', name: 'Vietnam',        dialCode: '+84', flag: '🇻🇳', regex: /^\d{9,10}$/ },                // 912345678 or 1234567890
  { code: 'PK', name: 'Pakistan',       dialCode: '+92', flag: '🇵🇰', regex: /^\d{10}$/ },                  // 3001234567
  { code: 'BD', name: 'Bangladesh',     dialCode: '+880',flag: '🇧🇩', regex: /^\d{10}$/ },                  // 1712345678
  { code: 'NZ', name: 'New Zealand',    dialCode: '+64', flag: '🇳🇿', regex: /^\d{8,10}$/ },                // 21123456 … 211234567
  { code: 'IE', name: 'Ireland',        dialCode: '+353',flag: '🇮🇪', regex: /^\d{9}$/ },                   // 851234567
];

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared icon library — Trekly
// Used in: landing/turlar category filter bar + admin panel category management
// Style: 24×24 viewBox, strokeWidth 1.8, round caps/joins, fill none
// ─────────────────────────────────────────────────────────────────────────────

type IP = { color: string; size?: number };

function Svg({ color, size = 24, children }: { color: string; size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// ── CATEGORY FILTER ICONS ────────────────────────────────────────────────────

/** Tümü — 4 rounded squares, bottom-right is a circle */
export const IconAll = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="2" y="2" width="9" height="9" rx="2.5" />
    <rect x="13" y="2" width="9" height="9" rx="2.5" />
    <rect x="2" y="13" width="9" height="9" rx="2.5" />
    <circle cx="17.5" cy="17.5" r="4.5" />
  </Svg>
);

/** Trekking — hiker with backpack and trekking pole, curved trail */
export const IconTrekking = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="15.5" cy="3.8" r="1.8" />
    <path d="M14.2 2.5 Q15.5 1.2 16.8 2.5" />
    <path d="M15 5.5 L13 11" />
    <path d="M14.2 6 Q11 5.5 10.5 9 Q10.5 11.2 13.2 11.2" />
    <path d="M14.8 7.5 L17.5 6.2" />
    <path d="M17.5 6.2 L22 18.5" />
    <path d="M13.5 8.5 L10.5 11.5" />
    <path d="M13 11 L11 17 L9.5 22" />
    <path d="M13 11 L15 17.5 L13.5 22" />
    <path d="M2 21.5 Q7 19.5 13 21.5 Q18 23 23 21.5" />
  </Svg>
);

/** Dağcılık — person on mountain summit with flag */
export const IconDagcilik = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M1 21 L5.5 10.5 L9.5 15.5 L13.5 4.5 L17.5 11 L20.5 7 L23.5 21" />
    <line x1="0.5" y1="21" x2="24" y2="21" strokeWidth="1.8" />
    <circle cx="13.5" cy="3" r="1.5" />
    <line x1="13.5" y1="4.5" x2="13.5" y2="9" />
    <path d="M13.5 4.5 L18 6 L13.5 7.5" />
  </Svg>
);

/** Kano — sailboat with large sail and hull on waves */
export const IconKano = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <line x1="11" y1="2" x2="11" y2="18" />
    <path d="M11 2 L2 18 L11 18 Z" />
    <path d="M11 6.5 L20 18 L11 18" />
    <line x1="5.5" y1="14" x2="16.5" y2="13" strokeWidth="1.2" />
    <path d="M2 18 L22 18" />
    <path d="M3.5 21 L20.5 21" />
    <line x1="2" y1="18" x2="3.5" y2="21" />
    <line x1="22" y1="18" x2="20.5" y2="21" />
    <path d="M1 23.5 Q5 22 9 23.5 Q13 25 17 23.5 Q21 22 24 23.5" strokeWidth="1.2" />
  </Svg>
);

/** Rafting — windsurfer (water action/adventure sport) */
export const IconRafting = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M15.5 1.5 Q23.5 7 22 17.5 Q16 21.5 8 16.5" />
    <line x1="12" y1="4" x2="8" y2="16.5" />
    <circle cx="7" cy="11" r="1.5" />
    <path d="M7 12.5 L7 16.5" />
    <path d="M2.5 19.5 Q12 17.5 22 20" />
    <path d="M1 22.5 Q5 21 9 22.5 Q13 24 17 22.5 Q21 21 24 22.5" strokeWidth="1.2" />
  </Svg>
);

/** Bisiklet — cyclist with helmet on detailed bicycle */
export const IconBisiklet = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="6.5" cy="17" r="4.5" />
    <circle cx="17.5" cy="17" r="4.5" />
    <path d="M6.5 17 L12 9 L17.5 17" />
    <path d="M12 9 L14.5 13.5 L17.5 17" />
    <line x1="11.5" y1="9" x2="17.5" y2="9" />
    <line x1="10" y1="8" x2="14" y2="8" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="9" />
    <line x1="17.5" y1="9" x2="20" y2="8" strokeWidth="2" />
    <line x1="17.5" y1="8" x2="17.5" y2="11" />
    <circle cx="14.5" cy="5.5" r="1.8" />
    <path d="M14 7.2 Q12.5 9 12 9" />
    <path d="M14.8 7.5 Q17 8.5 17.5 10.5" />
  </Svg>
);

/** Kamp — two overlapping tents with campfire */
export const IconKamp = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M2.5 20.5 L10 5 L17.5 20.5" />
    <path d="M7.5 20.5 L14 9 L20.5 20.5" />
    <path d="M11.5 20.5 L14 14.5 L16.5 20.5" />
    <line x1="1" y1="20.5" x2="22.5" y2="20.5" strokeWidth="1.5" />
    <path d="M9 24 Q8.5 21.5 10 21 Q11 20.5 12 21 Q13.5 20.5 14 22 Q14.5 23.5 13 24" />
    <path d="M10.5 23.5 Q10.5 22 11.5 21.5 Q12 22 12 23.5" strokeWidth="1.2" />
  </Svg>
);

/** Dalış — rock climber on vertical face (closest gear+vertical sport to diving) */
export const IconDalis = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M16 1 L16 20.5 Q16 22 14 22 L10.5 22" strokeWidth="1.6" />
    <path d="M19 3 L19 22.5" strokeWidth="1.1" />
    <circle cx="9" cy="7" r="2" />
    <path d="M7.5 5.8 Q9 4.5 10.5 5.8" strokeWidth="1.2" />
    <path d="M9 9 L9 14" />
    <path d="M9 10.5 L5.5 12.5" />
    <path d="M9 10 L13.5 8.5" />
    <path d="M9 14 L6 18" />
    <path d="M9 14 L12.5 17.5" />
    <path d="M9 9 Q11.5 11 11 16" strokeWidth="1" strokeDasharray="1.5 1.5" />
  </Svg>
);

/** Yamaç Paraşütü — trail runner in mountain landscape */
export const IconParasut = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M1 19 L5.5 10 L9.5 14 L13.5 4 L19.5 12.5 L23.5 19" strokeWidth="1.5" />
    <circle cx="17.5" cy="9" r="1.8" />
    <path d="M17 11 L16 15.5" />
    <path d="M16.5 12 L14 10.5" />
    <path d="M16.5 12.5 L19 11" />
    <path d="M16 15.5 L14 20 L12 23" />
    <path d="M16 15.5 L18 20 L20 23" />
    <line x1="5" y1="16" x2="9.5" y2="16" strokeWidth="1.6" />
    <line x1="3" y1="19" x2="7.5" y2="19" strokeWidth="1.6" />
  </Svg>
);

// ── ADMIN UTILITY ICONS ──────────────────────────────────────────────────────
// Saved for future use in agency panel category/tour management forms

/** ID / Badge — for membership/registration */
export const IconBadge = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="2" y="5" width="20" height="15" rx="3" />
    <path d="M9 2 Q9 1 10 1 L14 1 Q15 1 15 2 L15 5 L9 5 Z" />
    <circle cx="12" cy="3" r="0.7" fill={color} stroke="none" />
    <rect x="4" y="8" width="5" height="5" rx="1" />
    <circle cx="6.5" cy="9.7" r="1.1" />
    <path d="M4.5 12.5 Q6.5 11 8.5 12.5" />
    <line x1="11" y1="9" x2="18" y2="9" />
    <line x1="11" y1="11.5" x2="17" y2="11.5" />
    <line x1="11" y1="14" x2="15" y2="14" />
    <rect x="15" y="10" width="3" height="3" rx="0.5" strokeWidth="1.2" />
  </Svg>
);

/** Email @ — for contact email field */
export const IconEmailAt = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 4 L12 13 L22 4" />
  </Svg>
);

/** Calendar — for tour date field */
export const IconCalendar = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="2" y="4" width="20" height="18" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="7" y1="2" x2="7" y2="6" />
    <line x1="17" y1="2" x2="17" y2="6" />
    <rect x="5" y="13" width="3" height="3" rx="0.5" />
    <rect x="10.5" y="13" width="3" height="3" rx="0.5" />
    <rect x="16" y="13" width="3" height="3" rx="0.5" />
    <rect x="5" y="18" width="3" height="3" rx="0.5" />
    <rect x="10.5" y="18" width="3" height="3" rx="0.5" />
    <path d="M17.5 20 L16.5 21 L16 20.5" strokeWidth="2" />
  </Svg>
);

/** Group — for participant/quota field */
export const IconGroup = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 21 Q5 15.5 12 15.5 Q19 15.5 19 21" />
    <circle cx="4.5" cy="8" r="2.5" />
    <path d="M1 20 Q1 15.5 4.5 15.5" />
    <circle cx="19.5" cy="8" r="2.5" />
    <path d="M23 20 Q23 15.5 19.5 15.5" />
  </Svg>
);

/** Info — for tour info/detail sections */
export const IconInfo = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="8" r="0.8" fill={color} stroke="none" />
    <line x1="12" y1="11" x2="12" y2="17" />
  </Svg>
);

/** Location Pin — for tour location field */
export const IconLocation = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M12 2 Q18 2 18 9.5 Q18 15 12 22 Q6 15 6 9.5 Q6 2 12 2 Z" />
    <circle cx="12" cy="9.5" r="3.5" />
    <path d="M8 22 Q12 24 16 22" strokeWidth="1.3" />
  </Svg>
);

/** Building/Institution — for agency/organization */
export const IconBuilding = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M2 22 L2 6 L12 1 L22 6 L22 22" />
    <line x1="2" y1="7.5" x2="22" y2="7.5" strokeWidth="1.5" />
    <line x1="1" y1="22" x2="23" y2="22" strokeWidth="2" />
    <line x1="6" y1="9" x2="6" y2="22" />
    <line x1="10" y1="9" x2="10" y2="22" />
    <line x1="14" y1="9" x2="14" y2="22" />
    <line x1="18" y1="9" x2="18" y2="22" />
    <rect x="5" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="9" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="13" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="17" y="8.5" width="2" height="3" rx="0.3" />
  </Svg>
);

/** Map with Pin — for tour route/map field */
export const IconMap = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M12 3.5 Q15.5 3.5 15.5 8 Q15.5 12 12 17 Q8.5 12 8.5 8 Q8.5 3.5 12 3.5 Z" />
    <circle cx="12" cy="8" r="2.5" />
    <path d="M4 19.5 L1 22 L20 22 L23 19.5 L12 17 Z" />
    <line x1="1" y1="22" x2="4" y2="19.5" />
    <path d="M6 21 L8 20.5 M10 21.5 L13 20.5 M15 21 L18 20" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
  </Svg>
);

/** Tour Guide — person with flag and megaphone */
export const IconGuide = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M12 7.5 L12 14" />
    <path d="M12 10 L9 12" />
    <path d="M12 10 L15 12" />
    <path d="M12 14 L10 20 L9 23" />
    <path d="M12 14 L14 20 L15 23" />
    <rect x="7.5" y="19" width="2.5" height="1.5" rx="0.5" />
    <path d="M4.5 7.5 L3 6.5 L3 11 L4.5 10 Z" />
    <line x1="4.5" y1="7.5" x2="4.5" y2="10" />
    <rect x="3" y="6" width="3" height="5.5" rx="1" strokeWidth="0" fill={color} opacity="0.15" />
    <path d="M17 7 L21 5.5 L21 10.5 L17 9 Z" />
    <line x1="17" y1="7" x2="17" y2="9" />
  </Svg>
);

/** Difficulty / Level — bar chart with slider */
export const IconDifficulty = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="2" y="17" width="4" height="5" rx="2" />
    <rect x="8.5" y="12.5" width="4" height="9.5" rx="2" />
    <rect x="15" y="7.5" width="4" height="14.5" rx="2" />
    <line x1="1" y1="4.5" x2="23" y2="4.5" />
    <circle cx="13" cy="4.5" r="2.5" />
  </Svg>
);

/** Wallet — for price/payment field */
export const IconWallet = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M3 7.5 Q3 4 6 4 L18 4 Q21 4 21 7.5" />
    <rect x="2" y="7.5" width="20" height="14" rx="2.5" />
    <path d="M15.5 7.5 L21 7.5" />
    <circle cx="17" cy="15" r="2" />
    <rect x="14" y="11.5" width="8" height="7" rx="1.5" />
  </Svg>
);

/** WhatsApp — for WhatsApp contact */
export const IconWhatsApp = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M12 2 Q20 2 22 10 Q24 18 17 21.5 L17 21.5 L13 23 L14 20 Q7 19 5 13 Q3 7 8 4 Q9.5 2 12 2 Z" />
    <path d="M9 9 Q9 7.5 10.5 7.5 L11 7.5 Q11.5 7.5 12 9 L12.5 10.5 Q12.7 11.2 12 11.5 Q14 14 15.5 14.5 Q15.8 13.8 16.5 14 L18 14.5 Q19.5 15 19.5 15.5 L19.5 16 Q19.5 17.5 18 17.5 Q13 17.5 9 13 Q7.5 11 9 9 Z" strokeWidth="1.4" />
  </Svg>
);

/** Globe / Website — for website link field */
export const IconWeb = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12 L22 12" />
    <path d="M12 2 Q8 7 8 12 Q8 17 12 22" />
    <path d="M12 2 Q16 7 16 12 Q16 17 12 22" />
    <rect x="4" y="9.5" width="16" height="5" rx="1" />
  </Svg>
);

/** Skiing — for ski/winter sports category */
export const IconSki = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="18" cy="4.5" r="2" />
    <path d="M2 8 L7 6 L12 10 L17 6.5" />
    <path d="M6 6.5 L3 16" />
    <path d="M12 10 L10 18" />
    <line x1="16.5" y1="7" x2="17" y2="6.5" />
    <path d="M2 19 L12 18.5 L22 20" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="3.5" y1="7.5" x2="2.5" y2="5" />
    <line x1="2.5" y1="5" x2="5" y2="4" />
  </Svg>
);

/** Certificate — for certification/requirements */
export const IconCertificate = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M14 2 L4 2 Q2 2 2 4 L2 22 Q2 22 4 22 L15 22" />
    <path d="M14 2 L14 7 L20 7 L14 2 Z" />
    <line x1="6" y1="10" x2="13" y2="10" />
    <line x1="6" y1="13" x2="13" y2="13" />
    <line x1="6" y1="16" x2="10" y2="16" />
    <circle cx="18.5" cy="16.5" r="4" />
    <path d="M15.5 23 L16.5 20.5 L18.5 21 L20.5 20.5 L21.5 23 L19.5 22 Z" />
  </Svg>
);

/** Family / Community — for family-friendly tours */
export const IconFamily = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="13" r="3" fill="none" />
    <circle cx="7" cy="10" r="2" />
    <circle cx="17" cy="10" r="2" />
    <circle cx="12" cy="7" r="2" />
    <path d="M6 21 Q5 16 7 15 L9 15" />
    <path d="M18 21 Q19 16 17 15 L15 15" />
    <path d="M9 16 Q12 14.5 15 16 L16 21 L8 21 Z" />
    <path d="M9 8 L7 10" />
    <path d="M15 8 L17 10" />
    <path d="M7.5 3 Q7 1.5 8.5 2.5" strokeWidth="1.4" />
    <path d="M12 1.5 L12 3" />
    <path d="M16.5 3 Q17 1.5 15.5 2.5" strokeWidth="1.4" />
  </Svg>
);

/** Jeep / Safari — for off-road/safari tours */
export const IconJeep = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <rect x="4" y="7" width="16" height="10" rx="2" />
    <rect x="6" y="9" width="5" height="4" rx="1" />
    <rect x="13" y="9" width="5" height="4" rx="1" />
    <circle cx="7.5" cy="18.5" r="2.5" />
    <circle cx="16.5" cy="18.5" r="2.5" />
    <path d="M1 15 L4 7" />
    <path d="M23 15 L20 7" />
    <line x1="1" y1="15" x2="23" y2="15" />
    <path d="M1 17 L4 20" strokeWidth="1.2" />
    <path d="M23 17 L20 20" strokeWidth="1.2" />
  </Svg>
);

/** Yoga / Wellness — for wellness/yoga tours */
export const IconYoga = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="4" r="2.5" />
    <path d="M12 6.5 L12 13" />
    <path d="M5 10 Q8.5 8.5 12 10 Q15.5 8.5 19 10" />
    <path d="M12 13 L8 19 L5 22" />
    <path d="M12 13 L16 19 L19 22" />
    <line x1="4" y1="22" x2="20" y2="22" />
  </Svg>
);

/** Sailing / Yacht — extra water sport */
export const IconSailing = ({ color, size }: IP) => IconKano({ color, size });

/** Windsurfing — extra water sport */
export const IconWindsurfing = ({ color, size }: IP) => IconRafting({ color, size });

// ── ICON_MAP — boolean active param, used by filter bar + search bar dropdown ─
// Never delete entries. Add new categories as they are created in admin panel.

const CA = '#FF5533';
const CD = '#6B7280';
const SZ = 26;

export const ICON_MAP: Record<string, (active: boolean) => React.JSX.Element> = {
  // Active categories (current DB set):
  'Kültür Turu':      (a) => <IconBuilding    color={a ? CA : CD} size={SZ} />,
  'Aile Kampı':       (a) => <IconFamily      color={a ? CA : CD} size={SZ} />,
  'Bisiklet':         (a) => <IconBisiklet    color={a ? CA : CD} size={SZ} />,
  'Yelken':           (a) => <IconKano        color={a ? CA : CD} size={SZ} />,
  'Ekspedisyon':      (a) => <IconJeep        color={a ? CA : CD} size={SZ} />,
  'Dağcılık Eğitimi': (a) => <IconCertificate color={a ? CA : CD} size={SZ} />,
  'Su Sporları':      (a) => <IconRafting     color={a ? CA : CD} size={SZ} />,
  'Kayak':            (a) => <IconSki         color={a ? CA : CD} size={SZ} />,
  'Kaya Tırmanışı':   (a) => <IconDalis       color={a ? CA : CD} size={SZ} />,
  'Zirve Tırmanışı':  (a) => <IconDagcilik    color={a ? CA : CD} size={SZ} />,
  'Kamp':             (a) => <IconKamp        color={a ? CA : CD} size={SZ} />,
  'Trekking':         (a) => <IconTrekking    color={a ? CA : CD} size={SZ} />,
  // Legacy categories (kept permanently):
  'kültür turu':      (a) => <IconBuilding    color={a ? CA : CD} size={SZ} />,
  'aile kampı':       (a) => <IconFamily      color={a ? CA : CD} size={SZ} />,
  'bisiklet':         (a) => <IconBisiklet    color={a ? CA : CD} size={SZ} />,
  'yelken':           (a) => <IconKano        color={a ? CA : CD} size={SZ} />,
  'ekspedisyon':      (a) => <IconJeep        color={a ? CA : CD} size={SZ} />,
  'dağcılık eğitimi': (a) => <IconCertificate color={a ? CA : CD} size={SZ} />,
  'su sporları':      (a) => <IconRafting     color={a ? CA : CD} size={SZ} />,
  'kayak':            (a) => <IconSki         color={a ? CA : CD} size={SZ} />,
  'kaya tırmanışı':   (a) => <IconDalis       color={a ? CA : CD} size={SZ} />,
  'zirve tırmanışı':  (a) => <IconDagcilik    color={a ? CA : CD} size={SZ} />,
  'kamp':             (a) => <IconKamp        color={a ? CA : CD} size={SZ} />,
  'trekking':         (a) => <IconTrekking    color={a ? CA : CD} size={SZ} />,
  'dağcılık':         (a) => <IconDagcilik    color={a ? CA : CD} size={SZ} />,
  'kano':             (a) => <IconKano        color={a ? CA : CD} size={SZ} />,
  'rafting':          (a) => <IconRafting     color={a ? CA : CD} size={SZ} />,
  'dalış':            (a) => <IconDalis       color={a ? CA : CD} size={SZ} />,
  'yamaç paraşütü':   (a) => <IconParasut     color={a ? CA : CD} size={SZ} />,
};

// ── CATEGORY KEY → ICON MAP (props-based, icon_key lookup — always lowercase) ─

export const CATEGORY_ICON_MAP: Record<string, (props: IP) => React.JSX.Element> = {
  '__all__':          IconAll,
  'trekking':         IconTrekking,
  'dağcılık':         IconDagcilik,
  'kano':             IconKano,
  'rafting':          IconRafting,
  'bisiklet':         IconBisiklet,
  'kamp':             IconKamp,
  'dalış':            IconDalis,
  'yamaç paraşütü':   IconParasut,
  'kayak':            IconSki,
  'yelken':           IconSailing,
  'rüzgar sörfü':     IconWindsurfing,
  'yoga':             IconYoga,
  'safari':           IconJeep,
  'jeep safari':      IconJeep,
  'aile':             IconFamily,
  'aile kampı':       IconFamily,
  'kültür turu':      IconBuilding,
  'sertifika':        IconCertificate,
  'zirve tırmanışı':  IconDagcilik,
  'kaya tırmanışı':   IconDalis,
  'su sporları':      IconRafting,
  'dağcılık eğitimi': IconCertificate,
  'ekspedisyon':      IconJeep,
};

// ── ADMIN ICON PALETTE ───────────────────────────────────────────────────────
// Full set for admin panel form fields and UI elements

export const ADMIN_ICONS = {
  badge:        IconBadge,
  email:        IconEmailAt,
  calendar:     IconCalendar,
  group:        IconGroup,
  info:         IconInfo,
  location:     IconLocation,
  building:     IconBuilding,
  map:          IconMap,
  guide:        IconGuide,
  difficulty:   IconDifficulty,
  wallet:       IconWallet,
  whatsapp:     IconWhatsApp,
  web:          IconWeb,
  ski:          IconSki,
  certificate:  IconCertificate,
  family:       IconFamily,
  jeep:         IconJeep,
  yoga:         IconYoga,
  trekking:     IconTrekking,
  cycling:      IconBisiklet,
  climbing:     IconDagcilik,
  camping:      IconKamp,
  sailing:      IconSailing,
  windsurfing:  IconWindsurfing,
};

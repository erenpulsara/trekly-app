import React from 'react';

type IP = { color: string; size?: number };

function Svg({ color, size = 24, children }: { color: string; size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const IconTrekking = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="15.5" cy="3.8" r="1.8" />
    <path d="M15 5.5 L13 11" />
    <path d="M14.2 6 Q11 5.5 10.5 9 Q10.5 11.2 13.2 11.2" />
    <path d="M14.8 7.5 L17.5 6.2" />
    <path d="M17.5 6.2 L22 18.5" />
    <path d="M13 11 L11 17 L9.5 22" />
    <path d="M13 11 L15 17.5 L13.5 22" />
    <path d="M2 21.5 Q7 19.5 13 21.5 Q18 23 23 21.5" />
  </Svg>
);

export const IconDagcilik = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M1 21 L5.5 10.5 L9.5 15.5 L13.5 4.5 L17.5 11 L20.5 7 L23.5 21" />
    <line x1="0.5" y1="21" x2="24" y2="21" />
    <circle cx="13.5" cy="3" r="1.5" />
    <path d="M13.5 4.5 L18 6 L13.5 7.5" />
  </Svg>
);

export const IconKano = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <line x1="11" y1="2" x2="11" y2="18" />
    <path d="M11 2 L2 18 L11 18 Z" />
    <path d="M11 6.5 L20 18 L11 18" />
    <path d="M2 18 L22 18" />
    <path d="M3.5 21 L20.5 21" />
  </Svg>
);

export const IconRafting = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M15.5 1.5 Q23.5 7 22 17.5 Q16 21.5 8 16.5" />
    <line x1="12" y1="4" x2="8" y2="16.5" />
    <circle cx="7" cy="11" r="1.5" />
    <path d="M7 12.5 L7 16.5" />
    <path d="M2.5 19.5 Q12 17.5 22 20" />
  </Svg>
);

export const IconBisiklet = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="6.5" cy="17" r="4.5" />
    <circle cx="17.5" cy="17" r="4.5" />
    <path d="M6.5 17 L12 9 L17.5 17" />
    <path d="M12 9 L14.5 13.5 L17.5 17" />
    <line x1="11.5" y1="9" x2="17.5" y2="9" />
    <circle cx="14.5" cy="5.5" r="1.8" />
  </Svg>
);

export const IconKamp = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M2.5 20.5 L10 5 L17.5 20.5" />
    <path d="M7.5 20.5 L14 9 L20.5 20.5" />
    <line x1="1" y1="20.5" x2="22.5" y2="20.5" strokeWidth="1.5" />
    <path d="M9 24 Q8.5 21.5 10 21 Q11 20.5 12 21 Q13.5 20.5 14 22 Q14.5 23.5 13 24" />
  </Svg>
);

export const IconDalis = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M16 1 L16 20.5 Q16 22 14 22 L10.5 22" />
    <circle cx="9" cy="7" r="2" />
    <path d="M9 9 L9 14" />
    <path d="M9 10.5 L5.5 12.5" />
    <path d="M9 10 L13.5 8.5" />
    <path d="M9 14 L6 18" />
    <path d="M9 14 L12.5 17.5" />
  </Svg>
);

export const IconParasut = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M1 19 L5.5 10 L9.5 14 L13.5 4 L19.5 12.5 L23.5 19" strokeWidth="1.5" />
    <circle cx="17.5" cy="9" r="1.8" />
    <path d="M17 11 L16 15.5" />
    <path d="M16 15.5 L14 20 L12 23" />
    <path d="M16 15.5 L18 20 L20 23" />
  </Svg>
);

export const IconSki = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="18" cy="4.5" r="2" />
    <path d="M2 8 L7 6 L12 10 L17 6.5" />
    <path d="M6 6.5 L3 16" />
    <path d="M12 10 L10 18" />
    <path d="M2 19 L12 18.5 L22 20" strokeWidth="2.2" />
  </Svg>
);

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
  </Svg>
);

export const IconBuilding = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M2 22 L2 6 L12 1 L22 6 L22 22" />
    <line x1="2" y1="7.5" x2="22" y2="7.5" />
    <line x1="1" y1="22" x2="23" y2="22" strokeWidth="2" />
    <rect x="5" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="9" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="13" y="8.5" width="2" height="3" rx="0.3" />
    <rect x="17" y="8.5" width="2" height="3" rx="0.3" />
  </Svg>
);

export const IconFamily = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="12" cy="13" r="3" />
    <circle cx="7" cy="10" r="2" />
    <circle cx="17" cy="10" r="2" />
    <circle cx="12" cy="7" r="2" />
    <path d="M6 21 Q5 16 7 15 L9 15" />
    <path d="M18 21 Q19 16 17 15 L15 15" />
    <path d="M9 16 Q12 14.5 15 16 L16 21 L8 21 Z" />
  </Svg>
);

export const IconCertificate = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <path d="M14 2 L4 2 Q2 2 2 4 L2 22 Q2 22 4 22 L15 22" />
    <path d="M14 2 L14 7 L20 7 L14 2 Z" />
    <line x1="6" y1="10" x2="13" y2="10" />
    <line x1="6" y1="13" x2="13" y2="13" />
    <circle cx="18.5" cy="16.5" r="4" />
    <path d="M15.5 23 L16.5 20.5 L18.5 21 L20.5 20.5 L21.5 23 L19.5 22 Z" />
  </Svg>
);

export const IconSailing  = ({ color, size }: IP) => <IconKano    color={color} size={size} />;
export const IconWindsurf = ({ color, size }: IP) => <IconRafting color={color} size={size} />;

export const IconSnowboard = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="15.5" cy="3.5" r="2" />
    <path d="M14 5.8 Q11.5 8.5 10 12" />
    <path d="M14.5 6.5 L18 9" />
    <path d="M10 12 L8.5 16" />
    <path d="M10 12 L13.5 14" />
    <path d="M1.5 20.5 Q6 17.5 12.5 18.5 Q17.5 19 22.5 17" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

export const IconJetski = ({ color, size }: IP) => (
  <Svg color={color} size={size}>
    <circle cx="15" cy="4" r="2" />
    <path d="M14 6 L13 9.5" />
    <path d="M13 7.5 L10 7" />
    <path d="M10 7 L9.5 9.5" />
    <path d="M3 13.5 Q5 11.5 9.5 11 L15 11 Q18.5 11 20 13" />
    <path d="M2 14.5 Q10 17 20 13.5" />
    <path d="M1 17 Q7 15 13 16.5 Q17 17.5 20 16" strokeWidth="1.2" />
    <path d="M2 19.5 Q8 18 14 19 Q17 19.5 20 18.5" strokeWidth="1" />
  </Svg>
);

// ── AUTO KEYWORD MATCHING ─────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

export function autoMatchIcon(name: string): React.ComponentType<IP> | null {
  const n = normalize(name);
  if (/snowboard|buz paten|kis spor/.test(n))              return IconSnowboard;
  if (/jetski|jet.ski|jet ski|su scooter|deniz scooter/.test(n)) return IconJetski;
  if (/kayak|ski|kizak/.test(n))                           return IconSki;
  if (/yoga|meditasyon|pilates|wellness/.test(n))          return IconYoga;
  if (/jeep|safari|off.?road|4x4|arazi/.test(n))          return IconJeep;
  if (/kultur|muzey|tarih|sehir|city|kent/.test(n))        return IconBuilding;
  if (/aile|family|cocuk|kid|bebek/.test(n))               return IconFamily;
  if (/sertifika|certificate|egitim|kurs|course/.test(n))  return IconCertificate;
  if (/parasut|yamac|hang.glid|paraglid|ucus/.test(n))     return IconParasut;
  if (/bisiklet|bike|cycling|mtb|bmx/.test(n))             return IconBisiklet;
  if (/kamp|camp|bivi|doga|outdoor/.test(n))               return IconKamp;
  if (/rafting|nehir|sorf|surf/.test(n))                   return IconRafting;
  if (/kano|yelken|sail|tekne|deniz/.test(n))              return IconKano;
  if (/dalis|sualt|scuba|snorkel|swim|yuzme/.test(n))     return IconDalis;
  if (/tirmanis|boulder|rock.climb/.test(n))               return IconDalis;
  if (/dag|zirve|summit|mountain|alpin/.test(n))           return IconDagcilik;
  if (/trekking|hiking|yuruyus|patika|trail/.test(n))      return IconTrekking;
  return null;
}

// ── ICON PALETTE — for visual picker in admin panel ───────────────────────────

export const ICON_PALETTE: { key: string; label: string; Icon: React.ComponentType<IP> }[] = [
  { key: 'trekking',        label: 'Trekking',     Icon: IconTrekking    },
  { key: 'dağcılık',        label: 'Dağcılık',     Icon: IconDagcilik    },
  { key: 'kano',            label: 'Kano',          Icon: IconKano        },
  { key: 'rafting',         label: 'Rafting',       Icon: IconRafting     },
  { key: 'bisiklet',        label: 'Bisiklet',      Icon: IconBisiklet    },
  { key: 'kamp',            label: 'Kamp',          Icon: IconKamp        },
  { key: 'dalış',           label: 'Dalış',         Icon: IconDalis       },
  { key: 'yamaç paraşütü',  label: 'Paraşüt',       Icon: IconParasut     },
  { key: 'kayak',           label: 'Kayak',         Icon: IconSki         },
  { key: 'yoga',            label: 'Yoga',          Icon: IconYoga        },
  { key: 'jeep safari',     label: 'Jeep Safari',   Icon: IconJeep        },
  { key: 'kültür turu',     label: 'Kültür Turu',   Icon: IconBuilding    },
  { key: 'aile kampı',      label: 'Aile Kampı',    Icon: IconFamily      },
  { key: 'sertifika',       label: 'Sertifika',     Icon: IconCertificate },
  { key: 'yelken',          label: 'Yelken',        Icon: IconSailing     },
  { key: 'rüzgar sörfü',    label: 'Sörf',          Icon: IconWindsurf    },
  { key: 'snowboard',       label: 'Snowboard',     Icon: IconSnowboard   },
  { key: 'jetski',          label: 'Jet Ski',       Icon: IconJetski      },
];

// ── Key → component map (for category rows) ───────────────────────────────────

export const ICON_MAP: Record<string, React.ComponentType<IP>> = Object.fromEntries(
  ICON_PALETTE.map(({ key, Icon }) => [key, Icon])
);

// Resolve: ICON_MAP[icon_key] → autoMatchIcon(name) → null
export function resolveIcon(name: string, iconKey?: string | null): React.ComponentType<IP> | null {
  if (iconKey) {
    const byKey = ICON_MAP[iconKey.toLowerCase()];
    if (byKey) return byKey;
  }
  const byName = ICON_MAP[name.toLowerCase()];
  if (byName) return byName;
  return autoMatchIcon(name);
}

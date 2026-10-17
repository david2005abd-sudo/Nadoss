/**
 * Inline SVG icon set (stroke, 24x24) matching the mockup's icon vocabulary.
 * Keeping them inline avoids the lucide-react dependency the source did not use.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Svg({ size = 18, children, ...rest }: IconProps) {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width={size}
   height={size}
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth={1.8}
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
   focusable="false"
   {...rest}
  >
   {children}
  </svg>
 );
}

/* ---------------- UI shell ---------------- */
export function IconBell(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
   <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
 );
}

export function IconSearch(p: IconProps) {
 return (
  <Svg {...p}>
   <circle cx="11" cy="11" r="7" />
   <path d="m21 21-4.3-4.3" />
  </Svg>
 );
}

export function IconPlus(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M12 5v14M5 12h14" />
  </Svg>
 );
}

export function IconX(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
 );
}

export function IconChevronLeft(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="m15 18-6-6 6-6" />
  </Svg>
 );
}

export function IconCheck(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M20 6 9 17l-5-5" />
  </Svg>
 );
}

export function IconMenu(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
 );
}

export function IconAi(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M12 3 13.6 8.4 19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" />
   <path d="M18.5 16.5 19.3 18.7 21.5 19.5 19.3 20.3 18.5 22.5 17.7 20.3 15.5 19.5 17.7 18.7Z" />
  </Svg>
 );
}

/* ---------------- Business type icons ---------------- */
export function IconStore(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 9 5 3h14l2 6" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </Svg>
  );
}

export function IconBag(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
   <path d="M3 6h18" />
   <path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
 );
}

export function IconUtensils(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M3 2v7a3 3 0 0 0 6 0V2" />
   <path d="M6 9v13" />
   <path d="M17 2v20" />
   <path d="M17 10c3 0 4-2 4-5" />
  </Svg>
 );
}

export function IconWrench(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M14.7 6.3a4 4 0 1 0 5 5L21 21a2 2 0 0 1-3 3l-9.3-9.3a4 4 0 1 1-5-5L8.5 9.5" />
  </Svg>
 );
}

export function IconCompass(p: IconProps) {
 return (
  <Svg {...p}>
   <circle cx="12" cy="12" r="10" />
   <path d="m16.2 7.8-2.9 6.4-6.4 2.9 2.9-6.4Z" />
  </Svg>
 );
}

export function IconHome(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
   <path d="M9 22V12h6v10" />
  </Svg>
 );
}

export function IconSparkle(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M12 2.5 13.9 8.1 19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z" />
   <path d="M19 15.5 19.8 17.7 22 18.5 19.8 19.3 19 21.5 18.2 19.3 16 18.5 18.2 17.7Z" />
  </Svg>
 );
}

export function IconBook(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
   <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </Svg>
 );
}

export function IconCpu(p: IconProps) {
 return (
  <Svg {...p}>
   <rect x="4" y="4" width="16" height="16" rx="2" />
   <rect x="9" y="9" width="6" height="6" rx="1" />
   <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </Svg>
 );
}

export function IconCard(p: IconProps) {
 return (
  <Svg {...p}>
   <rect x="2" y="5" width="20" height="14" rx="2" />
   <path d="M2 10h20" />
   <path d="M6 15h4" />
  </Svg>
 );
}

export function IconCode(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="m8 8-5 4 5 4" />
   <path d="m16 8 5 4-5 4" />
   <path d="M14 4l-4 16" />
  </Svg>
 );
}

export function IconCog(p: IconProps) {
 return (
  <Svg {...p}>
   <circle cx="12" cy="12" r="3" />
   <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.6-1.4 1.7 1.7 0 0 0-1.6 1.1l-.1.2a2 2 0 1 1-2.8-2.8l.2-.2a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-2.8l-.1-.2A2 2 0 1 1 6.4 4.6l.2.2a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.2-.2a2 2 0 1 1 2.8 2.8l-.2.2a1.7 1.7 0 0 0 1.2 2.9H22a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1.1Z" />
  </Svg>
 );
}

export function IconLayers(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="m12 2 9 5-9 5-9-5Z" />
   <path d="m3 12 9 5 9-5" />
   <path d="m3 17 9 5 9-5" />
  </Svg>
 );
}

export function IconGrid(p: IconProps) {
 return (
  <Svg {...p}>
   <rect x="3" y="3" width="7" height="7" rx="1" />
   <rect x="14" y="3" width="7" height="7" rx="1" />
   <rect x="14" y="14" width="7" height="7" rx="1" />
   <rect x="3" y="14" width="7" height="7" rx="1" />
  </Svg>
 );
}

/* ---------------- Module icons ---------------- */
export function IconUsers(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
   <circle cx="9" cy="7" r="4" />
   <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
   <path d="M16 3.1a4 4 0 0 1 0 7.8" />
  </Svg>
 );
}

export function IconFolder(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.2 3.9A2 2 0 0 0 7.5 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </Svg>
 );
}

export function IconCart(p: IconProps) {
 return (
  <Svg {...p}>
   <circle cx="9" cy="21" r="1" />
   <circle cx="19" cy="21" r="1" />
   <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
  </Svg>
 );
}

export function IconBox(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
   <path d="m3 8 9 5 9-5" />
   <path d="M12 13v8" />
  </Svg>
 );
}

export function IconCalendar(p: IconProps) {
 return (
  <Svg {...p}>
   <rect x="3" y="4" width="18" height="18" rx="2" />
   <path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
 );
}

export function IconFile(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
   <path d="M14 2v5h6" />
   <path d="M9 13h6M9 17h4" />
  </Svg>
 );
}

export function IconReceipt(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1Z" />
   <path d="M8 7h8M8 11h8M8 15h5" />
  </Svg>
 );
}

export function IconTruck(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M2 16.1V6a1 1 0 0 1 1-1h11v11.1" />
   <path d="M14 9h4l3 3.6V16h-2.1" />
   <circle cx="6.5" cy="17.5" r="2.5" />
   <circle cx="16.5" cy="17.5" r="2.5" />
  </Svg>
 );
}

export function IconChart(p: IconProps) {
 return (
  <Svg {...p}>
   <path d="M3 3v18h18" />
   <path d="m7 15 4-5 3 3 5-6" />
  </Svg>
 );
}

export function IconLayout(p: IconProps) {
 return (
  <Svg {...p}>
   <rect x="3" y="3" width="18" height="18" rx="2" />
   <path d="M3 9h18M9 21V9" />
  </Svg>
 );
}

/* ---------------- Registry lookup ---------------- */
import type { ComponentType } from 'react';

export const ICONS: Record<string, ComponentType<IconProps>> = {
 bell: IconBell,
 search: IconSearch,
 plus: IconPlus,
 x: IconX,
 chevronLeft: IconChevronLeft,
 check: IconCheck,
 menu: IconMenu,
 ai: IconAi,
 sparkle: IconSparkle,
 store: IconStore,
 bag: IconBag,
 utensils: IconUtensils,
 wrench: IconWrench,
 compass: IconCompass,
 home: IconHome,
 book: IconBook,
 cpu: IconCpu,
 card: IconCard,
 code: IconCode,
 cog: IconCog,
 layers: IconLayers,
 grid: IconGrid,
 users: IconUsers,
 folder: IconFolder,
 cart: IconCart,
 box: IconBox,
 calendar: IconCalendar,
 file: IconFile,
 receipt: IconReceipt,
 truck: IconTruck,
 chart: IconChart,
 layout: IconLayout,
};

export function getIcon(name: string, props?: IconProps) {
 const Cmp = ICONS[name] ?? IconGrid;
 return <Cmp {...props} />;
}

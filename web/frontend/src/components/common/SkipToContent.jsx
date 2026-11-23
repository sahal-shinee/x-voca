/**
 * SkipToContent - Accessible keyboard bypass link for screen readers and keyboard users (WCAG 2.4.1).
 * Hidden by default; becomes prominently visible and focused when pressing Tab at page start.
 */
export function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2.5 focus:rounded-xl
        focus:bg-[#5EEAD4] focus:text-[#0D0B14] focus:font-bold focus:text-sm
        focus:shadow-[0_0_25px_rgba(94,234,212,0.6)] focus:outline-none focus:ring-2 focus:ring-white
        transition-all duration-150
      "
    >
      Lewati ke konten utama
    </a>
  );
}

export default SkipToContent;

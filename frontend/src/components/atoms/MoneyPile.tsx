/* Flat money drawings in the page palette, with a few pen strokes for motion. */
export default function MoneyPile() {
  return (
    <svg className="block h-auto mt-0 mx-auto mb-24 overflow-visible w-[min(24rem,_80%)] md:[.lore-side_&]:ml-0 md:[.lore-side.right_&]:ml-auto md:[.lore-side.right_&]:mr-0" viewBox="0 0 260 170" aria-hidden="true">
      <g className="[&_path]:[fill:none] [&_path]:[stroke:var(--color-white)] [&_path]:[stroke-linecap:round] [&_path]:[stroke-width:2.2]">
        <path d="M14 158c50-3 120-4 232-1" />
        <path d="M92 26c-6-6-10-11-12-18M76 40c-8-2-15-5-21-10M228 30c6-5 10-10 13-16" />
      </g>
      <g stroke="#0f0f17" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="30" y="122" width="130" height="28" rx="4" fill="#fff" />
        <rect x="83" y="122" width="22" height="28" fill="#0a3cce" />
        <rect x="42" y="94" width="130" height="28" rx="4" fill="#fff" />
        <rect x="95" y="94" width="22" height="28" fill="#0a3cce" />
        <g transform="rotate(-4 90 80)">
          <rect x="26" y="66" width="130" height="28" rx="4" fill="#fff" />
          <rect x="79" y="66" width="22" height="28" fill="#0a3cce" />
        </g>
      </g>
      <g transform="rotate(12 165 48)">
        <rect x="110" y="20" width="112" height="58" rx="5" fill="#0a3cce" stroke="#fff" strokeWidth="2.5" />
        <rect x="119" y="29" width="94" height="40" rx="3" fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx="166" cy="49" r="13" fill="#fff" />
        <text x="166" y="54" textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="12" fontWeight="600" fill="#0a3cce">
          Rp
        </text>
      </g>
      <g stroke="#0f0f17" strokeWidth="2.5" fill="#fff">
        <path d="M186 150v-10h44v10c0 5-10 8-22 8s-22-3-22-8z" />
        <ellipse cx="208" cy="140" rx="22" ry="7" />
        <path d="M186 138v-10h44v10" />
        <ellipse cx="208" cy="128" rx="22" ry="7" />
        <path d="M186 126v-10h44v10" />
        <ellipse cx="208" cy="116" rx="22" ry="7" fill="#0a3cce" />
      </g>
    </svg>
  )
}

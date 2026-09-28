/**
 * Shared SVG filter that turns clean vector strokes into pencil: a slight wobble
 * (displacement) plus a graphite grain (noise-masked alpha). Referenced as url(#pencil).
 */
export function PencilDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <filter id="pencil" x="-20%" y="-60%" width="140%" height="220%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.035"
          numOctaves="2"
          seed="3"
          result="warp"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="warp"
          scale="2.4"
          xChannelSelector="R"
          yChannelSelector="G"
          result="rough"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.1"
          numOctaves="1"
          seed="9"
          result="grain"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.8 0 0 0 -0.2"
          result="grainAlpha"
        />
        <feComposite in="rough" in2="grainAlpha" operator="in" />
      </filter>
    </svg>
  );
}

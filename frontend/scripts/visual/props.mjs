/* Computed-style properties compared before/after a refactor. Class names are not compared (they change); the resulting styles must not. */
export const PROPS = [
  'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'box-sizing', 'visibility', 'opacity',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'align-items', 'align-self', 'align-content', 'justify-content', 'justify-items', 'justify-self', 'gap', 'row-gap', 'column-gap',
  'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'aspect-ratio',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'outline-width', 'outline-style', 'outline-color', 'outline-offset', 'box-shadow',
  'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-blend-mode',
  'color', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset',
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-variation-settings', 'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-transform', 'text-decoration-line', 'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset', 'text-indent', 'text-overflow', 'text-shadow',
  'white-space', 'word-break', 'overflow-wrap', 'vertical-align', 'list-style-type', 'list-style-position',
  'overflow-x', 'overflow-y', 'transform', 'transform-origin', 'filter', 'backdrop-filter', 'mix-blend-mode', 'clip-path',
  'cursor', 'pointer-events', 'user-select', 'resize', 'appearance', 'object-fit', 'object-position', 'scroll-snap-type', 'scroll-snap-align', 'scroll-margin-top', 'scroll-padding-left', 'content',
]
export const MOTION_PROPS = [
  'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
  'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'will-change', 'scroll-behavior',
]

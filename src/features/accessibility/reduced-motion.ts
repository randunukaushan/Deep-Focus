export function animationMode(reducedMotion: boolean | null): 'static' | 'animated' {
  return reducedMotion === false ? 'animated' : 'static';
}

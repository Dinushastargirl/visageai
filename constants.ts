
import { FaceShape } from './types';

export const FACE_SHAPE_INFO: Record<FaceShape, { title: string; desc: string; tips: { glasses: string; hair: string; makeup: string } }> = {
  Oval: {
    title: 'The Balanced Oval',
    desc: 'Considered the most versatile shape, ovals have balanced proportions and a slightly narrower chin than forehead.',
    tips: {
      glasses: 'Most styles work, especially wide frames that maintain balance.',
      hair: 'Versatile—try long waves or a blunt bob.',
      makeup: 'Focus on highlighting the center of the face.'
    }
  },
  Round: {
    title: 'The Soft Round',
    desc: 'Charactized by soft angles, full cheeks, and width nearly equal to length.',
    tips: {
      glasses: 'Angular or rectangular frames to add definition.',
      hair: 'High-volume styles or long layers to elongate the face.',
      makeup: 'Contour along the jawline and temples to create depth.'
    }
  },
  Square: {
    title: 'The Strong Square',
    desc: 'Features a strong, broad forehead and a wide, angular jawline.',
    tips: {
      glasses: 'Round or oval frames to soften the sharp angles.',
      hair: 'Soft curls or side-swept bangs help round out the edges.',
      makeup: 'Soften the jawline with subtle contouring.'
    }
  },
  Heart: {
    title: 'The Romantic Heart',
    desc: 'Wider forehead that tapers down to a narrow, pointed chin.',
    tips: {
      glasses: 'Bottom-heavy frames or cat-eye styles to balance the width.',
      hair: 'Chin-length bobs or volume near the bottom of the face.',
      makeup: 'Highlight the chin and soften the forehead width.'
    }
  },
  Diamond: {
    title: 'The Elegant Diamond',
    desc: 'Wide cheekbones with a narrower forehead and chin of similar width.',
    tips: {
      glasses: 'Oval or rimless frames to accentuate cheekbones.',
      hair: 'Side-swept bangs or tucking hair behind ears.',
      makeup: 'Focus on highlighting the forehead and chin.'
    }
  },
  Oblong: {
    title: 'The Refined Oblong',
    desc: 'The face is significantly longer than it is wide, often with straight cheek lines.',
    tips: {
      glasses: 'Wide frames with decorative temples to add width.',
      hair: 'Curled styles or chin-length cuts to add horizontal volume.',
      makeup: 'Apply blush horizontally to the apples of the cheeks.'
    }
  }
};

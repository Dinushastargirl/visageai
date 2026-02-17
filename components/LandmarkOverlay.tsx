
import React from 'react';
import { Landmark } from '../types';

interface Props {
  landmarks: Landmark[];
}

const LandmarkOverlay: React.FC<Props> = ({ landmarks }) => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      {/* Draw subtle connections between points */}
      <polygon
        points={landmarks.map(l => `${l.x},${l.y}`).join(' ')}
        className="fill-blue-500/10 stroke-blue-400/30"
        strokeWidth="0.5"
      />
      
      {/* Individual points */}
      {landmarks.map((landmark, idx) => (
        <g key={idx}>
          <circle
            cx={landmark.x}
            cy={landmark.y}
            r="1"
            className="fill-blue-500 animate-pulse"
          />
          <text
            x={landmark.x + 1}
            y={landmark.y - 1}
            fontSize="1.5"
            className="fill-blue-600 font-bold uppercase tracking-tighter"
            style={{ textShadow: '0 0 2px white' }}
          >
            {landmark.label.split('_')[0]}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default LandmarkOverlay;

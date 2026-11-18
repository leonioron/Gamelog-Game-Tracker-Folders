import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showNumeric?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showNumeric = false,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center ${interactive ? 'gap-0.5' : 'gap-0.5'}`}
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFull = currentVal >= starValue;
          const isHalf = !isFull && currentVal >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => {
                if (interactive && onChange) {
                  if (rating === starValue) {
                    onChange(0);
                  } else {
                    onChange(starValue);
                  }
                }
              }}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={`relative transition-transform ${
                interactive
                  ? 'min-h-[36px] min-w-[32px] flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none'
                  : 'cursor-default'
              }`}
              title={interactive ? `Avaliar ${starValue} estrelas` : `${rating} estrelas`}
            >
              <span className="relative inline-flex">
                <Star className={`${starSizes[size]} text-slate-700 transition-colors`} strokeWidth={1.5} />

                {(isFull || isHalf) && (
                  <span
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: isHalf ? '50%' : '100%' }}
                  >
                    <Star
                      className={`${starSizes[size]} fill-amber-400 text-amber-400 transition-colors`}
                      strokeWidth={1.5}
                    />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {showNumeric && rating > 0 && (
        <span className="text-xs font-mono tabular-nums text-amber-400 font-semibold ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

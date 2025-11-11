import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const variantStyles = {
  text: 'h-4 rounded-full',
  circular: 'rounded-full',
  rectangular: 'rounded-xl',
}

const animationStyles = {
  pulse: 'animate-pulse bg-slate-200/70',
  wave: 'relative overflow-hidden bg-slate-200/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
}

export function Skeleton({ variant = 'text', width = '100%', height, count = 1, className, animation = 'pulse' }) {
  const style = { width, height }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('bg-slate-200/60', variantStyles[variant], animationStyles[animation], className)}
          style={style}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  count: PropTypes.number,
  className: PropTypes.string,
  animation: PropTypes.oneOf(['pulse', 'wave']),
}

/*
Example usage:
<Skeleton variant="rectangular" height={180} animation="wave" />
*/

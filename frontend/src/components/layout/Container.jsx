import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-none',
}

export function Container({ maxWidth = 'xl', padding = 'px-4 sm:px-6 lg:px-8', className, children }) {
  return (
    <div className={cn('mx-auto w-full', maxWidthMap[maxWidth], className)}>
      <div className={padding}>{children}</div>
    </div>
  )
}

Container.propTypes = {
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  padding: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
}

/*
Example usage:
<Container maxWidth="xl">
  <Content />
</Container>
*/

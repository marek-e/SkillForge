import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

/**
 * The slide gutter keeps Tailwind's *physical* longhands: `-ml-4` and `pl-4`
 * compile to `margin-left` and `padding-left`, not to the inline-start logical
 * properties, and Blink resolves a physical longhand over the logical property
 * that maps to it whatever the source order. Writing what Tailwind writes keeps
 * the same resolution for the same reason (`conventions.md`, "Value traps").
 *
 * The vertical orientation is the mirror pair (`-mt-4`/`pt-4`), so the two
 * orientations never contest a property and each one is a style object of its
 * own rather than a condition.
 */
const styles = stylex.create({
  // `relative`
  root: {
    position: 'relative',
  },

  // `overflow-hidden` — the viewport Embla measures; it takes no `className`
  viewport: {
    overflow: 'hidden',
  },

  // `flex`
  content: {
    display: 'flex',
  },

  // `-ml-4`
  contentHorizontal: {
    marginLeft: '-1rem',
  },

  // `-mt-4 flex-col`
  contentVertical: {
    marginTop: '-1rem',
    flexDirection: 'column',
  },

  // `min-w-0 shrink-0 grow-0 basis-full`
  item: {
    minWidth: '0rem',
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: '100%',
  },

  // `pl-4`
  itemHorizontal: {
    paddingLeft: '1rem',
  },

  // `pt-4`
  itemVertical: {
    paddingTop: '1rem',
  },

  // `rounded-full absolute touch-manipulation`, shared by both controls.
  // `rounded-full` is Tailwind's `calc(infinity * 1px)`, which the browser
  // clamps to a radius larger than any box it can be given.
  control: {
    position: 'absolute',
    borderRadius: 'calc(infinity * 1px)',
    touchAction: 'manipulation',
  },

  // `top-1/2 -left-12 -translate-y-1/2`. A `-translate-y-1/2` only sets
  // `--tw-translate-y` and then re-declares both axes, so the untouched axis
  // keeps its registered `0` — which is why both are written out here.
  previousHorizontal: {
    top: '50%',
    left: '-3rem',
    translate: '0 -50%',
  },

  // `-top-12 left-1/2 -translate-x-1/2 rotate-90`
  previousVertical: {
    top: '-3rem',
    left: '50%',
    translate: '-50% 0',
    rotate: '90deg',
  },

  // `top-1/2 -right-12 -translate-y-1/2`
  nextHorizontal: {
    top: '50%',
    right: '-3rem',
    translate: '0 -50%',
  },

  // `-bottom-12 left-1/2 -translate-x-1/2 rotate-90`
  nextVertical: {
    bottom: '-3rem',
    left: '50%',
    translate: '-50% 0',
    rotate: '90deg',
  },

  // `sr-only`
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
})

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])

  const sx = stylex.props(styles.root)

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, style, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel()
  const sx = stylex.props(
    styles.content,
    orientation === 'horizontal' ? styles.contentHorizontal : styles.contentVertical
  )

  return (
    <div ref={carouselRef} {...stylex.props(styles.viewport)} data-slot="carousel-content">
      <div
        className={cn(sx.className, className)}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, style, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel()
  const sx = stylex.props(
    styles.item,
    orientation === 'horizontal' ? styles.itemHorizontal : styles.itemVertical
  )

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * Both controls render a `Button`, which is StyleX already, so their own shape
 * and position go through its `sx` prop instead of through `className`: that
 * puts the override in the same cascade layer as the declarations it overrides
 * rather than relying on `utilities` outranking `priorityN`. `rounded-full`
 * replaces the `icon-sm` size's whole `border-radius`, including its
 * `in-data-[slot=button-group]:rounded-lg` arm — which is what the utility did
 * too, since a layer beats a selector. A caller's `sx` is still applied after
 * these, and a caller's `className` still wins over both.
 */
function CarouselPrevious({
  className,
  sx: sxProp,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={className}
      sx={[
        styles.control,
        orientation === 'horizontal' ? styles.previousHorizontal : styles.previousVertical,
        sxProp,
      ]}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span {...stylex.props(styles.srOnly)}>Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  sx: sxProp,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={className}
      sx={[
        styles.control,
        orientation === 'horizontal' ? styles.nextHorizontal : styles.nextVertical,
        sxProp,
      ]}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span {...stylex.props(styles.srOnly)}>Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}

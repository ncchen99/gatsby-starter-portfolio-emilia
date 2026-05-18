/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image"

export type LightboxImage = {
  name: string
  childImageSharp: {
    gatsbyImageData: IGatsbyImageData
  }
}

type LightboxProps = {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const SWIPE_THRESHOLD_RATIO = 0.18
const TRANSITION = `transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)`

const Lightbox: React.FC<LightboxProps> = ({ images, index, onClose, onPrev, onNext }) => {
  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const startX = React.useRef<number | null>(null)
  const startY = React.useRef<number | null>(null)
  const axis = React.useRef<"x" | "y" | null>(null)
  const pendingDir = React.useRef<-1 | 0 | 1>(0)

  const [dragX, setDragX] = React.useState(0)
  const [animating, setAnimating] = React.useState(false)
  const pointerActive = React.useRef(false)
  const pointerId = React.useRef<number | null>(null)

  const getWidth = () => trackRef.current?.clientWidth || (typeof window !== `undefined` ? window.innerWidth : 0)

  const animateTo = React.useCallback(
    (dir: -1 | 1) => {
      if (animating) return
      if (dir === 1 && index >= images.length - 1) return
      if (dir === -1 && index <= 0) return
      const w = getWidth()
      pendingDir.current = dir
      setAnimating(true)
      setDragX(dir === 1 ? -w : w)
    },
    [animating, index, images.length],
  )

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === `Escape`) onClose()
      else if (e.key === `ArrowLeft`) animateTo(-1)
      else if (e.key === `ArrowRight`) animateTo(1)
    }
    window.addEventListener(`keydown`, onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = `hidden`
    return () => {
      window.removeEventListener(`keydown`, onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose, animateTo])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (animating) return
    if (e.pointerType === `mouse` && e.button !== 0) return
    pointerActive.current = true
    pointerId.current = e.pointerId
    startX.current = e.clientX
    startY.current = e.clientY
    axis.current = null
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerActive.current || startX.current === null || startY.current === null || animating) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (axis.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        axis.current = Math.abs(dx) > Math.abs(dy) ? `x` : `y`
      } else {
        return
      }
    }
    if (axis.current !== `x`) return
    let next = dx
    if (index === 0 && next > 0) next *= 0.35
    if (index === images.length - 1 && next < 0) next *= 0.35
    setDragX(next)
  }

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!pointerActive.current) return
    pointerActive.current = false
    try {
      if (pointerId.current !== null) (e.currentTarget as HTMLElement).releasePointerCapture(pointerId.current)
    } catch {}
    pointerId.current = null
    startX.current = null
    startY.current = null
    if (axis.current !== `x`) {
      axis.current = null
      return
    }
    axis.current = null
    const w = getWidth()
    const threshold = w * SWIPE_THRESHOLD_RATIO
    if (dragX < -threshold && index < images.length - 1) {
      pendingDir.current = 1
      setAnimating(true)
      setDragX(-w)
    } else if (dragX > threshold && index > 0) {
      pendingDir.current = -1
      setAnimating(true)
      setDragX(w)
    } else if (dragX !== 0) {
      pendingDir.current = 0
      setAnimating(true)
      setDragX(0)
    }
  }

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== `transform` || !animating) return
    const dir = pendingDir.current
    pendingDir.current = 0
    setAnimating(false)
    setDragX(0)
    if (dir === 1) onNext()
    else if (dir === -1) onPrev()
  }

  const current = images[index]
  if (!current) return null

  const arrowButton = {
    position: `absolute` as const,
    top: `50%`,
    transform: `translateY(-50%)`,
    width: [`44px`, `52px`, `56px`],
    height: [`44px`, `52px`, `56px`],
    borderRadius: `50%`,
    border: `1px solid rgba(255,255,255,0.5)`,
    background: `rgba(0,0,0,0.35)`,
    color: `#fff`,
    display: [`none`, `flex`, `flex`],
    alignItems: `center`,
    justifyContent: `center`,
    cursor: `pointer`,
    zIndex: 10,
    transition: `background 0.2s, transform 0.2s, border-color 0.2s`,
    "&:hover": {
      background: `rgba(255,255,255,0.15)`,
      borderColor: `rgba(255,255,255,0.9)`,
      transform: `translateY(-50%) scale(1.05)`,
    },
    "&:focus-visible": { outline: `2px solid #fff`, outlineOffset: `2px` },
  }

  const slideSx = {
    flex: `0 0 100%`,
    width: `100%`,
    height: `100%`,
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
  }

  const prev = index > 0 ? images[index - 1] : null
  const next = index < images.length - 1 ? images[index + 1] : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.name}
      onClick={onClose}
      sx={{
        position: `fixed`,
        inset: 0,
        zIndex: 9999,
        background: `rgba(0,0,0,0.85)`,
        backdropFilter: `blur(20px)`,
        WebkitBackdropFilter: `blur(20px)`,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
        animation: `lightboxFadeIn 0.25s ease-out`,
        "@keyframes lightboxFadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        sx={{
          position: `absolute`,
          top: [`12px`, `20px`, `24px`],
          right: [`12px`, `20px`, `24px`],
          width: [`40px`, `44px`, `44px`],
          height: [`40px`, `44px`, `44px`],
          borderRadius: `50%`,
          border: `1px solid rgba(255,255,255,0.5)`,
          background: `rgba(0,0,0,0.35)`,
          color: `#fff`,
          fontSize: `20px`,
          cursor: `pointer`,
          zIndex: 10,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `center`,
          transition: `background 0.2s, border-color 0.2s`,
          "&:hover": { background: `rgba(255,255,255,0.15)`, borderColor: `rgba(255,255,255,0.9)` },
        }}
      >
        ×
      </button>

      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation()
          animateTo(-1)
        }}
        sx={{ ...arrowButton, left: [`12px`, `20px`, `32px`] }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation()
          animateTo(1)
        }}
        sx={{ ...arrowButton, right: [`12px`, `20px`, `32px`] }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        sx={{
          width: [`92vw`, `88vw`, `82vw`],
          height: [`80vh`, `85vh`, `88vh`],
          overflow: `hidden`,
          touchAction: `pan-y`,
          userSelect: `none`,
          cursor: `grab`,
          "&:active": { cursor: `grabbing` },
        }}
      >
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(calc(-100% + ${dragX}px), 0, 0)`,
            transition: animating ? TRANSITION : `none`,
          }}
          sx={{
            display: `flex`,
            width: `100%`,
            height: `100%`,
            willChange: `transform`,
          }}
        >
          <div sx={slideSx}>
            {prev && (
              <GatsbyImage
                image={prev.childImageSharp.gatsbyImageData}
                alt={prev.name}
                objectFit="contain"
                draggable={false}
                sx={{ width: `100%`, height: `100%`, pointerEvents: `none`, userSelect: `none` }}
              />
            )}
          </div>
          <div sx={slideSx}>
            <GatsbyImage
              image={current.childImageSharp.gatsbyImageData}
              alt={current.name}
              objectFit="contain"
              sx={{ width: `100%`, height: `100%` }}
            />
          </div>
          <div sx={slideSx}>
            {next && (
              <GatsbyImage
                image={next.childImageSharp.gatsbyImageData}
                alt={next.name}
                objectFit="contain"
                draggable={false}
                sx={{ width: `100%`, height: `100%`, pointerEvents: `none`, userSelect: `none` }}
              />
            )}
          </div>
        </div>
      </div>

      <div
        sx={{
          position: `absolute`,
          bottom: [`16px`, `20px`, `24px`],
          left: `50%`,
          transform: `translateX(-50%)`,
          color: `rgba(255,255,255,0.85)`,
          fontSize: [`12px`, `13px`, `14px`],
          letterSpacing: `0.05em`,
          fontVariantNumeric: `tabular-nums`,
          background: `rgba(0,0,0,0.35)`,
          padding: `4px 12px`,
          borderRadius: `999px`,
        }}
      >
        {index + 1} / {images.length}
      </div>
    </div>
  )
}

export default Lightbox

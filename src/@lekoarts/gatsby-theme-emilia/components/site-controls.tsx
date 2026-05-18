/** @jsx jsx */
import * as React from "react"
import { jsx, Box, Flex, get, Theme, useColorMode } from "theme-ui"
import { Link } from "gatsby"
import useEmiliaConfig from "@lekoarts/gatsby-theme-emilia/src/hooks/use-emilia-config"

const visuallyHidden = {
  border: 0,
  clip: `rect(0 0 0 0)`,
  height: `1px`,
  margin: `-1px`,
  overflow: `hidden`,
  padding: 0,
  position: `absolute`,
  whiteSpace: `nowrap`,
  width: `1px`,
} as const

const iconButton = {
  alignItems: `center`,
  appearance: `none`,
  backgroundColor: `controlBackground`,
  border: (t: Theme) => `1px solid ${get(t, `colors.controlBorder`)}`,
  borderRadius: `999px`,
  boxShadow: `0 10px 30px rgba(15, 23, 42, 0.16)`,
  color: `text`,
  cursor: `pointer`,
  display: `inline-flex`,
  height: [`42px`, `44px`],
  justifyContent: `center`,
  lineHeight: 1,
  p: 0,
  transition: `background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease`,
  width: [`42px`, `44px`],
  "&:hover": {
    transform: `translateY(-1px)`,
  },
  "&:focus-visible": {
    outline: (t: Theme) => `3px solid ${get(t, `colors.focusRing`)}`,
    outlineOffset: `3px`,
  },
} as const

const ThemeIcon = ({ isDark }: { isDark: boolean }) => (
  <Box
    aria-hidden="true"
    sx={{
      borderRadius: `50%`,
      height: `20px`,
      position: `relative`,
      transition: `all 0.25s ease`,
      width: `20px`,
      ...(isDark
        ? {
            backgroundColor: `toggleIcon`,
            boxShadow: (t: Theme) =>
              `0 -7px 0 -4px ${get(t, `colors.toggleIcon`)}, 0 7px 0 -4px ${get(
                t,
                `colors.toggleIcon`
              )}, 7px 0 0 -4px ${get(t, `colors.toggleIcon`)}, -7px 0 0 -4px ${get(t, `colors.toggleIcon`)}`,
          }
        : {
            backgroundColor: `transparent`,
            boxShadow: (t: Theme) => `inset 7px -7px 0 1px ${get(t, `colors.toggleIcon`)}`,
          }),
    }}
  />
)

const MenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <Box
    aria-hidden="true"
    sx={{
      height: `16px`,
      position: `relative`,
      width: `20px`,
      span: {
        backgroundColor: `text`,
        borderRadius: `999px`,
        height: `2px`,
        left: 0,
        position: `absolute`,
        transition: `top 0.2s ease, transform 0.2s ease, opacity 0.2s ease`,
        width: `100%`,
      },
      "span:nth-of-type(1)": {
        top: isOpen ? `7px` : 0,
        transform: isOpen ? `rotate(45deg)` : `none`,
      },
      "span:nth-of-type(2)": {
        opacity: isOpen ? 0 : 1,
        top: `7px`,
      },
      "span:nth-of-type(3)": {
        top: isOpen ? `7px` : `14px`,
        transform: isOpen ? `rotate(-45deg)` : `none`,
      },
    }}
  >
    <span />
    <span />
    <span />
  </Box>
)

const SiteControls = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [colorMode, setColorMode] = useColorMode<"light" | "dark">()
  const { name, socialMedia } = useEmiliaConfig()
  const isDark = colorMode === `dark`
  const panelId = `site-navigation`

  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === `Escape`) {
        setIsOpen(false)
      }
    }

    document.addEventListener(`keydown`, closeOnEscape)

    return () => document.removeEventListener(`keydown`, closeOnEscape)
  }, [])

  const toggleColorMode = () => {
    const next = isDark ? `light` : `dark`
    setColorMode(next)
    document.documentElement.classList.value = `theme-ui-${next}`
  }

  return (
    <Box
      sx={{
        position: `fixed`,
        right: [3, 4],
        top: [3, 4],
        zIndex: 1000,
      }}
    >
      <Flex sx={{ gap: 2, justifyContent: `flex-end` }}>
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-label={isOpen ? `Close navigation menu` : `Open navigation menu`}
          onClick={() => setIsOpen((current) => !current)}
          sx={iconButton}
          type="button"
        >
          <MenuIcon isOpen={isOpen} />
        </button>
        <button
          aria-label={isDark ? `Switch to light theme` : `Switch to dark theme`}
          onClick={toggleColorMode}
          sx={iconButton}
          title={isDark ? `Switch to light theme` : `Switch to dark theme`}
          type="button"
        >
          <ThemeIcon isDark={isDark} />
        </button>
      </Flex>

      <Box
        aria-hidden={!isOpen}
        id={panelId}
        sx={{
          backgroundColor: `controlBackground`,
          border: (t: Theme) => `1px solid ${get(t, `colors.controlBorder`)}`,
          borderRadius: `8px`,
          boxShadow: `0 18px 45px rgba(15, 23, 42, 0.2)`,
          mt: 2,
          opacity: isOpen ? 1 : 0,
          overflow: `hidden`,
          pointerEvents: isOpen ? `auto` : `none`,
          position: `absolute`,
          right: 0,
          transform: isOpen ? `translateY(0)` : `translateY(-8px)`,
          transition: `opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease`,
          visibility: isOpen ? `visible` : `hidden`,
          width: [`min(calc(100vw - 32px), 280px)`, `280px`],
        }}
      >
        <Box as="nav" aria-label="Site navigation" sx={{ p: 2 }}>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            sx={{
              color: `heading`,
              display: `block`,
              fontWeight: `semibold`,
              px: 3,
              py: 3,
              textDecoration: `none`,
              borderRadius: `6px`,
              "&:hover, &:focus-visible": { backgroundColor: `muted` },
            }}
          >
            Home
          </Link>
          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            sx={{
              color: `heading`,
              display: `block`,
              fontWeight: `semibold`,
              px: 3,
              py: 3,
              textDecoration: `none`,
              borderRadius: `6px`,
              "&:hover, &:focus-visible": { backgroundColor: `muted` },
            }}
          >
            About {name}
          </a>
          {socialMedia.map((entry) => (
            <a
              href={entry.href}
              key={entry.title}
              onClick={() => setIsOpen(false)}
              rel="noopener noreferrer"
              sx={{
                color: `heading`,
                display: `block`,
                fontWeight: `semibold`,
                px: 3,
                py: 3,
                textDecoration: `none`,
                borderRadius: `6px`,
                "&:hover, &:focus-visible": { backgroundColor: `muted` },
              }}
              target="_blank"
            >
              {entry.title}
            </a>
          ))}
        </Box>
      </Box>
      <span sx={visuallyHidden} aria-live="polite">
        {isDark ? `Dark theme is active` : `Light theme is active`}
      </span>
    </Box>
  )
}

export default SiteControls

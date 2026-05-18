/** @jsx jsx */
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { jsx, Container } from "theme-ui"
import { animated, useSpring, config } from "react-spring"
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image"
import Layout from "@lekoarts/gatsby-theme-emilia/src/components/layout"
import HeaderProject from "./header-project"
import ProjectPagination from "@lekoarts/gatsby-theme-emilia/src/components/project-pagination"
import Seo from "@lekoarts/gatsby-theme-emilia/src/components/seo"
import Lightbox from "./lightbox"

export type EmiliaProjectProps = {
  project: {
    excerpt: string
    date: string
    slug: string
    title: string
    areas: string[]
    cover: {
      childImageSharp: {
        resize: {
          src: string
        }
      }
    }
  }
  images: {
    nodes: {
      name: string
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData
      }
    }[]
  }
}

export type EmiliaProjectPageContext = {
  prev: {
    slug: string
    contentFilePath: string
    title: string
    cover: {
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData
      }
    }
  }
  next: {
    slug: string
    contentFilePath: string
    title: string
    cover: {
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData
      }
    }
  }
}

const Project: React.FC<React.PropsWithChildren<PageProps<EmiliaProjectProps, EmiliaProjectPageContext>>> = ({
  data: { project, images },
  pageContext: { prev, next },
  children,
}) => {
  const imageFade = useSpring({ config: config.slow, delay: 800, from: { opacity: 0 }, to: { opacity: 1 } })
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const total = images.nodes.length
  const closeLightbox = React.useCallback(() => setLightboxIndex(null), [])
  const prevImage = React.useCallback(() => setLightboxIndex((i) => (i === null ? i : (i - 1 + total) % total)), [total])
  const nextImage = React.useCallback(() => setLightboxIndex((i) => (i === null ? i : (i + 1) % total)), [total])

  return (
    <Layout>
      <HeaderProject title={project.title} description={children} areas={project.areas} date={project.date} />
      <Container
        sx={{
          mt: [`-2rem`, `-3rem`, `-4rem`],
          pt: [3, 4, 4],
          maxWidth: [`100%`, `100%`, `1400px`],
          px: [3, 3, 4],
        }}
      >
        <div
          sx={{
            columnCount: [1, 2, 2, 3],
            columnGap: [2, 3, 3, 4],
          }}
        >
          {images.nodes.map((image, idx) => (
            <animated.div
              key={image.name}
              style={imageFade}
              sx={{
                breakInside: `avoid`,
                WebkitColumnBreakInside: `avoid`,
                pageBreakInside: `avoid`,
                mb: [2, 3, 4],
              }}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`View ${image.name}`}
                sx={{
                  display: `block`,
                  width: `100%`,
                  padding: 0,
                  border: `none`,
                  background: `transparent`,
                  cursor: `zoom-in`,
                  boxShadow: `lg`,
                  overflow: `hidden`,
                  transition: `transform 0.25s ease, box-shadow 0.25s ease`,
                  "&:hover": { transform: `translateY(-2px)`, boxShadow: `xl` },
                  "&:focus-visible": { outline: `2px solid`, outlineColor: `primary`, outlineOffset: `2px` },
                }}
              >
                <GatsbyImage
                  image={image.childImageSharp.gatsbyImageData}
                  alt={image.name}
                  sx={{ display: `block`, width: `100%` }}
                />
              </button>
            </animated.div>
          ))}
        </div>
        <ProjectPagination prev={prev} next={next} />
      </Container>
      {lightboxIndex !== null && (
        <Lightbox
          images={images.nodes}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </Layout>
  )
}

export default Project

export const Head: HeadFC<EmiliaProjectProps> = ({ data: { project } }) => (
  <Seo
    title={project.title}
    description={project.excerpt}
    pathname={project.slug}
    image={project.cover.childImageSharp.resize.src}
  />
)

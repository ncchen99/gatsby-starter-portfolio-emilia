import { merge } from 'theme-ui'
import baseTheme from '@lekoarts/gatsby-theme-emilia/src/gatsby-plugin-theme-ui'

export default merge(baseTheme, {
  colors: {
    controlBackground: `rgba(255, 255, 255, 0.92)`,
    controlBorder: `rgba(15, 23, 42, 0.14)`,
    focusRing: `rgba(49, 130, 206, 0.45)`,
    modes: {
      dark: {
        controlBackground: `rgba(17, 24, 39, 0.88)`,
        controlBorder: `rgba(255, 255, 255, 0.16)`,
        focusRing: `rgba(96, 165, 250, 0.48)`,
      },
    },
  },
  styles: {
    root: {
      // 調慢背景和文字顏色的過渡效果，從預設速度變為 1 秒
      transition: 'background-color 1s ease, color 1s ease'
    }
  }
}) 

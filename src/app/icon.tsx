
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'BioMedLink Icon'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 300,
          background: '#0369a1',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '24%',
          fontWeight: 'bold',
          fontFamily: 'sans-serif'
        }}
      >
        B
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}

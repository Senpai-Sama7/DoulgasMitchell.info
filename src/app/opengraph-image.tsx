import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Douglas Mitchell - Portfolio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontSize: 72,
          fontWeight: 700,
          color: '#fafafa',
        }}
      >
        <span style={{ marginBottom: 20 }}>Douglas Mitchell</span>
        <span style={{ fontSize: 32, fontWeight: 400, color: '#a1a1aa' }}>
          Portfolio & Writing
        </span>
      </div>
    ),
    { ...size }
  );
}
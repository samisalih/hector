export default function Page() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text-muted)',
    }}>
      <span style={{ fontSize: '32px' }}>🚧</span>
      <span style={{ fontSize: '14px' }}>Coming soon</span>
    </div>
  )
}

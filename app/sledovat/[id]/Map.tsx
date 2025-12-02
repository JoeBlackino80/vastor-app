'use client'

export default function Map({ lat, lng }: { lat: number, lng: number }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`
  
  return (
    <iframe 
      src={mapUrl}
      style={{ width: '100%', height: '100%', border: 0 }}
      loading="lazy"
    />
  )
}

'use client'
import { useState, useEffect } from 'react'

export default function LocationMap() {
  const [coords, setCoords] = useState({ lat: 48.1486, lng: 17.1077 }) // default Bratislava

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // ak odmietne, zostane Bratislava
      )
    }
  }, [])

  return (
    <iframe 
      src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coords.lat},${coords.lng}&zoom=14`}
      className="w-full h-48 rounded-xl"
      style={{border:0}}
      allowFullScreen
      loading="lazy"
    />
  )
}

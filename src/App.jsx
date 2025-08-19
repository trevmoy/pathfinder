import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Replace with your API key
        version: "weekly",
        libraries: ["places"]
      })

      const { Map } = await loader.importLibrary("maps")

      const mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 10,
      }

      const mapInstance = new Map(mapRef.current, mapOptions)
      setMap(mapInstance)
    }

    initializeMap()
  }, [])

  return (
    <>
      <div>
        <h1>Pathfinder with Google Maps</h1>
        
        {/* Google Maps container */}
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '400px', margin: '20px 0' }}
        />
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Map loaded above with Google Maps API
          </p>
        </div>
      </div>
    </>
  )
}

export default App
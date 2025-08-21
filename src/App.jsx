import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import './App.css'

function App() {
  const mapRef = useRef(null)
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)
  const [map, setMap] = useState(null)
  const [startAutocomplete, setStartAutocomplete] = useState(null)
  const [endAutocomplete, setEndAutocomplete] = useState(null)
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [startLocation, setStartLocation] = useState(null)
  const [endLocation, setEndLocation] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  
  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
        version: "weekly",
        libraries: ["places"]
      })

      const { Map } = await loader.importLibrary("maps")
      const { Autocomplete } = await loader.importLibrary("places")
      const { DirectionsService, DirectionsRenderer } = await loader.importLibrary("routes")

      const mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 10,
      }

      const mapInstance = new Map(mapRef.current, mapOptions)
      setMap(mapInstance)

      // Initialize directions
      const directionsServiceInstance = new DirectionsService()
      const directionsRendererInstance = new DirectionsRenderer()
      directionsRendererInstance.setMap(mapInstance)
      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)

      // Initialize start autocomplete
      const startAutocompleteInstance = new Autocomplete(startInputRef.current)
      setStartAutocomplete(startAutocompleteInstance)

      // Initialize end autocomplete
      const endAutocompleteInstance = new Autocomplete(endInputRef.current)
      setEndAutocomplete(endAutocompleteInstance)

      // Listen for start location selection
      startAutocompleteInstance.addListener('place_changed', () => {
        const place = startAutocompleteInstance.getPlace()
        if (place.geometry && place.geometry.location) {
          setStartLocation(place.geometry.location)
        }
      })

      // Listen for end location selection
      endAutocompleteInstance.addListener('place_changed', () => {
        const place = endAutocompleteInstance.getPlace()
        if (place.geometry && place.geometry.location) {
          setEndLocation(place.geometry.location)
        }
      })
    }

    initializeMap()
  }, [])

  // Search function triggered by button
  const handleSearchRoute = () => {
    if (startLocation && endLocation && directionsService && directionsRenderer) {
      setIsSearching(true)
      setRouteInfo(null)
      
      const request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      }

      directionsService.route(request, (result, status) => {
        setIsSearching(false)
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
          
          // Extract distance and duration
          const route = result.routes[0]
          const leg = route.legs[0]
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address
          })
        } else {
          console.error('Directions request failed:', status)
          setRouteInfo(null)
        }
      })
    }
  }

  const clearRoute = () => {
    setStartLocation(null)
    setEndLocation(null)
    setRouteInfo(null)
    if (startInputRef.current) startInputRef.current.value = ''
    if (endInputRef.current) endInputRef.current.value = ''
    if (directionsRenderer) directionsRenderer.setDirections({ routes: [] })
  }

  return (
    <>
      <div>
        <h1>Pathfinder Route Planner</h1>
        
        {/* Start Location Search */}
        <div style={{ margin: '10px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Starting Point:
          </label>
          <input
            ref={startInputRef}
            type="text"
            placeholder="Enter starting address..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* End Location Search */}
        <div style={{ margin: '10px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Destination:
          </label>
          <input
            ref={endInputRef}
            type="text"
            placeholder="Enter destination address..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Search and Clear Buttons */}
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <button 
            onClick={handleSearchRoute}
            disabled={!startLocation || !endLocation || isSearching}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: startLocation && endLocation && !isSearching ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: startLocation && endLocation && !isSearching ? 'pointer' : 'not-allowed',
              marginRight: '10px'
            }}
          >
            {isSearching ? 'Searching...' : 'Get Route'}
          </button>
          
          <button 
            onClick={clearRoute}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Route
          </button>
        </div>

        {/* Route Information Display */}
        {routeInfo && (
          <div style={{ 
            margin: '20px 0', 
            padding: '20px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '8px',
            border: '2px solid #007bff'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Route Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <strong>Distance:</strong> {routeInfo.distance}
              </div>
              <div>
                <strong>Duration:</strong> {routeInfo.duration}
              </div>
            </div>
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <p style={{ margin: '5px 0' }}><strong>From:</strong> {routeInfo.startAddress}</p>
              <p style={{ margin: '5px 0' }}><strong>To:</strong> {routeInfo.endAddress}</p>
            </div>
          </div>
        )}
        
        {/* Google Maps container */}
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '500px', margin: '20px 0' }}
        />
        
        <div className="card">
          <p>
            Enter starting point and destination, then click "Get Route" to see the path on the map.
          </p>
        </div>
      </div>
    </>
  )
}

export default App
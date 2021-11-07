import React from 'react'
import { debounce } from 'lodash'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

import { NEXT_PUBLIC_GOOGLE_MAP_API_KEY } from '@/constants/envValues'
import { useMapContext, UPDATE_MAP_CONTROL, SET_MAP } from '@/contexts/mapContext'
import { useStyleContext } from '@/contexts/styleContext'
import { useSpotsContext } from '@/contexts/spotsContext'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/mapConstants'

import styles from './Map.module.scss'
import MapStub from './MapStub'

const PIN_ICON_SRC = '/images/pin.png'

const containerStyle = {
  width: '400px',
  height: '400px',
}

function MapComponent() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
  })

  const { state: { enableControl } = {}, dispatch } = useMapContext()
  const {
    state: { style },
  } = useStyleContext()
  const { state: { spots } = {} } = useSpotsContext()

  const onLoad = React.useCallback((map) => {
    dispatch({ type: SET_MAP, payload: { map } })
  }, [])

  const onUnmount = React.useCallback(() => {
    dispatch({ type: SET_MAP, payload: { map: null } })
  }, [])

  const updateMapControl = debounce(() => {
    dispatch({ type: UPDATE_MAP_CONTROL })
  }, 1500)

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      mapContainerClassName={enableControl ? '' : styles.hideGoogleMapMarks}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      clickableIcons={false}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        gestureHandling: enableControl ? 'auto' : 'none',
        zoomControl: enableControl,
        scaleControl: enableControl,
        rotateControl: enableControl,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: style.config,
      }}
      onIdle={updateMapControl}
    >
      {spots?.map((spot) => {
        if (!spot.selected) return null
        return (
          <Marker
            key={spot.id}
            position={spot.position}
            icon={{
              url: PIN_ICON_SRC,
              size: { width: 64, height: 64 },
              anchor: { x: 16, y: 32 },
              scaledSize: { width: 32, height: 32 },
            }}
          />
        )
      })}
    </GoogleMap>
  ) : (
    <></>
  )
}

function Map() {
  const { state: { stubbingMap = false } = {} } = useMapContext()

  return stubbingMap ? <MapStub /> : <MapComponent />
}

export default React.memo(Map)

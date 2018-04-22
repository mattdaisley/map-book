import React from 'react'

import { MapView } from 'expo'

export default class StoredBuildingPolygon extends React.PureComponent {
  
  render() {

    const { storedShape, center } = this.props

    return (!!storedShape) ? (
      <MapView.Polygon
        key="storedShape"
        coordinates={storedShape.polygon.map( offset => ({
          latitude: center.region.latitude + offset.latitude,
          longitude: center.region.longitude + offset.longitude
        }))}
        strokeColor="rgba(244, 66, 66, 1)"
        fillColor="rgba(244, 66, 66, 0.5)"
      />
    ) : null
    
  }
}


import React from 'react'

import { MapView } from 'expo'

export default class NewBuildingPolygon extends React.PureComponent {
  
  render() {

    const { polygon, center } = this.props

    return (polygon.length > 0) && ([
      <MapView.Polygon
        key="MapViewPolygon"
        coordinates={polygon}
        strokeColor="rgba(9, 214, 237, 1)"
        fillColor="rgba(9, 214, 237, 0.5)"
      />,
      <MapView.Polyline
        key="MapViewPolyline"
        coordinates={[center.region, polygon[polygon.length - 1]]}
        strokeColor="rgba(9, 214, 237, 1)"
      />,
      <MapView.Polyline
        key="MapViewPolyline2"
        coordinates={[center.region, polygon[0]]}
        strokeColor="rgba(9, 214, 237, 1)"
      />,
      polygon.map( (point, index) => ([
        <MapView.Circle
          key={index}
          center={point}
          radius={1.5}
          strokeColor="rgba(9, 214, 237, 1)"
          fillColor="rgba(9, 214, 237, 0.5)"
        />
      ]))
    ]) || null
    
  }
}


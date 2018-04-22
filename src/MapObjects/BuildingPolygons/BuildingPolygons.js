import React from 'react'

import { StyleSheet, Text, View, Animated, TouchableWithoutFeedback } from 'react-native'
import { MapView } from 'expo'


import Theme from '../../MapBook.theme'

export default class BuildingPolygons extends React.PureComponent {

  componentWillMount = ( ) => {
    const { selected, buildings, center } = this.props
    this.setState({ 
      selected, 
      buildings: (!!buildings) ? buildings : [], 
      center 
    })
  }

  componentWillReceiveProps = ( nextProps ) => {
    const { selected, buildings, center } = nextProps
    this.setState({ selected, buildings, center })
  }
  
  buildingPress = ( building ) => {
    this.setState({selected: building})
    this.props.onPress(building)
  }

  isBuildingInView = ( building, center ) => {
    // return center.region.latitudeDelta <= 0.004
    console.log('Building in View', building.id, building.title, center.region.latitudeDelta, ( center.region.latitudeDelta <= 0.007 ))
    return (
      ( center.region.latitudeDelta <= 0.007 )
    )
  }

  getOpacityFromDistanceToSelected = ( building ) => {
    const { selected } = this.state 
    if ( !selected ) return 1

    const maxDistance = 0.08410631426502775 // based on radius from match of 0.0006
    const distanceFromSelected = this.distance(building.latitude, building.longitude, selected.latitude, selected.longitude )
    const opacity = ( maxDistance - distanceFromSelected ) / maxDistance
    return ( opacity < 1 ) ? opacity : 1
  }

  distance = (lat1, lon1, lat2, lon2) => {
    if ( lat1 === lat2 && lon1 === lon2 ) return 0
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  isBuildingSelected = ( building ) => {
    const { selected } = this.state

    if (!selected) return false

    console.log('Selected:', (selected) ? selected.id : 'none', building.id, building.id === selected.id)
    return ( !!selected ) ? building.id === selected.id : false
  }

  renderCustomMarker = ( building ) => {
    console.log('rendering customer marker', building.id, building.title)
    let selectedBuildingRadius = 7

    let buildingRadius = ( building.title.length <= 2 ) ? 5 : 5
    let buildingFontSize = ( building.title.length <= 2 ) ? 14 : 12
    // console.log(this.props.center.region.latitudeDelta, selectedBuildingRadius)
    
    // fillColor for buildings around the selected building
    let nearbyBuildingColor = `rgba(9, 214, 237, ${this.getOpacityFromDistanceToSelected(building)})`

    return ( this.isBuildingSelected(building) ) ?
      ([
        // <MapView.Circle
        //   key={`buildingCircle-${building.id}-${selectedBuildingRadius}`}
        //   center={{latitude: building.latitude, longitude: building.longitude}}
        //   radius={selectedBuildingRadius}
        //   zIndex={4}
        //   strokeColor="rgba(62, 182, 104, .7)"
        //   fillColor="rgba(62, 182, 104, .7)"
        // />,
        // <MapView.Circle
        //   key={`buildingCircleShadow-${building.id}-${selectedBuildingRadius}`}
        //   center={{latitude: building.latitude, longitude: building.longitude}}
        //   radius={selectedBuildingRadius + ( selectedBuildingRadius * 2 / 3 )}
        //   zIndex={3}
        //   strokeColor="rgba(62, 182, 104, 0.1)"
        //   fillColor="rgba(62, 182, 104, 0.5)"
        // />,
        <MapView.Marker 
          key={`buildingTitle-${building.id}-${selectedBuildingRadius}`}
          zIndex={2}
          coordinate={{latitude: building.latitude, longitude: building.longitude}}
          onPress={() => this.buildingPress(building)}>
          {/* <View style={{backgroundColor: 'red', paddingTop: selectedBuildingRadius, width: selectedBuildingRadius * 4, height: selectedBuildingRadius * 4}}>
            <Text style={{color: Theme.common.white, fontSize: buildingFontSize}}>{building.title}</Text>
          </View> */}
        </MapView.Marker>
      ]) : ([
        // <MapView.Circle
        //   key={`buildingCircle-${building.id}`}
        //   center={{latitude: building.latitude, longitude: building.longitude}}
        //   radius={buildingRadius}
        //   zIndex={1}
        //   strokeColor={nearbyBuildingColor}
        //   fillColor={nearbyBuildingColor}
        // />,
        // <MapView.Marker 
        //   key={`buildingTitle-${building.id}`}
        //   zIndex={0}
        //   coordinate={{latitude: building.latitude, longitude: building.longitude}}
        //   onPress={() => this.buildingPress(building)}>
        //   <View style={{}}>
        //     <Text style={{color: Theme.common.white, fontSize: buildingFontSize}}>{building.title}</Text>
        //   </View>
        // </MapView.Marker>
        <MapView.Marker 
          key={`buildingTitle-${building.id}-${selectedBuildingRadius}`}
          zIndex={2}
          coordinate={{latitude: building.latitude, longitude: building.longitude}}
          onPress={() => this.buildingPress(building)}>
        </MapView.Marker>
      ])
  }

  render() {
    const { buildings, center, selected } = this.state

    const buildingsToDraw = (!!selected) ? [selected].map( building => this.renderCustomMarker(building)) : null


    // const buildingsToDraw = (!!buildings && !!center) ? 
    //   buildings
    //     // .slice(-25)
    //     .map(building => {
    //       return ( 
    //         this.isBuildingInView(building, center) || 
    //         this.isBuildingSelected(building) 
    //       ) ? ([
    //         this.renderCustomMarker(building)
    //       ]) : null
    //     })
    //     .filter( building => building !== null ) 
    //   : null

    return buildingsToDraw
    
  }
}


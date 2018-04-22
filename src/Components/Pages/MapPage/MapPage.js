import React from 'react'
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { MapView } from 'expo'
import debounce from 'debounce'

import MapBookMap from 'components/MapBookMap/MapBookMap'
import MapControls from 'components/MapControls/MapControls'
import Theme from 'theme/MapBook.theme'

import MapPageNavigationOptions from './MapPageNavigationOptions'
import MapAddressDetails from './MapAddressDetails/MapAddressDetails'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

export default class MapPage extends React.Component {

  static navigationOptions = MapPageNavigationOptions

  constructor(props) {
    super(props)

    const { id, title, name, description, latitude, longitude, latitudeDelta } = this.props.navigation.state.params

    this.state = {
      ...this.props.navigation.state.params,
      mapViewOptions: {
        initialRegion: { 
          latitude: latitude || 39.869,
          longitude: longitude || -105.0241,
          latitudeDelta: latitudeDelta || 0.0071,
          longitudeDelta: (latitudeDelta) * (ScreenWidth / ScreenHeight) || 0.0071 * (ScreenWidth / ScreenHeight)
        },
        mapType: props.mapType || 'hybrid',
      },
      buildings: []
    }
  }

  async componentDidMount() {
    const { id } = this.props.navigation.state.params
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/addresses/${id}/buildings`)
      .then( results => results.json() )
      .then( data => {
        this.setState({ buildings: data })
      })
  }

  getFilteredUnits = ( buildings, text ) => {
    let filteredUnits = []
    this.state.buildings.forEach( (building) => {
      if ( !!building.units && building.units.length > 0 ) {
        const matchingUnits = building.units.filter( unit => {
          if ( unit.title.toLowerCase().indexOf(text) === 0 ) return true
          if ( (`${building.title}${unit.title}`).toLowerCase().indexOf(text) === 0 ) return true
          if ( (`${building.title}-${unit.title}`).toLowerCase().indexOf(text) === 0 ) return true  
          
          return false
        }).map( unit => {
          return { ...unit, id: `${building.id}-${unit.id}`}
        })
        if ( matchingUnits.length > 0 ) filteredUnits = [ ...filteredUnits, ...matchingUnits ]
      } else {
        if ( building.title.toLowerCase().indexOf(text) === 0 ) {
          filteredUnits.push(building)
        }
      }
    })

    return filteredUnits.sort( (a, b) => {
      var aTitle = ( parseInt(a.title) ) ? parseInt(a.title) : a.title
      var bTitle = ( parseInt(b.title) ) ? parseInt(b.title) : b.title
      return aTitle > bTitle
    })
  }

  onSearchTextChange = (searchText) => {
    console.log('onSearchTextChange', searchText)
    const text = searchText.toLowerCase().trim()

    if ( text.length > 0 ) {
      const filteredUnits = this.getFilteredUnits( this.state.buildings, text )
      const selectedBuilding = filteredUnits[0]

      if ( !!selectedBuilding ) {
        this.setState({ selectedBuilding })

        const coords = { latitude: selectedBuilding.latitude, longitude: selectedBuilding.longitude, latitudeDelta: 0.0025 }
        this.mapBookMap.setBoundingPoints( coords )
        return;
      }
    }

    this.mapBookMap.setBoundingPoints()
    this.setState({filteredBuildings: undefined, selectedBuilding: undefined})
  }

  onToggleMapType = (mapType) => {
    const { mapViewOptions } = this.state
    this.setState({ mapViewOptions: { ...mapViewOptions, mapType } })
  }
  
  render() {
    const {
      title,
      mapViewOptions,
      selectedBuilding
    } = this.state 

    const latlng = (!selectedBuilding) ? mapViewOptions.initialRegion : selectedBuilding
    const addressTitle = (!selectedBuilding) ? title : `${title} - ${selectedBuilding.title}`

    return (
      <View style={styles.container}>
        
        <MapBookMap 
          ref={ map => { this.mapBookMap = map }}
          mapViewOptions={mapViewOptions}
          edgePadding={{top: 60, bottom: 200}}
          render={() => (
            <MapView.Marker
              key="centerPin"
              coordinate={latlng}
            />
          )}
        />
        <MapControls 
          mapType={mapViewOptions.mapType}
          onToggleMapType={this.onToggleMapType}
        />
        <MapAddressDetails 
          title={addressTitle}
          latitude={latlng.latitude}
          longitude={latlng.longitude}
          onSearchTextChange={this.onSearchTextChange}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

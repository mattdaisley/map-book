import React from 'react'
import { Animated, Dimensions, Keyboard, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { MapView } from 'expo'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

export default class MapBookMap extends React.Component {

  constructor(props) {
    super(props)

    const mapViewOptions = this.getMapViewOptions(props)

    this.state = {
      mapViewOptions,
      mapReady: false,
      keyboardHeight: 0,
    }

  }

  componentWillMount () {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentDidMount () {
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove()
    this.keyboardDidHideSub.remove()
  }

  componentWillReceiveProps(nextProps) {
    const mapViewOptions = this.getMapViewOptions(nextProps)
    this.setState({ mapViewOptions })
  }

  getMapViewOptions(props) {
    const { mapViewOptions } = props

    return {
      region: mapViewOptions.region || null,
      initialRegion: mapViewOptions.initialRegion || null,
      mapType: mapViewOptions.mapType || 'hybrid',
      provider: mapViewOptions.provider || null,
      showsCompass: mapViewOptions.showsCompass || true,
      showsScale: mapViewOptions.showsScale || true,
      toolbarEnabled: mapViewOptions.toolbarEnabled || false
    }
  }

  onMapReady = () => {
    if ( !this.state.mapReady ) {
      this.setState({ mapReady: true }, this.setBoundingPoints )
      console.log('mapready')
    }
    if (!!this.props.onMapReady && typeof this.props.onMapReady === 'function')
      this.props.onMapReady();
  }

  onRegionChange = () => {
    if (!!this.props.onRegionChange && typeof this.props.onRegionChange === 'function')
      this.props.onRegionChange();
  }

  onPress = () => {
    Keyboard.dismiss()
  }

  keyboardDidShow = (event) => {
    this.setState({ keyboardHeight: event.endCoordinates.height }, this.setBoundingPoints )
  }

  keyboardDidHide = (event) => {
    this.setState({ keyboardHeight: 0 }, this.setBoundingPoints )
  }

  setBoundingPoints = ( region ) => {
    const { keyboardHeight, mapReady, mapViewOptions } = this.state
    const { edgePadding } = this.props

    if (!region ) region = mapViewOptions.initialRegion;
    // console.log(mapReady, mapViewOptions.region, edgePadding, keyboardHeight)
    if (!mapReady || !region) return

    const { latitude, longitude, latitudeDelta, longitudeDelta } = region

    let degreePerPixel = latitudeDelta / ScreenHeight
    if (Platform.OS !== 'ios') { degreePerPixel = degreePerPixel }

    let mapEdgePadding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
      ...edgePadding,
    }
    mapEdgePadding.bottom += ((Platform.OS !== 'ios') ? 0 : keyboardHeight)
    
    let topY = (ScreenHeight - mapEdgePadding.bottom - mapEdgePadding.top) / 2
    let bottomY = -topY
    let rightX = (ScreenWidth - mapEdgePadding.right) / 2
    let leftX = -rightX

    console.log(ScreenWidth, ScreenHeight, degreePerPixel, topY, bottomY, leftX, rightX, mapEdgePadding)

    const boundingPoints = [{
      latitude: latitude + ( topY * ( degreePerPixel ) ),
      longitude: longitude + ( leftX * ( degreePerPixel ) )
    },{
      latitude: latitude + ( topY * ( degreePerPixel ) ),
      longitude: longitude + ( rightX * ( degreePerPixel ) )
    },{
      latitude: latitude + ( bottomY * ( degreePerPixel ) ),
      longitude: longitude + ( leftX * ( degreePerPixel ) )
    },{
      latitude: latitude + ( bottomY * ( degreePerPixel ) ),
      longitude: longitude + ( rightX * ( degreePerPixel ) )
    }]

    this.setState({ boundingPoints })

    this.map.fitToCoordinates( boundingPoints, { 
      edgePadding: mapEdgePadding, 
      animated: true 
    })
  }

  render() {
    const { 
      render
    } = this.props;

    const { 
      mapViewOptions
    } = this.state;

    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <MapView
          ref={ map => { this.map = map }}
          style={styles.map}
          onMapReady={this.onMapReady}
          onRegionChange={this.onRegionChange}
          { ...mapViewOptions }
        >
          
          { 
            // show the render prop
            (!!render) ? render(this.state) : null 
          }

          {/* change to true to show bounding point pins */}
          { true 
            && this.state.boundingPoints 
            && this.state.boundingPoints.map( (point, index) => {
            return <MapView.Marker
              key={index}
              coordinate={point}
            />
          }) }
          
        </MapView>
      </TouchableWithoutFeedback>
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

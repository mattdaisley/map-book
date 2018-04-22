import React from 'react'
import { Text, TextInput, View, Linking, Platform, Animated, Keyboard, Dimensions, TouchableWithoutFeedback, AsyncStorage } from 'react-native'
import { MapView } from 'expo'
import { Speech } from 'expo'
import openMap from 'react-native-open-maps'
import { Icon } from 'react-native-material-ui'
import debounce from 'debounce'
// import Button from 'react-native-button'

import Theme from '../MapBook.theme'
import Styles from './MapBook.styles'

import Button from '../Button/Button'
import BottomCardContainer from '../common/BottomCard/BottomCardContainer/BottomCardContainer'
import BottomCardHeader    from '../common/BottomCard/BottomCardHeader/BottomCardHeader'
import BottomCardActions   from '../common/BottomCard/BottomCardActions/BottomCardActions'
import BottomCardItem      from '../common/BottomCard/BottomCardItem/BottomCardItem'

import DetailsContainer from '../Details/DetailsContainer/DetailsContainer'
import DetailsTitle from '../Details/DetailsTitle/DetailsTitle'
import DetailsNavigateLink from '../Details/DetailsNavigateLink/DetailsNavigateLink'
import DetailsUnitSearch from '../Details/DetailsUnitSearch/DetailsUnitSearch'

import BuildingPolygons from '../MapObjects/BuildingPolygons/BuildingPolygons'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

export default class MapPageOld extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { state, setParams } = navigation
    const { title } = state.params

    const headerStyle = {
      backgroundColor: Theme.palette.primaryColor, 
      shadowColor: Theme.common.black,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.26,
      shadowRadius: 5,
    }

    const headerRight = (true) ? (
      <Button 
        style={{color: Theme.common.white, paddingRight: 16}} 
        onPress={() => {
          const { navigate, state } = navigation
          navigate('EditMapPage', state.params)
        }}>
          Edit
      </Button>
    ) : undefined
    
    return {
      headerStyle: { position: 'absolute', zIndex: 100, top: 0, left: 0, right: 0, ...headerStyle },
      headerTintColor: Theme.common.white,
      title: `${title}`,
      headerRight,
    }
  }

  DETAILS_CONTAINER_PADDING = 16
  DETAILS_CONTAINER_HEIGHT = 200
  DETAILS_CONTAINER_BOTTOM = 0

  constructor(props) {
    super(props)

    this.detailsContainerPadding = new Animated.Value(this.DETAILS_CONTAINER_PADDING)
    this.detailsContainerHeight = new Animated.Value(this.DETAILS_CONTAINER_HEIGHT)
    this.detailsContainerBottom = new Animated.Value(this.DETAILS_CONTAINER_BOTTOM)
    this.toolsContainerBottom = new Animated.Value(this.DETAILS_CONTAINER_HEIGHT + this.DETAILS_CONTAINER_BOTTOM)

    this.dismissKeyboard = this.dismissKeyboard.bind(this)
    // this.mapZoomInOnRegion = this.mapZoomInOnRegion.bind(this)
    // this.mapZoomOutOnRegion = this.mapZoomOutOnRegion.bind(this)
    this.onToggleMapType = this.onToggleMapType.bind(this)

    this.searchTextChange = debounce(this.searchTextChange, 300)
    // this.searchTextChange = this.searchTextChange.bind(this)

    // const { latitude, longitude, latitudeDelta } = this.props.navigation.state.params
    const { id, title, name, description, latitude, longitude, latitudeDelta } = this.props.navigation.state.params
    const region = {
      latitude: latitude || 39.869,
      longitude: longitude || -105.0241,
      latitudeDelta: latitudeDelta || 0.0071,
      longitudeDelta: (latitudeDelta) * (ScreenWidth / ScreenHeight) || 0.0071 * (ScreenWidth / ScreenHeight)
    }
    
    this.state = {
      id, title, name, description, 
      latitude: latitude || 39.8705, 
      longitude: longitude || -105.0241, 
      latitudeDelta: latitudeDelta || 0.0065,
      // mapType: 'standard',
      mapType: 'hybrid',
      region,
      center: { region },

      buildings: [],
      selectedBuilding: undefined,

      unitSearchText: '',

      keyboardHeight: 0,
      headerHeight: 60,
      bottomCardHeight: this.DETAILS_CONTAINER_HEIGHT,
      boundingPoints: []
    }

  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide)
  }

  async componentDidMount() {
    const { id } = this.props.navigation.state.params
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/addresses/${id}/buildings`)
      .then( results => results.json() )
      .then( data => {
        this.setState({ buildings: data })
      })

    let mapType = await AsyncStorage.getItem("@MobileMapBook:mapType")
    if (mapType == null) {
      mapType = await AsyncStorage.setItem("@MobileMapBook:mapType", "standard")
    }

    this.setState({ mapType })
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  keyboardWillShow = (event) => {

    const { mapReady, center } = this.state

    // const keyboardHeight = event.endCoordinates.height
    // const duration = event.duration
    // console.log(Dimensions.get('window').height, event.endCoordinates.height)

    const keyboardHeight = parseInt(Dimensions.get('window').height - event.endCoordinates.height)
    const duration = 250

    this.setState({ keyboardHeight: event.endCoordinates.height })

    Animated.parallel([
      Animated.timing(this.detailsContainerBottom, {
        duration,
        toValue: keyboardHeight,
      }),
      Animated.timing(this.toolsContainerBottom, {
        duration,
        toValue: (keyboardHeight + this.DETAILS_CONTAINER_HEIGHT),
      })
    ]).start()

    if(mapReady) {
      this.setBoundingPoints( center.region )
    }
  }

  keyboardWillHide = (event) => {

    const { mapReady, center } = this.state

    // const keyboardHeight = event.endCoordinates.height
    // const duration = (event) ? event.duration : 250
    // console.log(Dimensions.get('window').height)

    const duration = 250

    this.setState({ keyboardHeight: 0 })

    Animated.parallel([
      Animated.timing(this.detailsContainerBottom, {
        duration,
        toValue: 0,
      }),
      Animated.timing(this.toolsContainerBottom, {
        duration,
        toValue: this.DETAILS_CONTAINER_HEIGHT,
      })
    ]).start()

    if(mapReady) {
      this.setBoundingPoints( center.region )
    }
  }

  onMapReady = (e) => {
    if(!this.state.mapReady) {
      this.setState({mapReady: true})

      setTimeout(() => {
        this.setBoundingPoints( this.state.region )
      }, 10); 
    }
  }

  onRegionChange = ( region ) => {
    let center = { region }
    // console.log(center)
    // this.setState({ center })
  }

  setBoundingPoints = ( viewRegion, options = { edgePadding: {} } ) => {
    const { keyboardHeight, headerHeight, bottomCardHeight } = this.state
    const { latitude, longitude, latitudeDelta, longitudeDelta } = viewRegion

    let degreePerPixel = latitudeDelta / ScreenHeight
    if (Platform.OS !== 'ios') { degreePerPixel = degreePerPixel }

    const edgePadding = {
      top: headerHeight,
      right: 10,
      bottom: bottomCardHeight + ((Platform.OS !== 'ios') ? 0 : keyboardHeight),
      left: 10,
      ...options.edgePadding
    }
    
    // console.log(viewRegion, edgePadding, bottomCardHeight)

    let topY = (ScreenHeight - edgePadding.bottom - edgePadding.top) / 2
    let bottomY = -topY
    let rightX = (ScreenWidth - edgePadding.right) / 2
    let leftX = -rightX

    // console.log(ScreenWidth, ScreenHeight, degreePerPixel, topY, bottomY, leftX, rightX)

    // top left
    const boundingPoints = [{
      latitude: viewRegion.latitude + ( topY * ( degreePerPixel ) ),
      longitude: viewRegion.longitude + ( leftX * ( degreePerPixel ) )
    },{
      latitude: viewRegion.latitude + ( topY * ( degreePerPixel ) ),
      longitude: viewRegion.longitude + ( rightX * ( degreePerPixel ) )
    },{
      latitude: viewRegion.latitude + ( bottomY * ( degreePerPixel ) ),
      longitude: viewRegion.longitude + ( leftX * ( degreePerPixel ) )
    },{
      latitude: viewRegion.latitude + ( bottomY * ( degreePerPixel ) ),
      longitude: viewRegion.longitude + ( rightX * ( degreePerPixel ) )
    }]

    // this.setState({ boundingPoints, center: { region: viewRegion } })

    this.map.fitToCoordinates( boundingPoints, { 
      edgePadding, 
      animated: true 
    })
  }

  buildingPress = (building) => {
    // const selectedBuilding = ( !!this.state.selectedBuilding && this.state.selectedBuilding.id === building.id ) ? undefined : building
    // this.setState({selectedBuilding})
    const { selectedBuilding, polygon } = this.state
    const { latitude, longitude } = building
    
    this.setState({selectedBuilding: building, unitSearchText: building.title})
    this.setBoundingPoints({ latitude, longitude, latitudeDelta: 0.0025 })
    setTimeout(() => this.searchTextChange(building.title), 10)
    
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

  getNearbyUnits = ( buildings, selectedBuilding ) => {
    const radius = 0.00055
    let nearbyUnits = []
    buildings.forEach( building => {
      if ( building.id === selectedBuilding.id ) return false
      if (
        ( building.latitude > selectedBuilding.latitude - radius ) && 
        ( building.latitude < selectedBuilding.latitude + radius ) &&
        ( building.longitude > selectedBuilding.longitude - radius ) &&
        ( building.longitude < selectedBuilding.longitude + radius )
      ) {
        nearbyUnits.push(building)
      }
    })
    return nearbyUnits
  }

  searchTextChange = (searchText) => {
    const text = searchText.toLowerCase().trim()
    this.setState({unitSearchText: text})

    if ( text.length > 0 ) {
      const filteredUnits = this.getFilteredUnits( this.state.buildings, text )

      // filteredUnits.map( unit => console.log('filtered unit', unit))
      const selectedBuilding = filteredUnits[0]

      if ( !!selectedBuilding ) {
        console.log("\n\n")
        console.log('selected building:', selectedBuilding.id, selectedBuilding.title)
        const nearbyUnits = this.getNearbyUnits( this.state.buildings, selectedBuilding )
        // nearbyUnits.map( unit => console.log('nearby: ', unit.id, unit.title))
        console.log('nearby units:',nearbyUnits.length)
        this.setState({filteredBuildings: [selectedBuilding, ...nearbyUnits], selectedBuilding})

        const coords = { latitude: selectedBuilding.latitude, longitude: selectedBuilding.longitude, latitudeDelta: 0.0025 }
        this.setBoundingPoints( coords )
        
        return
      }
    }

    this.setState({filteredBuildings: undefined, selectedBuilding: undefined})
    this.resetRegion()
  }

  clearUnitSearch = () => {
    this.setState({unitSearchText: '', filteredBuildings: undefined, selectedBuilding: undefined})
    this.resetRegion()
  }

  resetRegion = () => {
    const { latitude, longitude, latitudeDelta } = this.state
    this.setBoundingPoints( {latitude, longitude, latitudeDelta} )
  }

  onToggleMapType = () => { 
    let mapType = 'hybrid'
    if ( this.state.mapType === mapType ) { mapType = 'standard' }
    
    AsyncStorage.setItem("@MobileMapBook:mapType", mapType)
      .then( () => {
        this.setState({ mapType })
      })
  }

  dismissKeyboard = () => {
    Keyboard.dismiss()
  }
  
  render() {
    const { id, title, name, description, latitude, longitude, latitudeDelta } = this.state
    const { center, selectedBuilding, unitSearchText } = this.state

    const buildings = (this.state.filteredBuildings) ? this.state.filteredBuildings : this.state.buildings
    // const buildings = this.state.buildings
    const latlng = { latitude, longitude, latitudeDelta }

    if ( !latlng ) return null

    return (
      <View style={Styles.container}>

        { ( !!center ) && (
          <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
            <MapView
              ref={ map => { this.map = map }}
              style={Styles.container}
              
              // provider="google"
              initialRegion={this.state.region}
              mapType={this.state.mapType}
              showsScale={true}
              showsCompass={true}
              toolbarEnabled={false}
              // region={this.state.region}

              onMapReady={this.onMapReady}
              onRegionChange={this.onRegionChange}
            >
              <BuildingPolygons   
                buildings={buildings}
                selected={selectedBuilding}
                center={center} 
                onPress={this.buildingPress} />

              { (!selectedBuilding) && (
                <MapView.Marker
                  key="centerPin"
                  coordinate={latlng}
                />
              ) }

              { this.state.boundingPoints.map( (point, index) => {
                return <MapView.Marker
                  key={index}
                  coordinate={point}
                />
              }) }
              <MapView.Polyline coordinates={this.state.boundingPoints} strokeWidth={4} strokeColor="#2962FF" /> 
              
            </MapView>
          </TouchableWithoutFeedback>
        ) }
        

        <Animated.View style={{top: 90, position: 'absolute', right: 20, width: 50 }}>

          <Button
            key="toggleMapType"
            onPress={this.onToggleMapType}
            containerStyle={Styles.toggleMapTypeButton}>
              <Icon name="layers" color={Theme.palette.primaryColor}/>
          </Button>
            
        </Animated.View>

        <BottomCardContainer 
          draggable={false}
          render={ ( state ) => (
            <View style={{flex: 1}} ponterEvents="box-none">
              <BottomCardHeader
                title={title}
                subheader1={name}
                subheader2={description}
              />
    
              {/* <View key="bottomCardHeader" > */}
                <DetailsNavigateLink 
                  key="detailsNavigateLink" 
                  title={title} 
                  selectedBuilding={selectedBuilding} 
                  latitude={latitude} 
                  longitude={longitude} />
              {/* </View> */}
    
              <BottomCardActions>
                <DetailsUnitSearch 
                  key="detailsUnitSearch" 
                  value={unitSearchText} 
                  onChangeText={this.searchTextChange} 
                  onClear={this.clearUnitSearch} />
              </BottomCardActions>
            </View>
          )}
        >
        </BottomCardContainer>

      </View>
    )
  }
}

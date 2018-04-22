import React from 'react'
import { 
  StyleSheet, 
  Text, 
  TextInput,
  View, 
  FlatList,
  Linking, 
  Platform, 
  Animated, 
  Keyboard, 
  Dimensions, 
  TouchableOpacity,
  TouchableWithoutFeedback 
} from 'react-native'

import { NavigationActions } from 'react-navigation'
import { MapView } from 'expo'
import { Speech } from 'expo'
import openMap from 'react-native-open-maps'
import { Icon } from 'react-native-material-ui'
import debounce from 'debounce'
// import Button from 'react-native-button'

import Theme from '../MapBook.theme'

import Button from '../Button/Button'
import BottomCardContainer from '../common/BottomCard/BottomCardContainer/BottomCardContainer'
import BottomCardHeader    from '../common/BottomCard/BottomCardHeader/BottomCardHeader'
import BottomCardActions   from '../common/BottomCard/BottomCardActions/BottomCardActions'
import BottomCardContent   from '../common/BottomCard/BottomCardContent/BottomCardContent'
import BottomCardItem      from '../common/BottomCard/BottomCardItem/BottomCardItem'
import BottomCardInput     from '../common/BottomCard/BottomCardInput/BottomCardInput'

import DetailsContainer    from '../Details/DetailsContainer/DetailsContainer'
import DetailsTitle        from '../Details/DetailsTitle/DetailsTitle'
import DetailsNavigateLink from '../Details/DetailsNavigateLink/DetailsNavigateLink'
import DetailsUnitSearch   from '../Details/DetailsUnitSearch/DetailsUnitSearch'

import BuildingPolygons      from '../MapObjects/BuildingPolygons/BuildingPolygons'
import StoredBuildingPolygon from '../MapObjects/StoredBuildingPolygon/StoredBuildingPolygon'
import NewBuildingPolygon    from '../MapObjects/NewBuildingPolygon/NewBuildingPolygon'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default class EditMapPage extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { state, setParams } = navigation
    const isEditing = state.params.mode === 'Edit'
    const { title } = state.params

    const headerStyle = {
      backgroundColor: Theme.palette.primaryColor, 
      shadowColor: Theme.common.black,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.66,
      shadowRadius: 15,
    }

    const headerRight = (
      <Button 
        style={{color: Theme.common.white, paddingRight: 8}} 
        onPress={() => {
          const backAction = NavigationActions.back(state.params)
          navigation.dispatch(backAction)          
        }}>
          Done
      </Button>
    )
    
    return {
      headerStyle: { position: 'absolute', zIndex: 100, top: 0, left: 0, right: 0, ...headerStyle },
      headerTintColor: Theme.common.white,
      title: `${title}`,
      headerRight,
    }
  }

  DETAILS_CONTAINER_PADDING = 16
  DETAILS_CONTAINER_HEIGHT = 196
  DETAILS_CONTAINER_BOTTOM = 0

  constructor(props) {
    super(props)

    this.unitSearch = false
    this.detailsContainerPadding = new Animated.Value(this.DETAILS_CONTAINER_PADDING)
    this.detailsContainerHeight = new Animated.Value(this.DETAILS_CONTAINER_HEIGHT)
    this.detailsContainerBottom = new Animated.Value(this.DETAILS_CONTAINER_BOTTOM)
    this.toolsContainerBottom = new Animated.Value(this.DETAILS_CONTAINER_HEIGHT + this.DETAILS_CONTAINER_BOTTOM)

    this.dismissKeyboard = this.dismissKeyboard.bind(this)
    this.mapZoomInOnRegion = this.mapZoomInOnRegion.bind(this)
    this.mapZoomOutOnRegion = this.mapZoomOutOnRegion.bind(this)
    this.handleNewBuildingTitleChange = this.handleNewBuildingTitleChange.bind(this)

    const { latitude, longitude, latitudeDelta } = this.props.navigation.state.params

    const region = {
      latitude: latitude - 0.00435,
      longitude: longitude,
      latitudeDelta: latitudeDelta + 0.0006 || 0.0071,
      longitudeDelta: (latitudeDelta + 0.0006) * (screenWidth / screenHeight) || 0.0071 * (screenWidth / screenHeight),
    }

    this.state = {
      pan: new Animated.ValueXY(),
      // mapType: 'standard',
      mapType: 'hybrid',
      region,
      center: { region },

      isEditingAddress: false,
      isEditingBuilding: false,

      buildings: [],
      selectedBuilding: undefined,

      unitSearch: false,
      unitSearchText: '',

      latOffset: -0.00085,
      latDeltaOffset: 0.0006,

      edit: false,
      polygon: [],
      storedShape: undefined,

      snapPoint: true,
      snapHorizontal: false,
      snapVertical: false
    }

  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
  }

  componentDidMount = () => {
    const { id } = this.props.navigation.state.params
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/addresses/${id}/buildings`)
      .then( results => results.json() )
      .then( data => {
        this.setState({ buildings: data })
      })
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  keyboardWillShow = (event) => {
    Animated.parallel([
      Animated.timing(this.detailsContainerBottom, {
        duration: event.duration,
        toValue: event.endCoordinates.height,
      }),
      Animated.timing(this.toolsContainerBottom, {
        duration: event.duration,
        toValue: (event.endCoordinates.height + this.DETAILS_CONTAINER_HEIGHT),
      })
    ]).start()

    // this.mapZoomInOnRegion()
  }

  keyboardWillHide = (event) => {
    Animated.parallel([
      Animated.timing(this.detailsContainerBottom, {
        duration: (event) ? event.duration : 250,
        toValue: 0,
      }),
      Animated.timing(this.toolsContainerBottom, {
        duration: event.duration,
        toValue: this.DETAILS_CONTAINER_HEIGHT,
      })
    ]).start()

    // this.mapZoomOutOnRegion()
  }

  onPanResponderGrant = (e, gesture) => {
    this.state.pan.setOffset(this.state.pan.__getValue());
    this.state.pan.setValue({ x: 0, y: 0 });
  }

  onPanResponderMove = (e, gesture) => {
    Animated.event([
      null,
      { dy: this.state.pan.y }
    ])(e, gesture)
  }

  onPanResponderRelease = (e, gesture) => {
    const panY = this.state.pan.y.__getValue()
  }

  animatePanValues = ( options ) => {
    Animated.timing( this.state.pan, options ).start()
  }

  resetOffset = () => {
    this.state.pan.setOffset(this.state.pan.__getValue());
    this.state.pan.setValue({ x: 0, y: 0 });
  }



  mapZoomInOnRegion = () => {
    if(this.state.mapReady) {
      this.setRegion({
        latitude: this.state.region.latitude - 0.00085,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta + 0.0006,
        longitudeDelta: this.state.region.longitudeDelta,
      })
    }
  }

  mapZoomOutOnRegion = () => {
    if(this.state.mapReady) {
      this.setRegion({
        latitude: this.state.region.latitude + 0.00085,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta - 0.0006,
        longitudeDelta: this.state.region.longitudeDelta,
      })
    }
  }

  onMapReady = (e) => {
    if(!this.state.mapReady) {
      this.setState({mapReady: true})
    }
  }

  setRegion(region) {
    if(this.state.mapReady) {
      setTimeout(() => this.map.animateToRegion(region), 10)
    }
    this.setState({ region })
  }

  onRegionChange = ( region ) => {
    const { snapPoint, snapVertical, snapHorizontal, tempBuilding } = this.state

    let center = { region }
    // console.log(region)

    if ( snapPoint === true ) {
      const match = this.state.buildings
        .filter( building => {
          const latDiff  = Math.abs( building.latitude - region.latitude )
          const longDiff = Math.abs( building.longitude - region.longitude )
          return ( latDiff < 0.00035 && longDiff < 0.00035 )
        })
        .map( building => building.polygon)
        .map( polygon => {
          return polygon.filter( latlng => {
            const latDiff  = Math.abs( latlng.latitude - region.latitude )
            const longDiff = Math.abs( latlng.longitude - region.longitude )
            return ( latDiff < 0.00003 && longDiff < 0.00003 )
          })
        })
        .filter( polygon => polygon.length > 0 )
      
      // console.log(match.length, snapVertical, snapHorizontal)
      if ( match.length > 0 ) {
        center.region.latitude = match[0][0].latitude
        center.region.longitude = match[0][0].longitude
      }
    } else {
      if ( !!tempBuilding ) {
        const { polygon } = tempBuilding
        if ( !!snapVertical && polygon.length > 0 ) {
          center.region.longitude = polygon[ polygon.length - 1].longitude
        }
        if ( !!snapHorizontal && polygon.length > 0 ) {
          center.region.latitude = polygon[ polygon.length - 1].latitude
        }
      }
    }

    this.setState({ center })
  }

  handleNewBuildingTitleChange = (text) => {
    this.setState({newBuildingTitle: text}) 
  }

  add = () => {
    const { center, tempBuilding, polygon } = this.state
    const { latitude, longitude } = center.region

    let currentPolygon = ( !!tempBuilding && !!tempBuilding.polygon ) ? [ ...tempBuilding.polygon ] : [ ...polygon ]
    currentPolygon.push( { latitude, longitude } )

    this.setState({
      tempBuilding: {
        ...tempBuilding,
        polygon: currentPolygon 
      }
    })
  }

  save = () => {
    let buildings = [ ...this.state.buildings ]
    let latlng = this.getCenterLatLng(this.state.polygon)
    const newBuilding = {
      title: this.state.newBuildingTitle,
      latitude: latlng.latitude,
      longitude: latlng.longitude,
      polygon: this.state.polygon
    }
    console.log(JSON.stringify(newBuilding)+',')
    
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/addresses/${this.props.navigation.state.params.id}/buildings`, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBuilding)
    })
      .then( results => results.json() )
      .then( data => {
        buildings.push(data)
        this.setState({polygon: [], buildings, newBuildingTitle: undefined})
      })
  }

  getCenterLatLng = ( coordinates ) => {
    const maxLatLng = coordinates.reduce( (acc, coord) => {
      return {
        latitude: (acc.latitude < coord.latitude) ? coord.latitude : acc.latitude,
        longitude: (acc.longitude < coord.longitude) ? coord.longitude : acc.longitude
      }
    })
    const minLatLng = coordinates.reduce( (acc, coord) => {
      return {
        latitude: (acc.latitude > coord.latitude) ? coord.latitude : acc.latitude,
        longitude: (acc.longitude > coord.longitude) ? coord.longitude : acc.longitude
      }
    })
    return {
      latitude: (minLatLng.latitude + (maxLatLng.latitude - minLatLng.latitude)/2),
      longitude: (minLatLng.longitude + (maxLatLng.longitude - minLatLng.longitude)/2)
    }
  }

  setNewBuildingTitle = () => {
    const { buildings, newBuildingTitle } = this.state
    const lastTitle = ( !!buildings && buildings.length > 0 ) ? parseInt(buildings[buildings.length - 1].title) : 0
    const newTitle = ( !newBuildingTitle ) ? `${lastTitle + 1}` : newBuildingTitle

    this.setState({ newBuildingTitle: newTitle })
  }

  clearPolygon = () => { 
    this.setState({polygon: []}) 
  }

  buildingPress = (building) => {
    // const selectedBuilding = ( !!this.state.selectedBuilding && this.state.selectedBuilding.id === building.id ) ? undefined : building
    // this.setState({selectedBuilding})
    const { selectedBuilding, polygon, tempBuilding } = this.state

    let newSelectedBuilding = ( !!selectedBuilding && selectedBuilding.id === building.id ) ? undefined : building

    let currentPolygon = ( !!newSelectedBuilding && !!newSelectedBuilding.polygon ) ? [ ...newSelectedBuilding.polygon ] : [ ...polygon ]

    console.log(building.title, (newSelectedBuilding) ? newSelectedBuilding.title : undefined, currentPolygon)
    this.setState({ selectedBuilding: newSelectedBuilding })


    this.onViewBuilding( building )
    
  }

  copySelectedBuildingShape = () => {
    const { selectedBuilding } = this.state
    const { polygon } = selectedBuilding

    const topLeft = polygon[0]
    const storedShape = { 
      coordinate: topLeft, 
      polygon: polygon.map( latlng => ({ 
        latitude: latlng.latitude - topLeft.latitude,
        longitude: latlng.longitude - topLeft.longitude
      }) )
    }
    this.setState({storedShape, selectedBuilding: undefined})
  }

  clearStoredShape = () => {
    this.setState({storedShape: undefined, selectedBuilding: undefined})
  }

  pasteBuildingShape = () => {
    const { storedShape, center } = this.state
    const polygon = storedShape.polygon.map( offset => ({
      latitude: center.region.latitude + offset.latitude,
      longitude: center.region.longitude + offset.longitude
    }))
    this.setState({polygon})
    this.setNewBuildingTitle()
  }

  clearBuildingShape = () => { 
    this.setState({storedShape: undefined})
  }

  resetRegion = () => {
    const { latitude, longitude, latitudeDelta } = this.props.navigation.state.params
    this.setRegion({
      latitude: latitude - 0.00435,
      longitude: longitude,
      latitudeDelta: latitudeDelta + 0.0006 || 0.0071,
      longitudeDelta: (latitudeDelta + 0.0006) * (screenWidth / screenHeight) || 0.0071 * (screenWidth / screenHeight)
    })
  }

  dismissKeyboard = () => {
    Keyboard.dismiss()
  }


  onEditAddress = () => {
    const { id, title, name, description } = this.props.navigation.state.params // todo: switch to state

    this.setState({
      isEditingAddress: true,
      tempAddress: {
        title,
        name,
        description
      }
    })
  }

  onAddressTitleChange = ( text ) => {
    this.setState({
      tempAddress: {
        ...this.state.tempAddress,
        title: text.trim()
      }
    })
  }

  onAddressNameChange = ( text ) => {
    this.setState({
      tempAddress: {
        ...this.state.tempAddress,
        title: text.trim()
      }
    })
  }

  onAddressDescriptionChange = ( text ) => {
    this.setState({
      tempAddress: {
        ...this.state.tempAddress,
        title: text.trim()
      }
    })
  }

  onCancelEditAddress = () => {
    this.setState({
      isEditingAddress: false,
      tempAddress: undefined
    })
  }

  onSaveAddress = () => {
    this.setState({isEditingAddress: false})
    // todo: save changes to server
    // todo: update state with new address details
  }



  onViewBuilding = ( building ) => {
    const { tempBuilding, isEditingBuilding } = this.state 

    if ( isEditingBuilding === false ) {
      if ( !!tempBuilding && tempBuilding.id === building.id ) {
          this.setState({
            tempBuilding: undefined
          })
      } else {
        const newTempBuilding = {
          id: building.id,
          title: building.title,
          polygon: building.polygon
        }

        this.setState({
          tempBuilding: newTempBuilding
        })
      }
    }
  }

  onCloseViewBuilding = () => {
    this.setState({
      tempBuilding: undefined
    })
  }

  onEditBuilding = () => {
    this.setState({ isEditingBuilding: true })
  }

  onAddBuilding = () => {
    const { buildings } = this.state
    const lastTitle = ( !!buildings && buildings.length > 0 ) ? buildings[buildings.length - 1].title : 0

    const nextTitle = (lastTitle.match(/[a-z]/i)) ? parseInt(lastTitle) + this.getNextKey(lastTitle.substring(lastTitle.length - 1)) : parseInt(lastTitle) + 1

    this.setState({
      isEditingBuilding: true,
      tempBuilding: {
        id: undefined,
        title: `${nextTitle}`,
        polygon: []
      }
    })
  }

  getNextKey = (key) => {
    if (key === 'Z' || key === 'z') {
      return String.fromCharCode(key.charCodeAt() - 25) + String.fromCharCode(key.charCodeAt() - 25); // AA or aa
    } else {
      var lastChar = key.slice(-1);
      var sub = key.slice(0, -1);
      if (lastChar === 'Z' || lastChar === 'z') {
        // If a string of length > 1 ends in Z/z,
        // increment the string (excluding the last Z/z) recursively,
        // and append A/a (depending on casing) to it
        return this.getNextKey(sub) + String.fromCharCode(lastChar.charCodeAt() - 25);
      } else {
        // (take till last char) append with (increment last char)
        return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
      }
    }
    return key;
  };

  onBuildingTitleChange = ( text ) => {
    this.setState({
      tempBuilding: {
        ...this.state.tempBuilding,
        title: text.trim()
      }
    })
  }

  onCancelEditBuilding = () => {
    const { tempBuilding } = this.state 

    if ( !tempBuilding.id ) {
      this.setState({
        isEditingBuilding: false,
        tempBuilding: undefined
      })
    } else {
      this.setState({
        isEditingBuilding: false
      })
    }
  }

  onSaveBuilding = () => {
    // validate tempBuilding changes
      // title.length > 0
      // polygon.length > 2 ( at least a triangle )
      
    // todo: save changes to server
    // todo: update building in state with new building details
    const { tempBuilding } = this.state
    if ( !tempBuilding.id ) {
      this.doPostNewBuilding()
    } else {
      this.doPutEditBuilding()
      // console.log(tempBuilding)
    }
  }

  doPostNewBuilding = () => {
    const { address, buildings, tempBuilding } = this.state
    const { id } = this.props.navigation.state.params // todo: switch to state

    const latlng = this.getCenterLatLng(tempBuilding.polygon)

    const newBuilding = {
      ...tempBuilding,
      latitude: latlng.latitude,
      longitude: latlng.longitude
    }
    console.log(JSON.stringify(newBuilding)+',')
    
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/addresses/${id}/buildings`, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBuilding)
    })
      .then( results => results.json() )
      .then( data => {
        let newBuildings = [ ...buildings ]
        newBuildings.push(data)

        this.setState({ 
          buildings: newBuildings
        })
        this.onAddBuilding()
      })
  }

  doPutEditBuilding = () => {
    const { address, buildings, tempBuilding } = this.state
    const { id } = this.props.navigation.state.params // todo: switch to state

    const latlng = this.getCenterLatLng(tempBuilding.polygon)

    const newBuilding = {
      ...tempBuilding,
      latitude: latlng.latitude,
      longitude: latlng.longitude
    }
    console.log(JSON.stringify(newBuilding)+',')
    
    fetch(`https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/buildings/${tempBuilding.id}`, {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBuilding)
    })
      .then( results => results.json() )
      .then( data => {
        console.log(data)

        let newBuildings = buildings.map( building => {
          console.log(building.id, building.title, data.id, data.title)
          return building.id === data.id ? newBuilding : building
        })
        this.setState({ 
          buildings: newBuildings
        })
      })
  }

  
  render() {
    const { id, title, name, description, latitude, longitude, latitudeDelta } = this.props.navigation.state.params
    const { center, storedShape, selectedBuilding, unitSearchText, polygon } = this.state

    const buildings = (this.state.filteredBuildings) ? this.state.filteredBuildings : this.state.buildings
    const latlng = { latitude, longitude, latitudeDelta }

    if ( !latlng ) return null
    
    const { isEditingAddress, isEditingBuilding, tempAddress, tempBuilding } = this.state

    return (
      <View style={styles.container}>

        { (!!center) && (
          <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
            <MapView
              onMapReady={this.onMapReady}
              ref={ map => { this.map = map }}
              style={styles.container}
              // provider="google"
              mapType={this.state.mapType}
              // mapType="standard"
              initialRegion={this.state.region}
              // region={this.state.region}
              onRegionChange={region => this.onRegionChange(region)}

              showsCompass={true}
              showsScale={true}
            >

              <BuildingPolygons   
                buildings={buildings}
                selected={tempBuilding}
                center={center} 
                onPress={this.buildingPress} />
                
              <StoredBuildingPolygon 
                storedShape={storedShape}
                center={center} />

              {/* Default Center Marker */}
              { (!tempBuilding) && (
                <MapView.Marker
                  key="centerPin"
                  coordinate={latlng}
                />
              ) }
              
              { ( !!tempBuilding && isEditingBuilding === true ) && (
                <NewBuildingPolygon 
                  polygon={tempBuilding.polygon}
                  center={center} />
              )}

              {/* Cursor showing where a new point will be added */}
              <MapView.Circle
                key={`${center.region.latitude}${center.region.longitude}`}
                center={center.region}
                radius={1.5}
                // radius={20}
                strokeColor="rgba(9, 214, 237, 1)"
                fillColor="rgba(9, 214, 237, 0.5)"
              />
              
            </MapView>
          </TouchableWithoutFeedback>
        ) || null}

        {/* <View style={{position: 'absolute', width: '100%', height: '100%'}} pointerEvents="none">
          <Animated.View 
            style={[
              this.state.pan.getLayout(), 
              { width: '100%', height: '100%'}
            ]} 
          >
            <View key="xAxis" style={{width: '100%', height: 1, backgroundColor: 'rgba(9, 214, 237, 1)', position: 'absolute', top: '51.5%'}}></View>
            <View key="yAxis" style={{height: '100%', width: 1, backgroundColor: 'rgba(9, 214, 237, 1)', position: 'absolute', left: '50%'}}></View>
          </Animated.View>
        </View> */}

        <Animated.View style={{bottom: this.toolsContainerBottom, position: 'absolute', right: 20, width: 50 }}>

          { ( !!this.state.storedShape ) && ([
            <Button
              key="cancelPasteButton"
              onPress={this.clearStoredShape}
              containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor}}>
                <Icon name="clear" color={"white"}/>
            </Button>,

            <Button
              key="pasteShapeButton"
              onPress={this.pasteBuildingShape}
              containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor}}>
                <Icon name="content-paste" color={"white"}/>
            </Button>,
          ]) || ( 
            ( !!this.state.isEditingBuilding ) && ([
              
              ( !!this.state.selectedBuilding ) && (
                <Button
                  key="copyShapeButton"
                  onPress={this.copySelectedBuildingShape}
                  containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor,}}>
                    <Icon name="content-copy" color="white"/>
                </Button>
              ),

              (!!this.state.snapPoint) && (
                <Button
                  key="snapPointButton"
                  onPress={() => { this.setState({snapPoint: !this.state.snapPoint}) }}
                  containerStyle={{transform: [{ rotate: '90deg'}], padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: 'white',}}
                  disabledContainerStyle={{backgroundColor: 'grey'}}>
                    <Icon name="center-focus-strong" color={Theme.palette.primaryColor}/>
                </Button>
              ) || (
                <Button
                  key="snapPointButton"
                  onPress={() => { this.setState({snapPoint: !this.state.snapPoint}) }}
                  containerStyle={{transform: [{ rotate: '90deg'}], padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor,}}
                  disabledContainerStyle={{backgroundColor: 'grey'}}>
                    <Icon name="center-focus-weak" color="white"/>
                </Button>
              ),
            
              (!!this.state.snapVertical) && (
                <Button
                  key="snapVerticalButton"
                  onPress={() => { this.setState({snapVertical: !this.state.snapVertical}) }}
                  containerStyle={{transform: [{ rotate: '90deg'}], padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: 'white',}}
                  disabledContainerStyle={{backgroundColor: 'grey'}}>
                    <Icon name="vertical-align-center" color={Theme.palette.primaryColor}/>
                </Button>
              ) || (
                <Button
                  key="snapVerticalButton"
                  onPress={() => { this.setState({snapVertical: !this.state.snapVertical}) }}
                  containerStyle={{transform: [{ rotate: '90deg'}], padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor,}}
                  disabledContainerStyle={{backgroundColor: 'grey'}}>
                    <Icon name="vertical-align-center" color="white"/>
                </Button>
              ),

              (!!this.state.snapHorizontal) && (
                <Button
                  key="snapHorizontalButton"
                  onPress={() => { this.setState({snapHorizontal: !this.state.snapHorizontal}) }}
                  containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: 'white'}}>
                    <Icon name="vertical-align-center" color={Theme.palette.primaryColor}/>
                </Button>
              ) || (
                <Button
                  key="snapHorizontalButton"
                  onPress={() => { this.setState({snapHorizontal: !this.state.snapHorizontal}) }}
                  containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor,}}>
                    <Icon name="vertical-align-center" color="white"/>
                </Button>
              ),

              <Button
                key="addPointButton"
                onPress={this.add}
                containerStyle={{padding:14, marginRight: 8, marginTop: 8, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: Theme.palette.primaryColor,}}>
                  <Icon name="add" color="white"/>
              </Button>
            ]) 
          )
         }

        </Animated.View>
        

        <BottomCardContainer 
          draggable={true}
          onPanResponderGrant={this.onPanResponderGrant}
          onPanResponderMove={this.onPanResponderMove}
          onPanResponderRelease={this.onPanResponderRelease}
          animatePanValues={this.animatePanValues}
          resetOffset={this.resetOffset}
          render={ ( {snapBottom} ) => {
            return (
              <View>
                { ( isEditingBuilding === false && !tempBuilding ) && (

                  ( isEditingAddress === false ) && (
                    <View style={{flex: 1}}>
                      <BottomCardHeader
                        title={title}
                        subheader1={name}
                        subheader2={description}
                      />

                      <BottomCardActions>
                        <Button raised primary onPress={ this.onEditAddress }>Edit Address</Button>
                        <Button primary onPress={ this.onAddBuilding }>Add New Building</Button>
                      </BottomCardActions>

                      <BottomCardContent>
                        <FlatList
                          data={[ 
                            {title: 'Initial View Region', action: () => console.log('button 1')}, 
                            {title: `Lat/Lng (${latitude},${longitude})`, action: () => console.log('button 2')},
                            {title: `${buildings.length} Buildings`},
                          ]}
                          keyExtractor={(item, index) => index}
                          ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: Theme.common.faintBlack}} />}
                          renderItem={({item}) => {
                            return (!!item.action) && (
                              <TouchableOpacity onPress={item.action}>
                                <View style={{padding: 16}}>
                                  <Text>{item.title}</Text>
                                </View>
                              </TouchableOpacity>
                            ) || (
                              <View style={{padding: 16}}>
                                <Text>{item.title}</Text>
                              </View>
                            )
                          }}
                        />
                      </BottomCardContent>
                    </View>
                  ) || (
                    <View style={{flex: 1}}>
                      <BottomCardHeader>
                        <BottomCardInput label="Title" value={tempAddress.title} onChangeText={ this.onAddressTitleChange } />
                        <BottomCardInput label="Name" value={tempAddress.name} onChangeText={ this.onAddressNameChange } />
                        <BottomCardInput label="Description" value={tempAddress.description} onChangeText={ this.onAddressDescriptionChange } />
                      </BottomCardHeader>

                      <BottomCardActions>
                        <Button raised primary onPress={ this.onCancelEditAddress }>Cancel</Button>
                        <Button secondary onPress={ this.onSaveAddress }>Save</Button>
                      </BottomCardActions>
                    </View>
                  )
                )}

                { ( !!tempBuilding ) && (
                  ( (isEditingBuilding === false) && (
                    <View style={{flex: 1}}>
                      <BottomCardHeader>
                        <BottomCardItem label="Id" value={tempBuilding.id} />
                        <BottomCardItem label="Title" value={tempBuilding.title} />
                      </BottomCardHeader>

                      <BottomCardActions>
                        <Button raised primary onPress={ this.onCloseViewBuilding }>Close</Button>
                        <Button secondary onPress={ this.onEditBuilding }>Edit</Button>
                      </BottomCardActions>
                    </View>
                  ) || (
                    <View style={{flex: 1}}>
                      <BottomCardHeader>
                        <BottomCardItem label="Id" value={tempBuilding.id || 'New Building'} />
                        <BottomCardInput label="Title" value={tempBuilding.title} onChangeText={ this.onBuildingTitleChange } />
                      </BottomCardHeader>

                      <BottomCardActions>
                        <Button raised primary onPress={ this.onCancelEditBuilding }>Cancel</Button>
                        <Button secondary onPress={ this.onSaveBuilding }>Save</Button>
                      </BottomCardActions>
                    </View>
                  ) )
                ) }
              </View>
            )
          } }
        >
        </BottomCardContainer>
              
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // position: 'absolute',
    // top: 40,
    // bottom: 10,
    // left: 0,
    // right: 0
  },
  controls: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 60,
    position: 'absolute',
    bottom: 0
  },
  control: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  button: {
    height: '100%',
    width: '100%',
    padding: 20
  },
  selectedBuilding: {
    flexDirection: 'row',
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

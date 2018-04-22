import React from 'react'
import { StyleSheet, Text, TextInput, View, Linking, Platform, Animated, Keyboard, Dimensions, TouchableWithoutFeedback, AsyncStorage } from 'react-native'
import { MapView } from 'expo'
import { Speech } from 'expo'
import openMap from 'react-native-open-maps'
import { Icon } from 'react-native-material-ui'
import debounce from 'debounce'
// import Button from 'react-native-button'

import Button from 'Components/Button/Button'

import Theme from '../MapBook.theme'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default class MapPage extends React.Component {

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

  // constructor(props) {
  //   super(props)

  // }

  componentWillMount () {
    
  }

  async componentDidMount() {

  }
  
  render() {
    return (
      <View style={styles.container}>
        <MapView
          ref={ map => { this.map = map }}
          style={{marginTopa: 100, awidth: 200, height: 300}}
          
          // provider="google"
          // initialRegion={this.state.region}
          // mapType={this.state.mapType}
          showsScale={true}
          showsCompass={true}
          toolbarEnabled={false}
          // region={this.state.region}

          // onMapReady={this.onMapReady}
          // onRegionChange={this.onRegionChange}
        >
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  }
})

import React from 'react'
import { StatusBar, StyleSheet } from 'react-native'

import { StackNavigator } from 'react-navigation'
import { COLOR, ThemeProvider }  from 'react-native-material-ui'

import Theme from './MapBook.theme'

import HomePage    from './HomePage/HomePage'
import MapPageOld  from './MapPageOld/MapPageOld'
import MapPage     from './MapPage/MapPage'
import EditMapPage from './EditMapPage/EditMapPage'
import TestMap     from './TestMap/TestMap'

const MapBookNavigator = StackNavigator({
  Home:        { screen: HomePage },
  MapPageOld:  { screen: MapPageOld },
  MapPage:     { screen: MapPage },
  EditMapPage: { screen: EditMapPage },
  TestMapPage: { screen: TestMap },
}, {
  headerMode: 'screen',
  navigationOptions: {
    headerStyle: {
      backgroundColor: Theme.palette.primaryColor, 
      shadowColor: Theme.common.black,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    headerTintColor: Theme.common.white,
  }
})

const uiTheme = {
  palette: {
      primaryColor: COLOR.teal300,
  },
  toolbar: {
      container: {
          height: 0,
      },
  },
}

export default class MapBook extends React.Component {

  render() {

    return ([
      <StatusBar
        key="statusBar"
        barStyle="light-content"
      />,
      <ThemeProvider
        key="themeProvider" 
        uiTheme={uiTheme}
      >
        <MapBookNavigator ref={nav => { this.navigator = nav }} />
      </ThemeProvider>
    ])
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
})

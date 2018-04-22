import React from 'react'
import { StyleSheet } from 'react-native'

import Button from 'components/Controls/Button/Button'

import Theme from 'theme/MapBook.theme'

export default MapPageNavigationOptions = ({ navigation }) => {
  const { state, setParams } = navigation
  const { title } = state.params
  
  const headerRight = (false) ? (
    <Button 
      style={styles.headerButton} 
      onPress={() => {
        const { navigate, state } = navigation
        navigate('MapPageOld', state.params)
      }}>
        Old
    </Button>
  ) : undefined
  
  return {
    headerStyle: styles.headerStyle,
    headerTintColor: Theme.common.white,
    title: `${title}`,
    headerRight,
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    position: 'absolute', 
    zIndex: 100, 
    top: 0, 
    left: 0, 
    right: 0,
    backgroundColor: Theme.palette.primaryColor, 
    shadowColor: Theme.common.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.26,
    shadowRadius: 5,
  },
  headerButton: {
    color: Theme.common.white, 
    paddingRight: 16
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

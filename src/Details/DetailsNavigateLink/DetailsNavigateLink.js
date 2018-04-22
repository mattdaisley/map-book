import React from 'react'
import { View, Text, StyleSheet, Platform, Linking } from 'react-native'

import Theme from 'Theme/MapBook.theme'

import Button from 'Components/Button/Button'

const styles = StyleSheet.create({
  container: { height: 40, paddingRight: 8, paddingLeft: 8 },
  buttonContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 4, margin: 0, padding: 0, backgroundColor: Theme.palette.primaryColor },
  buttonStyle: { color: "white", fontSize: 16, lineHeight: 16, fontWeight: "300" }
})

export default class DetailsNavigateLink extends React.PureComponent {

  buttonPress = () => {

    const { latitude, longitude, selectedBuilding, title } = this.props

    const platformLinks = {
      'apple': `http://maps.google.com/maps?q=${latitude},${longitude}(${title})`,
      'google': `http://maps.apple.com/?daddr=${latitude},${longitude}`
    }
    const os = (Platform.OS === 'ios') ? 'apple' : 'google'
    const mapLink = platformLinks[os]
    
    Linking.openURL(mapLink)
  }
  
  render() {

    return (
      <View style={styles.container}>
        <Button 
          containerStyle={styles.buttonContainer}
          style={styles.buttonStyle} onPress={this.buttonPress}
        >
          Navigate
        </Button>
      </View>
    )
  }
}


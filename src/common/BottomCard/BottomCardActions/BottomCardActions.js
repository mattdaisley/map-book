import React from 'react'
import { 
  StyleSheet, 
  View, 
  Text
} from 'react-native'

import Theme from 'theme/MapBook.theme'

export default class BottomCardActions extends React.Component {

  render() {

    const { children } = this.props

    return (
      <View style={styles.container}>
        { children }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'stretch', 
    // backgroundColor: Theme.common.transparent, 
    padding: 16,
    maxHeight: 64
  }
})


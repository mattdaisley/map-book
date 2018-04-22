import React from 'react'
import { 
  StyleSheet, 
  View
} from 'react-native'

import Theme from 'theme/MapBook.theme'

export default class BottomCardContent extends React.Component {

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
    height: 300, 
    width: '100%', 
    position: 'absolute', 
    top: '100%', 
    backgroundColor: Theme.common.white
  }
})


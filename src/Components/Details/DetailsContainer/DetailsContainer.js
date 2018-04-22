import React from 'react'
import { Text, StyleSheet, View, Animated, TouchableWithoutFeedback } from 'react-native'

export default class DetailsContainer extends React.Component {

  render() {

    const { isHidden, style, onPress, render } = this.props

    if ( !isHidden ) {
      return (
        <Animated.View style={[styles.container, style]} >
          <TouchableWithoutFeedback onPress={onPress}>
            <View style={styles.renderWrapper} >
              {render(this.state)}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )
    }
    return null
  }
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', width: '100%', left: 0,
  },
  renderWrapper: { 
    flex: 1, backgroundColor: 'white', padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5, 
  }
})


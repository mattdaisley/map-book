import React from 'react'
import { Text, StyleSheet, View, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native'
import Theme from '../../MapBook.theme'

import Button from 'react-native-button'

export default class CustomButton extends React.Component {

  getContainerStyleFromProps = () => {
    let style = {}

    if ( !!this.props.raised ) {
      if ( !!this.props.primary ) style.backgroundColor = Theme.palette.primaryColor
      if ( !!this.props.secondary ) style.backgroundColor = Theme.palette.secondaryColor
    } else {
      if ( !!this.props.primary ) {
        style.backgroundColor = Theme.common.white
        style.borderWidth = 1
        style.borderColor = Theme.palette.primaryColor
      }
      if ( !!this.props.secondary ) {
        style.backgroundColor = Theme.common.white
        style.borderWidth = 1
        style.borderColor = Theme.palette.secondaryColor
      }
    }
    return style
  }

  getStyleFromProps = () => {
    let style = {}

    if ( !!this.props.raised ) {
      if ( !!this.props.primary ) style.color = Theme.common.white
      if ( !!this.props.secondary ) style.color = Theme.common.white
    } else {
      if ( !!this.props.primary ) {
        style.color = Theme.palette.primaryColor
      }
      if ( !!this.props.secondary ) {
        style.color = Theme.palette.secondaryColor
      }
    }
    return style
  }

  render() {

    const { 
      containerStyle, 
      style,
      onPress, 
      children
    } = this.props

    return (
      <Button
        containerStyle={[styles.container, this.getContainerStyleFromProps(), containerStyle]}
        style={[styles.style, this.getStyleFromProps(), style]}
        onPress={onPress}>
          {children}
      </Button>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    height: 30, 
    padding: 8, 
    margin: 8, 
    borderRadius: 100
  },
  style: {
    padding: 2, fontSize: 14, lineHeight: 14 
  }
})


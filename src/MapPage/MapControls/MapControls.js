import React from 'react'
import { StyleSheet, View } from 'react-native'

import ToggleMapType from './ToggleMapType/ToggleMapType'

import Theme from 'theme/MapBook.theme'

export default class MapControls extends React.Component {

  constructor(props) {
    super(props)

    this.onToggleMapType = this.onToggleMapType.bind(this)

    this.state = {
      mapType: props.mapType || null,
      showsMapType: props.showsMapType || true,
    }
  }

  componentWillReceiveProps = (nextProps) => {
    this.state = {
      showsMapType: nextProps.showsMapType || this.state.showsMapType,
    }
  }

  onToggleMapType = (mapType) => {
    if (!!this.props.onToggleMapType && typeof this.props.onToggleMapType === 'function')
      this.props.onToggleMapType(mapType)
  }

  render() {
    const { 
      mapType,
      showsMapType,
    } = this.state

    return (
      <View style={ styles.container }>
        <ToggleMapType mapType={mapType} onPress={this.onToggleMapType} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 50,
    top: 90, 
    right: 20, 
  }
})

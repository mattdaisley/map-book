import React from 'react'
import { Animated, AsyncStorage, StyleSheet } from 'react-native'

import { Icon } from 'react-native-material-ui'

// import Button from '../../../Button/Button'
import Button from 'components/Button/Button'

import Theme from 'theme/MapBook.theme'

const MAP_TYPE_HYBRID = 'hybrid'
const MAP_TYPE_STANDARD = 'standard'

export default class ToggleMapType extends React.Component {

  constructor(props) {
    super(props)

    this.onPress = this.onPress.bind(this)
    
    this.state = {
      mapType: props.mapType || MAP_TYPE_HYBRID
    }
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      mapType: nextProps.mapType || this.state.mapType
    })
  }

  onPress = () => {
    let mapType = (this.state.mapType === MAP_TYPE_HYBRID) ? MAP_TYPE_STANDARD : MAP_TYPE_HYBRID 
    
    AsyncStorage.setItem("@MobileMapBook:mapType", mapType)
      .then( () => {
        this.setState({ mapType })
      })
      .catch( () => {
        this.setState({ mapType })
      })
    
    if (this.props.onPress) this.props.onPress(mapType);
  }

  render() {
    return (
        <Button
          key="ToggleMapType"
          onPress={this.onPress}
          containerStyle={styles.container}>
            <Icon name="layers" color={Theme.palette.primaryColor}/>
        </Button>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 14, 
    height: 50, 
    width: 50, 
    boxSizing: 'border-box',
    borderRadius: 100, 
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
})

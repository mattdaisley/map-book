import React from 'react'
import { 
  StyleSheet, 
  View, 
  TouchableWithoutFeedback,
} from 'react-native'

import Theme from '../../../MapBook.theme'

export default class OpenContentButton extends React.Component {
  
  onPress = () => {
    this.props.onPress()
  }

  render() {

    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <View style={styles.container}>
          <View style={styles.tab}></View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    width: '100%'
  },
  tab: {
    backgroundColor: Theme.palette.primaryColor, 
    borderRadius: 5, 
    height: 6, 
    width: 40, 
    marginTop: 12
  }
})


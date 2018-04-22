import React from 'react'
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput,
} from 'react-native'

import Theme from 'theme/MapBook.theme'

export default class BottomCardItem extends React.Component {
  
  onChangeText = () => {
    this.props.onChangeText()
  }

  render() {

    const { label, value } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>{label}:</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.input}>{value}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'row'
  },
  labelWrapper: {
    width: '30%',
    padding: 8
  },
  label: { 
    textAlign: 'left', 
    fontSize: 14 
  },
  inputWrapper: {
    width: '70%'
  },
  input: {
    fontSize: 14, 
    borderBottomWidth: 1, 
    padding: 8, 
    borderBottomColor: Theme.palette.primaryColor
  }
})


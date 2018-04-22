import React from 'react'
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput,
} from 'react-native'

import Theme from '../../../MapBook.theme'

export default class BottomCardInput extends React.Component {
  
  onChangeText = ( text ) => {
    this.props.onChangeText( text )
  }

  render() {

    const { label, value } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>{label}:</Text>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput onChangeText={this.onChangeText} style={styles.input} value={value} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: 'red',
    height: 64
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


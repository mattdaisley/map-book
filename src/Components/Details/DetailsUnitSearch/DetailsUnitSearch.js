import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import Button from 'react-native-button'
import { Icon } from 'react-native-material-ui'

import Theme from 'theme/MapBook.theme'

export default class DetailsUnitSearch extends React.PureComponent {

  constructor(props) {
    super(props)

    this.handleChangeText = this.handleChangeText.bind(this)
    this.handleClearValue = this.handleClearValue.bind(this)
    this.handleFocus      = this.handleFocus.bind(this)
    this.handleBlur       = this.handleBlur.bind(this)
    
    this.state = {
      value: ''
    }
  }

  componentWillReceiveProps = ( nextProps ) => {
    
  }

  handleChangeText = ( text ) => {
    const value = text.toLowerCase().trim()
    this.setState({ value })
    this.props.onChangeText(value)
  }

  handleClearValue = () => {
    this.setState({ value: '' })
    this.props.onClear()
  }

  handleFocus = () => {
    if (this.props.onFocus) this.props.onFocus()
  }

  handleBlur = () => {
    if (this.props.onBlur) this.props.onBlur()
  }
  
  render() {
    const { value } = this.state

    return (
      <View 
        style={styles.container}
        key="searchContainer" 
      >

        <Text style={styles.label} >
          Unit #
        </Text>
      
        <TextInput
          style={styles.input}
          onChangeText={this.handleChangeText}
          placeholder="eg. 1-301"
          autoFocus={false}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          value={value}
        />

        { value.length > 0 && (
          <Button
            onPress={this.handleClearValue}
            containerStyle={styles.buttonContainer}
            style={styles.buttonStyle} >
              <Icon name="close" color={Theme.palette.primaryColor}/>
          </Button>
        )}
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', alignItems: 'center', maxHeight: 40 },
  label: { padding: 8, margin: 0, fontSize: 16, lineHeight: 16, marginRight: 4, color: Theme.palette.primaryColor },
  input: { flex: 1, padding: 8, margin: 0, fontSize: 16, lineHeight: 16, borderWidth: 0 },
  buttonContainer: { padding: 14, height: 50, width: 50 },
  buttonStyle: { }
})
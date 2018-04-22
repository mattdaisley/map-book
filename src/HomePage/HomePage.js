import React from 'react'
import { Platform, FlatList, Text, TextInput, View, StyleSheet, Animated, Keyboard, KeyboardAvoidingView } from 'react-native'
// import { Button } from 'react-native-material-ui'
import { Icon } from 'react-native-material-ui'
import Button from 'react-native-button'
import debounce from 'debounce'

import Theme from 'Theme/MapBook.theme'

import AddressList from '../AddressList/AddressList'


const styles = StyleSheet.create({
  searchContainer: {
    flex: 1, flexDirection: 'row', position:'absolute', padding: 8, height: 66, right: 0
  },
  searchContainerClosed: {
    flex: 1, flexDirection: 'row', position:'absolute', padding: 8, width: '100%', height: 66, right: 0,
    borderTopWidth: 1, borderColor: '#ccc', backgroundColor: 'white', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  searchButton: {
    padding:14, marginRight: 8, marginTop: -8, height:50, width: 50, borderRadius:100, backgroundColor: Theme.palette.primaryColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  searchButtonClosed: {
    padding:14, height:50, width: 50, overflow:'hidden', borderRadius:100, backgroundColor: 'white',
  }
})

export default class HomePage extends React.Component {

  static navigationOptions = {
    title: 'Mobile Map Book',
  }

  constructor(props) {
    super(props)

    this.searchContainerBottom = new Animated.Value(0)
    this.listViewBottom = new Animated.Value(0)

    this.searchTextChange = debounce(this.searchTextChange, 300)

    this.state = {
      data: [],
      filteredData: undefined,
      searchHidden: true,
      text: 'search'
    }
  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)

    this.loadAddresses()
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  keyboardWillShow = (event) => {
    // console.log(event, event.endCoordinates.screenY)
    Animated.parallel([
      Animated.timing(this.searchContainerBottom, {
        duration: event.duration,
        toValue: event.endCoordinates.height,
      }),
      Animated.timing(this.listViewBottom, {
        duration: event.duration,
        toValue: event.endCoordinates.height + 66,
      }),
    ]).start()
  }

  keyboardWillHide = (event) => {
    Animated.parallel([
      Animated.timing(this.searchContainerBottom, {
        duration: (event) ? event.duration : 250,
        toValue: 0,
      }),
      Animated.timing(this.listViewBottom, {
        duration: (event) ? event.duration : 250,
        toValue: 0,
      }),
    ]).start()
  }

  loadAddresses = () => {
    this.setState({ refreshing: true });
    fetch('https://6sux2v084j.execute-api.us-west-1.amazonaws.com/test/zones/1/addresses')
      .then( results => results.json() )
      .then( data => {
        this.setState({ data, refreshing: false })
      })
  }

  addressListRefresh = () => {
    this.loadAddresses()
  }

  searchTextChange = (text) => {
    const filteredData = this.state.data.filter( item => {
      return item.sector.toLowerCase().indexOf(text.toLowerCase()) > -1 || item.title.toLowerCase().indexOf(text.toLowerCase()) > -1
    })
    this.setState({filteredData})
  }

  searchTextBlur = (event) => {
    // console.log(JSON.stringify(event))
  }

  searchPress = () => {
    this.keyboardWillHide()
    this.setState({ searchHidden: !this.state.searchHidden, filteredData: undefined })
  }

  render() {
    // console.log(this.props)
    const searchButtonStyles = ( !!this.state.searchHidden ) ? styles.searchButton : styles.searchButtonClosed
    const searchContainerStyles = ( !!this.state.searchHidden ) ? styles.searchContainer : styles.searchContainerClosed

    return (
      [

        <Animated.View
          key="listView"
          style={[{position: 'absolute', top: 0, left: 0, right: 0}, { bottom: this.listViewBottom }]}
        >
          { (!!this.state.data && this.state.data.length > 0) && (
            <AddressList 
              navigation={this.props.navigation} 
              onRefresh={this.addressListRefresh}
              refreshing={this.state.refreshing}
              data={this.state.filteredData || this.state.data} />
          ) }
        </Animated.View>,
      
        
      <Animated.View 
        key="searchContainer" 
        style={[searchContainerStyles, { bottom: this.searchContainerBottom }]}
      >
            
        { !this.state.searchHidden && (
          <TextInput
            style={{flex: 1, height: 50, padding: 8, fontSize: 14}}
            onChangeText={this.searchTextChange}
            onBlur={this.searchTextBlur}
            placeholder="Search"
            autoFocus={true}
            // value={this.state.text}
          />
        )}

        { (!!this.state.data && this.state.data.length > 0) && (
          <Button
            onPress={this.searchPress}
            containerStyle={searchButtonStyles}
            disabledContainerStyle={{backgroundColor: 'grey'}}>
            { !!this.state.searchHidden ? (
              <Icon name="search" color="white"/>
            ) : (
              <Icon name="close" color="rgba(9, 214, 237, 1)"/>
            )}
          </Button>
        ) }
        
      </Animated.View>
      ]
    )
  }
}
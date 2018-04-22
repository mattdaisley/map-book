import React from 'react'
import { FlatList, Text, View } from 'react-native'

import AddressListItem from './AddressListItem/AddressListItem'
// import AddressPage from '../AddressPage/AddressPage'

export default class AddressList extends React.PureComponent {

  static navigationOptions = {
    title: 'Select an Address',
  }

  state = {selected: (new Map()), data: []}

  componentDidMount = () => {
    // console.log(this.props.data)
    this._onPressItem(this.props.data[0])
    // this._onPressItem(this.props.data[12])
    // this._onPressItem(this.props.data[21])
    // this._onPressItem(this.props.data[22])
    // this._onPressItem(this.props.data[23])
  }

  _keyExtractor = (item, index) => item.id

  _onPressItem = ( address ) => {
    const { navigate } = this.props.navigation
    // navigate('TestMapPage', address)
    navigate('MapPage', address)
    // navigate('EditMapPage', address)
  }

  _renderItem = ({item}) => {
    return (
      <AddressListItem
        item={item}
        onPressItem={this._onPressItem}
        selected={!!this.state.selected.get(item.id)}
      />
    )
  }

  render() {
    // console.log(this.props)
    return (
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        refreshing={this.props.refreshing}
        onRefresh={this.props.onRefresh}
        renderItem={this._renderItem}
      />
    )
  }
}
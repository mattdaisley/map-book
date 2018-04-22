import React from 'react'
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'

export default class AddressListItem extends React.PureComponent {

  _onPress = () => {
    const { item } = this.props
    this.props.onPressItem( item )
  }

  render() {
    const textColor = this.props.selected ? "red" : "#000"
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={styles.container}>
          <Text style={{ minWidth: '10%', textAlign: 'center', fontSize: 16, padding: 8 }}>{this.props.item.sector}</Text>
          <Text style={{ minWidth: '90%', color: textColor, fontSize: 16, padding: 8 }}>
            {this.props.item.title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#efefef',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})


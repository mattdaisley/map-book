import React from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import debounce from 'debounce'

import BottomCardContainer from 'components/common/BottomCard/BottomCardContainer/BottomCardContainer'
import BottomCardHeader    from 'components/common/BottomCard/BottomCardHeader/BottomCardHeader'
import BottomCardActions   from 'components/common/BottomCard/BottomCardActions/BottomCardActions'

import DetailsNavigateLink from 'components/Details/DetailsNavigateLink/DetailsNavigateLink'
import DetailsUnitSearch from 'components/Details/DetailsUnitSearch/DetailsUnitSearch'

import Theme from 'theme/MapBook.theme'

export default class MapAddressDetails extends React.Component {

  constructor(props) {
    super(props)

    this.searchTextChange = debounce(this.searchTextChange, 300)
    this.clearUnitSearch = this.clearUnitSearch.bind(this)

    this.state = {
      title: props.title || '',
      latitude: props.latitude || '',
      longitude: props.longitude || '',
    }
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      title: nextProps.title || this.state.title,
      latitude: nextProps.latitude || this.state.latitude,
      longitude: nextProps.longitude || this.state.longitude,
    })
  }

  searchTextChange = (searchText) => {
    if (this.props.onSearchTextChange)
      this.props.onSearchTextChange(searchText)
  }

  clearUnitSearch = () => {
    if (this.props.onSearchTextChange)
      this.props.onSearchTextChange('')
  }

  render() {
    const { 
      title,
      latitude,
      longitude
    } = this.state

    return (
      <BottomCardContainer 
        draggable={false}
        render={ (state) => (
          <View style={{flex: 1}} ponterEvents="box-none">
            <BottomCardHeader
              title={title} />
  
            <DetailsNavigateLink 
              title={title} 
              latitude={latitude} 
              longitude={longitude} />
  
            <BottomCardActions>
              <DetailsUnitSearch 
                onChangeText={this.searchTextChange} 
                onClear={this.clearUnitSearch} />
            </BottomCardActions>
          </View>
        )}
      >
      </BottomCardContainer>
    )
  }
}

const styles = StyleSheet.create({

})

import React from 'react'
import { Text, StyleSheet } from 'react-native'

export default class DetailsTitle extends React.PureComponent {
  
  render() {

    const { title, unitSearchText, isHidden } = this.props

    return (
      <Text style={styles.container}>
        {title} {(!!isHidden && unitSearchText.length > 0) && `#${unitSearchText}`}
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  container: { color: 'black', fontSize: 18, lineHeight: 28 },
})


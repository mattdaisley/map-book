import React from 'react'
import { 
  StyleSheet, 
  View, 
  Text
} from 'react-native'

import Theme from 'Theme/MapBook.theme'

export default class BottomCardHeader extends React.Component {

  render() {

    const { title, subheader1, subheader2, children } = this.props

    return (
      <View style={styles.container}>
        { (!!title) && ([
          <Text key="title" style={styles.header}>{title || null}</Text>,
          ( !!subheader1 && ( <Text key="subheader1" style={styles.subheader}>{subheader1}</Text> ) || null ),
          ( !!subheader2 && ( <Text key="subheader2" style={styles.subheader}>{subheader2}</Text> ) || null )
        ]) }
        { children }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: Theme.common.transparent, 
    padding: 16,
    maxHeight: 48,
  },
  header: {
    fontSize: 18, 
    lineHeight: 18,
    fontWeight: "200",
    color: Theme.common.darkBlack
  },
  subheader: {
    flex: 1,
    fontSize: 14, 
    lineHeight: 22,
    height: 22, 
    color: Theme.common.lightBlack,
  }
})


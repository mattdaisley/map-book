import React, { Children } from 'react'
import { 
  StyleSheet, 
  View, 
  Text,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo'

import Button from 'react-native-button'

import Theme from '../../../MapBook.theme'

import OpenContentButton from '../OpenContentButton/OpenContentButton'

let Window = Dimensions.get('window');

export default class BottomCardContainer extends React.Component {

  constructor(props) {
    super(props)

    this.handleToggleSnapPress = this.handleToggleSnapPress.bind(this)

    if (Platform.OS === 'ios') {
      this.bottomHeight = 152
    } else {
      this.bottomHeight = 172
    }

    this.state = {
      pan: new Animated.ValueXY({x: 0, y: Window.height - this.bottomHeight}),
      snapBottom: true,
      keyboardOpen: false,
    }

    this.initPanResponder()
  }

  componentWillMount () {
    if (Platform.OS === 'ios') {
      this.keyboardShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardShowEvent)
      this.keyboardHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardHideEvent)
    } else {
      this.keyboardShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardShowEvent)
      this.keyboardHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardHideEvent)
    }
  }

  componentWillUnmount() {
    this.keyboardShowSub.remove()
    this.keyboardHideSub.remove()
  }

  componentDidMount = () => {
    if ( this.props.open === true ) this.snapTop()
  }

  keyboardShowEvent = (event) => {
    this.state.pan.setOffset({ x: 0, y: 0.01 })

    const keyboardHeight = parseInt(Window.height - event.endCoordinates.height - this.bottomHeight)
    const duration = 250

    Animated.timing(   
      this.state.pan,
      {
        duration,
        toValue: { x: 0, y: keyboardHeight }
      }
    ).start()
    this.setState({ 
      snapTopHeight: keyboardHeight,
      snapBottom: true,
      keyboardOpen: true
    })
  }

  keyboardHideEvent = (event) => {

    const duration = 250

    const keyboardHeight = parseInt(Window.height - this.bottomHeight)

    Animated.timing(   
      this.state.pan,
      {
        duration,
        toValue: { x: 0, y: keyboardHeight }
      }
    ).start()
    
    this.setState({ 
      snapTopHeight: undefined,
      keyboardOpen: false
    })
  }

  initPanResponder = () => {

    this.panResponder = PanResponder.create({ 
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease
    })
  }

  _onPanResponderGrant = (e, gesture) => {
    if ( !this.props.draggable || this.state.keyboardOpen === true ) return
    if ( typeof this.props.onPanResponderGrant === 'function' ) this.props.onPanResponderGrant(e, gesture)
    this.state.pan.setOffset(this.state.pan.__getValue());
    this.state.pan.setValue({ x: 0, y: 0 });
  }

  _onPanResponderMove = (e, gesture) => {
    if ( !this.props.draggable || this.state.keyboardOpen === true ) return
    if ( typeof this.props.onPanResponderMove === 'function' ) this.props.onPanResponderMove(e, gesture)
    Animated.event([
      null,
      { dy: this.state.pan.y }
    ])(e, gesture)
  }

  _onPanResponderRelease = (e, gesture) => {
    if ( !this.props.draggable || this.state.keyboardOpen === true ) return
    if ( typeof this.props.onPanResponderRelease === 'function' ) this.props.onPanResponderRelease(e, gesture)

    const snapBoundary = -Window.height/4
    const panY = this.state.pan.y.__getValue()
    // this.state.pan.flattenOffset();

    // console.log('snapBottom', this.state.snapBottom)
    // console.log('panY', panY, 'snapBoundary', snapBoundary )

    if ( this.state.snapBottom === true ) {
      if ( panY < snapBoundary) {
        this.snapTop()
      } else {
        this.snapBack()
      }
    } else if ( this.state.snapBottom === false ) {
      if ( panY > snapBoundary ) {
        this.snapBottom()
      } else {
        this.snapBack()
      }
    }
  }

  snapTop = () => {
    const snapTopHeight = 300 || this.state.snapTopHeight
    this.animatePanValues({ 
      toValue:{ x: 0, y: -snapTopHeight },
      duration: 300
    })
    this.setState({snapBottom: false})
  }

  snapBottom = () => {
    const snapTopHeight = 300 || this.state.snapTopHeight
    this.animatePanValues({ 
      toValue: { x: 0, y: snapTopHeight },
      duration: 300
    })
    this.setState({snapBottom: true})
  }

  snapBack = () => {
    // console.log('snap to 0')
    this.animatePanValues({ 
      toValue: { x: 0, y: 0.01 },
      duration: 300
    })
  }

  handleToggleSnapPress = () => {
    // console.log(this.state.snapBottom)
    this.resetOffset()
    if ( this.state.snapBottom === true ) {
      this.snapTop()
    } else {
      this.snapBottom()
    }
  }

  animatePanValues = ( options ) => {
    if ( typeof this.props.animatePanValues === 'function' ) this.props.animatePanValues(options)
    Animated.timing( this.state.pan, options ).start()
  }

  resetOffset = () => {
    if ( typeof this.props.resetOffset === 'function' ) this.props.resetOffset()
    this.state.pan.setOffset(this.state.pan.__getValue());
    this.state.pan.setValue({ x: 0, y: 0 });
  }

  render() {

    const { 
      containerStyle, 
      onPress, 
      draggable,
      render
    } = this.props

    // console.log(children)

    // console.log(this.state.pan.getLayout())
    // return (
    //   <View style={styles.container} ponterEvents="none">

    //   </View>
    // )

    return (
      // <View style={styles.container} ponterEvents="none">
        <Animated.View 
          {...this.panResponder.panHandlers}
          style={[
            this.state.pan.getLayout(), 
            styles.draggableContainer
          ]} 
          ponterEvents="box-none"
        >
          <View style={{position: 'relative', width: '100%'}}>
            <View style={styles.content}>
            {/* <LinearGradient
              colors={[Theme.common.transparent, Theme.common.faintWhite, Theme.common.white, Theme.common.white, Theme.common.white]}
              style={styles.content}
            > */}
              {/* { draggable === true && <OpenContentButton onPress={this.handleToggleSnapPress} /> } */}
              { render(this.state) }
            {/* </LinearGradient> */}
            </View>
          </View>
        </Animated.View>
      // </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    // top: Window.height - 160, 
    // left: 20, right: 20,
    top: 300,
    bottom: 0, 
    width: Window.width,
    height: Window.height,
    // backgroundColor: Theme.common.lightWhite
    backgroundColor: 'red'
  },
  draggableContainer: { 
    flex: 1,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'green'
    // backgroundColor: Theme.common.transparent,
    // backgroundColor: Theme.palette.primaryColor
  },
  content: { 
    flex: 1, 
    flexDirection: 'column',
    justifyContent: 'center',
    // backgroundColor: Theme.common.transparent,
    backgroundColor: Theme.common.white,
    // backgroundColor: 'red',
    shadowColor: Theme.common.black,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    minHeight: 152,
    maxHeight: 152
  }
})


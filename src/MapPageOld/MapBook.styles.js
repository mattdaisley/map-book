import { StyleSheet } from 'react-native'

export default Styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // position: 'absolute',
    // top: 40,
    // bottom: 10,
    // left: 0,
    // right: 0
  },
  controls: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 60,
    position: 'absolute',
    bottom: 0
  },
  control: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  button: {
    height: '100%',
    width: '100%',
    padding: 20
  },
  selectedBuilding: {
    flexDirection: 'row',
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  toggleMapTypeButton: {
    padding:14, height:50, width: 50, borderRadius:100, backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  }
})
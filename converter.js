
const fs = require('fs')


const contents = fs.readFileSync("./src/Data/Addresses.json")
const jsonContent = JSON.parse(contents).filter(a => a.id === '8A')
// console.log(jsonContent)

const reducer = (stmt, b) => {
  stmt += `
INSERT INTO \`buildings\` 
  (\`addressId\`, \`title\`, \`latitude\`, \`longitude\`)
VALUES
  (22, ${b.title}, ${b.latlng.latitude}, ${b.latlng.longitude});
INSERT INTO \`polygons\`
  (\`objectId\`, \`objectType\`)
VALUES
  (LAST_INSERT_ID(), 'BUILDING');
  `

  let insert = `
INSERT INTO \`polygonPoints\`
  (\`polygonId\`, \`latitude\`, \`longitude\`)
VALUES
  `
  b.polygon.map( (point,i) => {
    insert += `(LAST_INSERT_ID(), ${point.latitude}, ${point.longitude})${(i !== b.polygon.length - 1) ? ',' : ';'}\n`
  })
  return stmt + insert
}

let writeInserts = jsonContent[0].buildings.reduce(reducer, '')
// console.log(writeInserts)
fs.writeFile('./src/Data/AddressesConverted.txt', writeInserts, 'utf8')

const LatLngOffsetter = () => {

  basePoint = {"latitude":39.85424199771152,"longitude":-104.99785200578394}
  baseUnits = [
    {"id":101,"title":"101","latlng":{"latitude":39.85422584044724,"longitude":-104.99794845908525},"polygon":[{"latitude":39.85421321151549,"longitude":-104.99804510803064},{"latitude":39.85430082496593,"longitude":-104.99792892366014},{"latitude":39.85423610152684,"longitude":-104.99785181013985},{"latitude":39.854150855928545,"longitude":-104.9979700508709}]},
    {"id":102,"title":"102","latlng":{"latitude":39.85431503251739,"longitude":-104.99782713381339},"polygon":[{"latitude":39.85430240358565,"longitude":-104.99792378275878},{"latitude":39.85439001703609,"longitude":-104.99780759838828},{"latitude":39.85432529359699,"longitude":-104.99773048486799},{"latitude":39.8542400479987,"longitude":-104.99784872559904}]},
    {"id":103,"title":"103","latlng":{"latitude":39.85425741287469,"longitude":-104.99775207665365},"polygon":[{"latitude":39.85424478394294,"longitude":-104.99784872559904},{"latitude":39.85433239739338,"longitude":-104.99773254122854},{"latitude":39.85426767395428,"longitude":-104.99765542770825},{"latitude":39.85418242835599,"longitude":-104.99777366843931}]},
    {"id":104,"title":"104","latlng":{"latitude":39.854168220729676,"longitude":-104.99788162736769},"polygon":[{"latitude":39.85415559179793,"longitude":-104.99797827631308},{"latitude":39.854243205248366,"longitude":-104.99786209194258},{"latitude":39.85417848180927,"longitude":-104.99778497842229},{"latitude":39.85409323621098,"longitude":-104.99790321915334}]},
    {"id":201,"title":"201","latlng":{"latitude":39.85422584044724,"longitude":-104.99794845908525},"polygon":[{"latitude":39.85421321151549,"longitude":-104.99804510803064},{"latitude":39.85430082496593,"longitude":-104.99792892366014},{"latitude":39.85423610152684,"longitude":-104.99785181013985},{"latitude":39.854150855928545,"longitude":-104.9979700508709}]},
    {"id":202,"title":"202","latlng":{"latitude":39.85431503251739,"longitude":-104.99782713381339},"polygon":[{"latitude":39.85430240358565,"longitude":-104.99792378275878},{"latitude":39.85439001703609,"longitude":-104.99780759838828},{"latitude":39.85432529359699,"longitude":-104.99773048486799},{"latitude":39.8542400479987,"longitude":-104.99784872559904}]},
    {"id":203,"title":"203","latlng":{"latitude":39.85425741287469,"longitude":-104.99775207665365},"polygon":[{"latitude":39.85424478394294,"longitude":-104.99784872559904},{"latitude":39.85433239739338,"longitude":-104.99773254122854},{"latitude":39.85426767395428,"longitude":-104.99765542770825},{"latitude":39.85418242835599,"longitude":-104.99777366843931}]},
    {"id":204,"title":"204","latlng":{"latitude":39.854168220729676,"longitude":-104.99788162736769},"polygon":[{"latitude":39.85415559179793,"longitude":-104.99797827631308},{"latitude":39.854243205248366,"longitude":-104.99786209194258},{"latitude":39.85417848180927,"longitude":-104.99778497842229},{"latitude":39.85409323621098,"longitude":-104.99790321915334}]}
  ]
  

  newPoint = {"latitude":39.85486742796915,"longitude":-104.99706538876386}
  diff = { latitude: basePoint.latitude - newPoint.latitude, longitude: basePoint.longitude - newPoint.longitude }

  newUnits = baseUnits.map( unit => {
    unit.latlng.latitude = unit.latlng.latitude - diff.latitude
    unit.latlng.longitude = unit.latlng.longitude - diff.longitude
    unit.polygon = unit.polygon.map( point => {
      return { latitude: point.latitude - diff.latitude, longitude: point.longitude - diff.longitude}
    })
    // console.log(JSON.stringify(unit)+',')
    return unit
  })
  console.log(JSON.stringify(newUnits))

}

// LatLngOffsetter()
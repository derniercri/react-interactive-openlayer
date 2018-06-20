import React from 'react'
import PropTypes from 'prop-types'
import Map from 'ol/map'
import View from 'ol/view'
import Draw from 'ol/interaction/draw'
import TileLayer from 'ol/layer/tile'
import VectorLayer from 'ol/layer/vector'
import OSM from 'ol/source/osm'
import Vector from 'ol/source/vector'

class InteractiveMap extends React.Component {

  constructor (props) {
    super(props)

    this.id = Math.random().toString(36).substring(7)
  }

  componentDidMount () {
    this.vector = new Vector({ wrapX: false })
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: this.vector,
        }),
      ],
      target: this.id,
      view: new View({
        center: this.props.defaultCoordinates,
        zoom: this.props.defaultZoom,
      }),
    })

    this.draw = new Draw({
      source: this.vector,
      type: 'Circle',
      geometryFunction: Draw.createBox(),
    })

    this.map.addInteraction(this.draw)

    this.vector.on('change', ({ target }) => {
      const items = target.featuresRtree_.items_
      this.props.onVectorChange(Object.keys(items).map(key => ({
        coordinates: [
          [items[key].minX, items[key].minY],
          [items[key].maxX, items[key].minY],
          [items[key].maxX, items[key].maxY],
          [items[key].minX, items[key].maxY],
        ],
        type: 'Polygon',
      })))
    })
  }

  render () {
    return (
      <div
        id={this.id}
        style={{
          height: '100%',
        }}
      />)
  }

}

InteractiveMap.propTypes = {
  defaultCoordinates: PropTypes.arrayOf(PropTypes.number),
  defaultZoom: PropTypes.number,
  onVectorChange: PropTypes.func,
}

InteractiveMap.defaultProps = {
  defaultCoordinates: [ 0, 0 ],
  defaultZoom: 5,
  onVectorChange: () => null,
}

export default InteractiveMap

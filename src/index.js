import React from 'react'
import { chunk, get } from 'lodash'
import PropTypes from 'prop-types'
import Map from 'ol/map'
import View from 'ol/view'
import Draw from 'ol/interaction/draw'
import TileLayer from 'ol/layer/tile'
import VectorLayer from 'ol/layer/vector'
import OSM from 'ol/source/osm'
import Vector from 'ol/source/vector'
import Transform from 'ol-ext/interaction/transform'

export const interactiveModes = [
  'rectangles',
  'polygons',
  'transformations',
]

class InteractiveMap extends React.Component {

  constructor(props) {
    super(props)

    this.id = Math.random().toString(36).substring(7)
  }

  componentDidMount() {
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

    this.rectangles = new Draw({
      source: this.vector,
      type: 'Circle',
      geometryFunction: Draw.createBox(),
    })

    this.polygons = new Draw({
      source: this.vector,
      type: 'Polygon',
    })

    this.transformations = new Transform({
      rotate: true,
    })

    this.vector.on('change', ({ target }) => {
      const items = get(target, 'featuresRtree_.items_')

      this.props.onVectorChange(Object.keys(items).map(key => ({
        coordinates: chunk(get(items[key], 'value.values_.geometry.flatCoordinates'), 2),
        type: 'Polygon',
      })))
    })

    this.handleInteractionChange(this.props)
  }

  componentWillReceiveProps(newProps) {
    if (newProps.selectedMode !== this.props.selectedMode) {
      this.handleInteractionChange(newProps)
    }
  }

  handleInteractionChange(props) {
    this.removeInteractions()

    switch (props.selectedMode) {
      case 'rectangles':
        return this.toggleToRectanglesMode()
      case 'polygons':
        return this.toggleToPolygonsMode()
      case 'transformations':
        return this.toggleToTransformationsMode()
    }
  }

  removeInteractions() {
    interactiveModes.forEach(mode =>
      this.map.removeInteraction(this[mode]))
  }

  toggleToPolygonsMode() {
    this.map.addInteraction(this.polygons)
  }

  toggleToRectanglesMode() {
    this.map.addInteraction(this.rectangles)
  }

  toggleToTransformationsMode() {
    this.map.addInteraction(this.transformations)
  }

  render() {
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
  selectedMode: PropTypes.oneOf(interactiveModes),
}

InteractiveMap.defaultProps = {
  defaultCoordinates: [ 0, 0 ],
  defaultZoom: 5,
  onVectorChange: () => null,
  selectedMode: interactiveModes[0],
}

export default InteractiveMap

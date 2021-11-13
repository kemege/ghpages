'use strict'

import SceneNode from "./scenenode.js";

class LightNode extends SceneNode {
    constructor(name, parent, lightType, intensity = 0.0, position = [0, 0, 0], direction = [0, 0, 0], color = [1, 1, 1]) {
        super()
        this.name = name
        this.type = "light"
        this.lightType = lightType
        this.position = position
        this.direction = direction
        this.intensity = intensity
        this.color = color
    }
}

export default LightNode
'use strict'

class SceneNode {

    constructor(name, parent, translation = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1)) {

        this.type = "node"
        this.name = name
        this.translation = translation
        this.rotation = rotation
        this.scale = scale
        if (parent) {
            // Honor parent translation and scale, rotation is currently ignored
            this.translation = vec3.add(vec3.create(), parent.translation, this.translation)
            this.scale = vec3.multiply(vec3.create(), parent.scale, this.scale)
        }
        // Create the transformation matrix for this node based on the translation, rotation, and scale you got
        this.translatationMatrix = mat4.fromTranslation(mat4.create(), this.translation)
        this.scaleMatrix = mat4.fromScaling(mat4.create(), this.scale)
        this.rotationMatrix = mat4.fromRotation(mat4.create(), this.rotation[0], vec3.fromValues(1, 0, 0))

        this.matrix = mat4.multiply(mat4.create(), this.translatationMatrix, this.scaleMatrix)
        mat4.multiply(this.matrix, this.matrix, this.rotationMatrix)

        this.parent = parent
        this.children = []

    }

    /**
     * Performs any updates if necessary
     */
    update() {

        // TODO Make any updates to your node here (e.g., change transformation)

    }

    /**
     * Gives the transform of this node
     * @returns The transformation of this node
     */
    getTransform() {

        // Return the transformation describing the object -> world transformation for this node
        return this.matrix

    }

    /**
     * Renders this node; Note that by default scene note does not render as it has no context
     * @param { WebGL2RenderingContext } gl The WebGL2 rendering context for this app
     * @param { Shader } shader The shader to use for rendering
     */
    render(gl, shader, camera, lights) {

        this.children.forEach(obj => {
            obj.render(gl, shader, camera, lights)
        });
        return

    }

    /**
     * Raycast the object. For "scene" nodes, only detect its children
     * @param { vec3 } ray ray direction from camera to mouse
     * @param { Camera } camera camera used to render the scene
     * @returns whether the ray intersects the object
     */
    raycast(ray, camera) {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i]
            // Skip planes for selection
            if (child.name.indexOf("plane") != -1) {
                continue
            }
            let hit = child.raycast(ray, camera)
            if (hit === true) {
                return child
            }
            if (hit !== null && hit !== false) {
                return hit
            }
        }
        return null
    }
}

export default SceneNode

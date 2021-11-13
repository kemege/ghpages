'use strict'

import Input from "./input.js"
import AppState from "./appstate.js"
import Shader from "./shader.js"

class App {

    constructor(scene) {

        console.log("Initializing App")

        // canvas & gl
        this.canvas = document.getElementById("canvas")
        this.canvas.addEventListener("contextmenu", event => event.preventDefault());
        this.gl = this.initGl()

        // save the scene
        this.scene = scene

        // save camera settings
        this.camera = scene.camera
        this.position = scene.camera.position
        this.lookat = scene.camera.lookat

        // light settings
        this.lights = scene.light

        // shaders
        // create and load shaders here
        this.reloadShader()
        // Placeholder for selected object
        this.selected = null

        // movement
        // TODO if you choose to use movement.js to handle your movement interactions, create an instance here

        // resize handling
        this.resizeToDisplay()
        window.onresize = this.resizeToDisplay.bind(this)

        // app state
        this.app_state = new AppState(this)
    }

    /** 
     * Resizes camera and canvas to pixel-size-corrected display size
     */
    resizeToDisplay() {

        // handle window resizes
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.canvas.width = window.innerWidth
        this.gl.canvas.height = window.innerHeight

    }

    /**
     * Initializes webgl2 with settings
     * @returns { WebGL2RenderingContext | null }
     */
    initGl() {

        // get the gl context
        let gl = this.canvas.getContext("webgl2")
        if (!gl) {
            console.error("WebGL2 is not available")
            return null
        }
        console.log("WebGL2 is available: " + gl)

        return gl

    }

    /**
     * Starts render loop
     */
    start() {

        requestAnimationFrame(() => {

            this.update()

        })

    }

    /**
     * Called every frame, triggers input and app state update and renders a frame
     */
    update() {

        this.app_state.update()

        // TODO If you choose to use movement.js to implement your movement interaction, update your movement instance here

        Input.update()
        this.render()
        requestAnimationFrame(() => {

            this.update()

        })

    }

    /**
     * Main render loop
     */
    render() {

        // clear the screen
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        // render your scene here - remember that SceneNodes build a hierarchy
        this.scene.scene.render(this.gl, this.shader, this.camera, this.lights)

    }

    /**
     * Perform raycasting to find the object under the mouse
     * @param { int } x X-coordinate of mouse click
     * @param { int } y Y-coordinate of mouse click
     * @returns the object that was clicked on
     */
    raycast(x, y) {
        if (isNaN(x) || isNaN(y)) {
            return null;
        }
        // Perform raycasting: calculate the ray and send it to the scene
        let xReal = (x / this.gl.canvas.width) * 2 - 1, yReal = -(y / this.gl.canvas.height) * 2 + 1;
        let pointMouse = vec3.fromValues(xReal, yReal, 1);
        let pointA = this.camera.position // camera position
        let pointB = vec3.transformMat4(vec3.create(), pointMouse, mat4.invert(mat4.create(), this.camera.vpMatrix())) // mouse clicked position
        let ray = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), pointB, pointA)) // ray from camera to mouse
        let hit = this.scene.scene.raycast(ray, this.camera)
        return hit
    }

    reloadShader() {
        this.shaders = {
            wireframe: new Shader(this.gl, "shaders/wireframe.vert.glsl", "shaders/wireframe.frag.glsl", "wireframe"),
            flat: new Shader(this.gl, "shaders/flat.vert.glsl", "shaders/flat.frag.glsl", "flat"),
            gouraud: new Shader(this.gl, "shaders/gouraud.vert.glsl", "shaders/gouraud.frag.glsl", "gouraud"),
            phong: new Shader(this.gl, "shaders/phong.vert.glsl", "shaders/phong.frag.glsl", "phong")
        }
        // Set default shader
        this.shader = this.shaders.flat
    }
}

export default App

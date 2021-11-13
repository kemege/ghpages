'use strict'

import Input from './input.js'
import { PerspectiveCamera, OrthographicCamera } from './camera.js'

class AppState {

    constructor(app) {

        this.app = app
        this.is_selecting = false

        // get list of ui indicators
        this.ui_categories = {

            "camera_mode":
            {

                "fps": document.getElementById("fpsCamMode"),
                "stationary": document.getElementById("statCamMode")

            },
            "projection_mode":
            {

                "perspective": document.getElementById("perspProjMode"),
                "orthographic": document.getElementById("orthoProjMode")

            },
            "selection":
            {

                "raycasting": document.getElementById("selectionRaycasting"),
                "target": document.getElementById("selectionTarget")

            },
            "shading":
            {

                "wireframe": document.getElementById("wireframeShading"),
                "flat": document.getElementById("flatShading"),
                "gouraud": document.getElementById("gouraudShading"),
                "phong": document.getElementById("phongShading"),
            }

        }

        // update ui with default values
        this.updateUI("camera_mode", "stationary")
        this.updateUI("shading", "flat")
        this.updateUI("projection_mode", "perspective")
        this.updateUI("selection", "target")

    }

    /**
     * Updates the app state by checking the input module for changes in user input
     */
    update() {

        // check user input using the input module and create appropriate handlers to manipulate the canvas
        // don't forget to update the ui as seen in the constructor to tell the ui what mode you're in
        if (Input.isKeyPressed("q")) {
            this.app.reloadShader()
        } else if (Input.isKeyPressed("p")) {
            let camera = this.app.camera
            this.app.camera = new PerspectiveCamera(camera.position, camera.lookat, camera.up, 60)
            this.app.camera.zoom = camera.zoom
            this.updateUI("projection_mode", "perspective")
        } else if (Input.isKeyPressed("o")) {
            let camera = this.app.camera
            this.app.camera = new OrthographicCamera(camera.position, camera.lookat, camera.up, -4, 4, -4, 4)
            this.app.camera.zoom = camera.zoom
            this.updateUI("projection_mode", "orthographic")
        } else if (Input.isKeyPressed("1")) {
            this.app.shader = this.app.shaders.wireframe
            this.updateUI("shading", "wireframe")
        } else if (Input.isKeyPressed("2")) {
            this.app.shader = this.app.shaders.flat
            this.updateUI("shading", "flat")
        } else if (Input.isKeyPressed("3")) {
            this.app.shader = this.app.shaders.gouraud
            this.updateUI("shading", "gouraud")
        } else if (Input.isKeyPressed("4")) {
            this.app.shader = this.app.shaders.phong
            this.updateUI("shading", "phong")
        } else if (Input.isKeyPressed("r")) {
            // Raycasting detection
            this.app.selected = this.app.raycast(Input.mousex, Input.mousey)
            this.updateUI("selection", "target", this.app.selected == null ? 'No Target' : this.app.selected.name)
        } else if (Input.isKeyPressed("e")) {
            // Lighting editing
            let type = prompt('Input light type to edit: (p for point light, d for directional light)', 'p')
            if (['p', 'd'].indexOf(type) == -1) {
                // invalid light type
                return;
            }
            let number = prompt('Input light number to edit: (1-16)', '1')
            if (parseInt(number) >= 16 || parseInt(number) < 0) {
                // invalid light number
                return;
            }
            let intensity = prompt('Input light intensity:', '0')
            let color = prompt('Input light color in "R,G,B" format, each value varies from 0.0 to 1.0', '1,1,1')
            let id = parseInt(number)
            if (type === 'p') {
                // point light
                let position = prompt('Input light position in "x,y,z" format', '0,0,0')
                this.app.lights.point[id].intensity = intensity
                this.app.lights.point[id].color = color
                this.app.lights.point[id].position = position
            }
            if (type === 'd') {
                // directional light
                let direction = prompt('Input light direction in "x,y,z" format', '0,0,0')
                this.app.lights.direction[id].intensity = intensity
                this.app.lights.direction[id].color = color
                this.app.lights.direction[id].direction = direction
            }
        }

        if (this.app.selected != null) {
            // We have a selected object, manipulate only this object
            let scale = this.app.selected.scale
            if (Input.isKeyPressed("=")) {
                // Enlarge object
                this.app.selected.scale = [scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1]
                console.log(this.app)
            } else if (Input.isKeyPressed("-")) {
                // Shrink object
                this.app.selected.scale = [scale[0] * 0.9, scale[1] * 0.9, scale[2] * 0.9]
            }
            // Left click for rotating
            if (Input.isMouseDown(0)) {
                let mouseDx = Input.getMouseDx(), mouseDy = Input.getMouseDy()
                if (isFinite(mouseDx) && mouseDx !== 0) {
                    this.app.selected.rotation = [this.app.selected.rotation[0], this.app.selected.rotation[1] + mouseDx, this.app.selected.rotation[2]]
                }
                if (isFinite(mouseDy) && mouseDy !== 0) {
                    this.app.selected.rotation = [this.app.selected.rotation[0] + mouseDx, this.app.selected.rotation[1], this.app.selected.rotation[2]]
                }
            }
            // Right click for panning
            if (Input.isMouseDown(2)) {
                let mouseDx = Input.getMouseDx(), mouseDy = Input.getMouseDy()
                if (isFinite(mouseDx) && mouseDx !== 0 && isFinite(mouseDy) && mouseDy !== 0) {
                    let translation = this.app.selected.translation
                    let dx = mouseDx * 0.01
                    let dy = mouseDy * 0.01
                    this.app.selected.translation = [translation[0] + dx, translation[1] + dy, translation[2]]
                }
            }
            this.app.selected.update()
        } else {
            // We have a no selected object, manipulate the camera instead
            if (Input.isKeyPressed("=")) {
                // Zoom in
                this.app.camera.zoom = this.app.camera.zoom * 0.9
            } else if (Input.isKeyPressed("-")) {
                // Zoom out
                this.app.camera.zoom = this.app.camera.zoom * 1.1
            }
            // Left click for rotating
            if (Input.isMouseDown(0)) {
                let mouseDx = Input.getMouseDx(), mouseDy = Input.getMouseDy()
                if (isFinite(mouseDx) && mouseDx !== 0) {
                    this.app.camera.rotate(mouseDx, [0, 1, 0])
                }
                if (isFinite(mouseDy) && mouseDy !== 0) {
                    this.app.camera.rotate(mouseDy, [1, 0, 0])
                }
            }
            // Right click for panning
            if (Input.isMouseDown(2)) {
                let mouseDx = Input.getMouseDx(), mouseDy = Input.getMouseDy()
                if (mouseDx !== 0) {
                    let position = this.app.camera.position
                    let lookat = this.app.camera.lookat
                    let dx = mouseDx * 0.01
                    let dy = mouseDy * 0.01
                    this.app.camera.position = [position[0] + dx, position[1] + dy, position[2]]
                    this.app.camera.lookat = [lookat[0] + dx, lookat[1] + dy, lookat[2]]
                }
            }
        }



    }

    /**
     * Updates the ui to represent the current interaction
     * @param { String } category The ui category to use; see this.ui_categories for reference
     * @param { String } name The name of the item within the category
     * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
     */
    updateUI(category, name, value = null) {

        for (let key in this.ui_categories[category]) {

            this.updateUIElement(this.ui_categories[category][key], key == name, value)

        }

    }

    /**
     * Updates a single ui element with given state and value
     * @param { Element } el The dom element to update
     * @param { Boolean } state The state (active / inactive) to update it to
     * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
     */
    updateUIElement(el, state, value) {

        el.classList.remove(state ? "inactive" : "active")
        el.classList.add(state ? "active" : "inactive")

        if (state && value != null)
            el.innerHTML = value

    }

}

export default AppState

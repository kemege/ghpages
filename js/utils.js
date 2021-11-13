'use strict'

import SceneNode from "./scenenode.js"
import ObjectNode from "./object.js"
import { PerspectiveCamera, OrthographicCamera } from "./camera.js"
import LightNode from "./light.js"

/**
 * Clamps a number between two numbers
 * @param { Number } number The number to clamp
 * @param { Number } min The minimum used for clamping
 * @param { Number } max The maximum used for clamping
 * @returns { Number } The clamped number
 */
function clamp(number, min, max) {

    return Math.max(min, Math.min(number, max))

}

/**
 * Converts degrees to radians
 * @param { Number } deg The number in degrees
 * @returns { Number }The angle in radians
 */
function deg2rad(deg) {

    return (deg * Math.PI) / 180

}

/**
 * Converts a hex color string to a normalized rgba array
 * @param { String } hex The hex color as a string
 * @returns { Array<number> } The color as normalized values
 */
function hex2rgb(hex) {

    let rgb = hex.match(/\w\w/g)
        .map(x => parseInt(x, 16) / 255)
    return vec3.fromValues(rgb[0], rgb[1], rgb[2])

}

/**
 * Returns the mouse coordinates relative to a clicking target, in our case the canvas
 * @param event The mouse click event
 * @returns { { x: number, y: number } } The x and y coordinates relative to the canvas
 */
function getRelativeMousePosition(event) {

    let target = event.target

    // if the mouse is not over the canvas, return invalid values
    if (target.id != 'canvas') {

        return {

            x: -Infinity,
            y: +Infinity,

        }

    }

    target = target || event.target;
    let rect = target.getBoundingClientRect();

    return {

        x: event.clientX - rect.left,
        y: event.clientY - rect.top,

    }

}

/**
 * Loads a given URL; this is used to load the shaders from file
 * @param { String } url The relative url to the file to be loaded
 * @returns { String | null } The external file as text
 */
function loadExternalFile(url) {

    let req = new XMLHttpRequest()
    req.open("GET", url, false)
    req.send(null)
    return (req.status == 200) ? req.responseText : null

}

/**
 * Loads a given .obj file and builds an object from it with vertices, colors and normals
 * @param { String } url The url to the file
 * @param { Array.<Number> } fallback_color A default color to use if the OBJ does not define vertex colors
 * @returns { Array.<Number> } The complete, interleaved vertex buffer object containing vertices, colors and normals
 */
function loadObjFile(url, fallback_color) {

    let raw = loadExternalFile(url)

    let vertices = []
    let colors = []
    let normals = []
    let vertex_ids = []
    let normal_ids = []

    for (let line of raw.split('\n')) {

        switch (line.split(' ')[0]) {

            case 'v':
                parseObjVertex(line, vertices)
                parseObjColor(line, colors, fallback_color)
                break
            case 'vn':
                parseObjNormal(line, normals)
                break
            case 'f':
                parseObjIds(line, vertex_ids, normal_ids)

        }
    }

    let data = []
    for (let i = 0; i < vertex_ids.length; i++) {

        const vid = (vertex_ids[i] * 3)
        const nid = (normal_ids[i] * 3)

        data.push(vertices[vid], vertices[vid + 1], vertices[vid + 2])
        data.push(colors[vid], colors[vid + 1], colors[vid + 2])
        data.push(normals[nid], normals[nid + 1], normals[nid + 2])

    }

    return data

}

/**
 * Parses a given object vertex entry line
 * @param { String } entry A line of an object vertex entry
 * @param { Array.<Number> } list The list to write the parsed vertex coordinates to
 */
function parseObjVertex(entry, list) {

    const elements = entry.split(' ')
    if (elements.length < 4)
        alert("Unknown vertex entry " + entry)

    list.push(parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3]))

}

/**
 * Parses a given object color entry line
 * @param { String } entry A line of an object color entry
 * @param { Array.<Number> } list The list to write the parsed vertex colors to
 * @param { Array.<Number> } fallback_color A fallback color in case the OBJ does not define vertex colors
 */
function parseObjColor(entry, list, fallback_color) {

    const elements = entry.split(' ')
    if (elements.length < 7) {

        list.push(fallback_color[0], fallback_color[1], fallback_color[2])
        return

    }

    list.push(parseFloat(elements[4]), parseFloat(elements[5]), parseFloat(elements[6]))

}

/**
 * Parses a given object normal entry line
 * @param { String } entry A line of an object normal entry
 * @param { Array.<Number> } list The list to write the parsed vertex normals to
 */
function parseObjNormal(entry, list) {

    const elements = entry.split(' ')
    if (elements.length != 4)
        alert("Unknown normals entry " + entry)

    list.push(parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3]))

}

/**
 * Parses a given object ids entry line
 * @param { String } entry A line of an object ids entry
 * @param { Array.<Number> } vertex_ids The list of vertex ids to write to
 * @param { Array.<Number> } normal_ids The list normal ids to write to
 */
function parseObjIds(entry, vertex_ids, normal_ids) {

    const elements = entry.split(' ')
    if (elements.length != 4)
        alert("Unknown face entry " + entry)

    for (let element of elements) {

        if (element == 'f')
            continue

        const subelements = element.split('/')

        vertex_ids.push(parseInt(subelements[0]) - 1)
        normal_ids.push(parseInt(subelements[2]) - 1)

    }

}

/**
 * Loads a scene file and triggers the appropriate parsing functions
 * @param { String } url The url to the scene file
 * @returns An object containing information about the camera, the light and the scene
 */
function loadSceneFile(url) {

    let raw = loadExternalFile(url)

    let scene_description = JSON.parse(raw)

    return {

        "camera": parseCamera(scene_description["camera"]),
        "scene": parseSceneNode(scene_description["root"], null),
        "light": parseLight(scene_description["light"])

    }
}

/**
 * Parses a given camera entry
 * @param { Object } entry An entry containing information on a single camera
 * @returns A camera instance with the camera read from the scene file
 */
function parseCamera(entry) {

    let camera = null

    let position = vec3.fromValues(entry.position[0], entry.position[1], entry.position[2])
    let lookat = vec3.fromValues(entry.lookat[0], entry.lookat[1], entry.lookat[2])
    let up = vec3.fromValues(entry.up[0], entry.up[1], entry.up[2])
    let fov = entry.fov

    if (entry.type == "perspective") {

        // create a perspective camera here
        camera = new PerspectiveCamera(position, lookat, up, fov)

    }
    else if (entry.type == "orthographic") {

        // create an orthographic camera here
        camera = new OrthographicCamera(position, lookat, up, -fov, fov, -fov, fov)

    }

    return camera

}

/**
 * Parse light settings from scene file
 * @param { Array } entryList Array of light settings
 * @returns { Array } The parsed light list
 */
function parseLight(entryList) {
    let FULL_LIST_LENGTH = 16
    let result = {
        'point': [],
        'direction': []
    }
    for (let i = 0; i < entryList.length; i++) {
        let entry = entryList[i]
        let name = entry.name
        let type = entry.type
        let intensity = entry.intensity
        let color = entry.color
        if (type === 'point') {
            let position = [entry.position[0], entry.position[1], entry.position[2]]
            result.point.push(new LightNode(name, null, type, intensity, position, [0, 0, 0], color))
        }
        if (type === 'direction') {
            let direction = [entry.direction[0], entry.direction[1], entry.direction[2]]
            result.direction.push(new LightNode(name, null, type, intensity, [0, 0, 0], direction, color))
        }
    }
    // Append dummy lights
    while (result.point.length < FULL_LIST_LENGTH) {
        result.point.push(new LightNode('dummy', null, 'point', 0, [0, 0, 0], [0, 0, 0], [0, 0, 0]))
    }
    while (result.direction.length < FULL_LIST_LENGTH) {
        result.direction.push(new LightNode('dummy', null, 'direction', 0, [0, 0, 0], [0, 0, 0], [0, 0, 0]))
    }

    return result

}


/**
 *  Recursively parses a SceneNode and its children
 * @param { Object } entry An entry from the JSON config representing a SceneNode
 * @param { Object | null } parent The parent node of the current SceneNode
 * @returns { SceneNode } The parsed SceneNode object
 */
function parseSceneNode(entry, parent) {

    let node = null

    let name = entry.name
    let translation = vec3.fromValues(entry.translation[0], entry.translation[1], entry.translation[2])
    let rotation = vec3.fromValues(entry.rotation[0], entry.rotation[1], entry.rotation[2])
    let scale = vec3.fromValues(entry.scale[0], entry.scale[1], entry.scale[2])

    if (entry.type == 'node') {
        node = new SceneNode(name, parent, translation, rotation, scale)

    }
    else if (entry.type == 'object') {

        const fallback_color = hex2rgb(entry.color)
        const obj_content = loadObjFile(entry.obj, fallback_color)

        node = new ObjectNode(obj_content, name, parent, translation, rotation, scale)

    }

    for (let child of entry.children)
        node.children.push(parseSceneNode(child, node))

    return node

}

export {

    clamp,
    deg2rad,
    hex2rgb,
    getRelativeMousePosition,
    loadExternalFile,
    loadObjFile,
    loadSceneFile

}

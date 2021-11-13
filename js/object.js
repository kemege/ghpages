'use strict'

import SceneNode from "./scenenode.js";

class ObjectNode extends SceneNode {

    constructor(vbo_data, name, parent, translation = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1)) {

        super(name, parent, translation, rotation, scale)

        this.vbo_data = new Float32Array(vbo_data)
        this.vbo = null

        // construct model matrix
        let coef = Math.PI / 180
        let rotationX = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(1, 0, 0))
        let rotationY = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(0, 1, 0))
        let rotationZ = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(0, 0, 1))
        let scaleMatrix = mat4.fromScaling(mat4.create(), this.scale)
        this.model_matrix = mat4.fromTranslation(mat4.create(), translation)
        mat4.mul(this.model_matrix, this.model_matrix, rotationX)
        mat4.mul(this.model_matrix, this.model_matrix, rotationY)
        mat4.mul(this.model_matrix, this.model_matrix, rotationZ)
        mat4.mul(this.model_matrix, this.model_matrix, scaleMatrix)

        this.temp = true
    }

    update() {

        super.update()

        // Make any updates to your object here
        // Update model matrix for this object
        let coef = Math.PI / 180
        let rotationX = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(1, 0, 0))
        let rotationY = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(0, 1, 0))
        let rotationZ = mat4.fromRotation(mat4.create(), this.rotation[0] * coef, vec3.fromValues(0, 0, 1))
        let scaleMatrix = mat4.fromScaling(mat4.create(), this.scale)
        this.model_matrix = mat4.fromTranslation(mat4.create(), this.translation)
        mat4.mul(this.model_matrix, this.model_matrix, rotationX)
        mat4.mul(this.model_matrix, this.model_matrix, rotationY)
        mat4.mul(this.model_matrix, this.model_matrix, rotationZ)
        mat4.mul(this.model_matrix, this.model_matrix, scaleMatrix)

    }

    createBuffers(gl) {
        // Create your VBO buffer here and upload data to the GPU
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vbo_data), gl.STATIC_DRAW);
        this.vbo = buffer;
    }

    render(gl, shader, camera, lights) {

        if (this.vbo == null)
            this.createBuffers(gl)
        // Collect light settings
        let FULL_LIST_LENGTH = 16
        let pointLight = { intensity: [], position: [], color: [] }, directionLight = { intensity: [], direction: [], color: [] }
        for (let idx = 0; idx < FULL_LIST_LENGTH; idx++) {
            pointLight.intensity.push(lights.point[idx].intensity)
            pointLight.position = pointLight.position.concat(lights.point[idx].position)
            pointLight.color = pointLight.color.concat(lights.point[idx].color)
            directionLight.intensity.push(lights.direction[idx].intensity)
            directionLight.direction = directionLight.direction.concat(lights.direction[idx].direction)
            directionLight.color = directionLight.color.concat(lights.direction[idx].color)
        }
        // let pointLightBuffer = gl.createBuffer()
        // gl.bindBuffer(gl.ARRAY_BUFFER, pointLightBuffer)
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointLight), gl.STATIC_DRAW)

        // let directionLightBuffer = gl.createBuffer()
        // gl.bindBuffer(gl.ARRAY_BUFFER, directionLightBuffer)
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(directionLight), gl.STATIC_DRAW)

        // Link your VBO to your shader variables here
        var numComponents = 3;
        var offset = 9 * Float32Array.BYTES_PER_ELEMENT;
        var stride = 3 * Float32Array.BYTES_PER_ELEMENT;
        shader.setArrayBuffer("a_position", this.vbo, numComponents, offset, 0);
        shader.setArrayBuffer("a_normal", this.vbo, numComponents, offset, 2 * stride);
        shader.setArrayBuffer("a_color", this.vbo, numComponents, offset, 1 * stride);
        // Remember that your VBO contains not only vertex data but also colors and normals - chose stride and offset appropriately
        // Call drawArrays to draw the geometry
        shader.use()
        let vpMatrix = camera.vpMatrix()
        let mvpMatrix = mat4.mul(mat4.create(), vpMatrix, this.model_matrix)
        if (shader.name == 'flat' || shader.name == 'wireframe') {
            shader.setUniform4x4f("u_mvp_matrix", mvpMatrix)
            shader.setUniform3f("u_light_direction", vec3.sub(vec3.create(), camera.position, camera.lookat))
        }
        if (shader.name == 'gouraud' || shader.name == 'phong') {
            shader.setUniform1f("Ka", 1.0)
            shader.setUniform1f("Kd", 1.0)
            shader.setUniform1f("Ks", 1.0)
            shader.setUniform1f("shininess", 10.0)
            shader.setUniform3f("aColor", vec3.fromValues(0.1, 0.1, 0.1))
            shader.setUniform4x4f("u_mv_matrix", mat4.mul(mat4.create(), camera.viewMatrix(), this.model_matrix))
            shader.setUniform4x4f("u_p_matrix", camera.projectionMatrix())
            let mvMatrix = mat4.mul(mat4.create(), camera.viewMatrix(), this.model_matrix)
            let mvMatrixInvert = mat4.invert(mat4.create(), mvMatrix)
            let normalMatrix = mat4.transpose(mat4.create(), mvMatrixInvert)
            shader.setUniform4x4f("u_normal_matrix", normalMatrix)
            shader.setUniform1fv("plIntensity", new Float32Array(pointLight.intensity))
            shader.setUniform3f("plPosition", pointLight.position)
            shader.setUniform3f("plColor", pointLight.color)
            shader.setUniform1fv("dlIntensity", directionLight.intensity)
            shader.setUniform3f("dlDirection", directionLight.direction)
            shader.setUniform3f("dlColor", directionLight.color)
        }
        gl.drawArrays(gl.TRIANGLES, 0, this.vbo_data.length / 9)

        // render child nodes
        this.children.forEach(obj => {
            obj.render(gl, shader)
        });
    }

    /**
     * Raycast the object, using Moller-Trumbore algorithm, adapted from https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
     * @param { vec3 } ray 
     * @param { Camera } camera 
     * @returns whether the ray intersects the object
     */
    raycast(ray, camera) {
        for (let i = 0; i < this.vbo_data.length / (3 * 9); i++) {
            let eps = 1e-7
            let pointA = vec3.fromValues(this.vbo_data[i * 27], this.vbo_data[i * 27 + 1], this.vbo_data[i * 27 + 2]);
            let pointB = vec3.fromValues(this.vbo_data[i * 27 + 9], this.vbo_data[i * 27 + 10], this.vbo_data[i * 27 + 11]);
            let pointC = vec3.fromValues(this.vbo_data[i * 27 + 18], this.vbo_data[i * 27 + 19], this.vbo_data[i * 27 + 20]);
            // Transform raw data points to world space
            vec3.transformMat4(pointA, pointA, this.model_matrix);
            vec3.transformMat4(pointB, pointB, this.model_matrix);
            vec3.transformMat4(pointC, pointC, this.model_matrix);

            let edge1 = vec3.sub(vec3.create(), pointB, pointA);
            let edge2 = vec3.sub(vec3.create(), pointC, pointA);
            let pvec = vec3.cross(vec3.create(), ray, edge2);
            let a = vec3.dot(edge1, pvec);
            if (a > -eps && a < eps) continue

            let f = 1 / a
            let s = vec3.sub(vec3.create(), camera.position, pointA);
            let u = f * vec3.dot(s, pvec);
            if (u < 0 || u > 1) continue

            let q = vec3.cross(vec3.create(), s, edge1);
            let v = f * vec3.dot(ray, q);
            if (v < 0 || u + v > 1) continue

            // Find intersection point
            let t = f * vec3.dot(edge2, q);
            if (t > eps) {
                let intersection = vec3.add(vec3.create(), camera.position, vec3.scale(vec3.create(), ray, t));
                return this
            }
            else {
                continue
            }

        }
        return false
    }
}

export default ObjectNode

'use strict'

import SceneNode from "./scenenode.js"
import { perspectiveProjectionMatrix, orthographicProjectionMatrix } from "./matrix.js"

class Camera extends SceneNode
{

    // implement a camera base class

    constructor( position, lookat, up )
    {

        super( )
        this.position = position
        this.lookat = lookat
        this.up = up
        this.zoom = 1.0
        
    }

    update( )
    {

        super.update( )

    }

    /**
     * Returns vp matrix for current camera
     * @returns {mat4} the viewport matrix
     */
    vpMatrix( )
    {

        let matrix = mat4.mul( mat4.create( ), this.projectionMatrix( ), this.viewMatrix( ) )
        return matrix

    }

    /**
     * Returns camera matrix for current camera, which is a lookup matrix
     * @returns {mat4} the camera matrix
     */
    cameraMatrix( )
    {

        let up = this.up
        let direction = vec3.sub( vec3.create( ), this.position, this.lookat )
        let translation = mat4.fromTranslation( mat4.create( ), this.position )
        let z = vec3.normalize( vec3.create( ), direction )
        let x = vec3.normalize( vec3.create( ), vec3.cross( vec3.create( ), up, z ) )
        let y = vec3.cross( vec3.create( ), z, x )
        let rotation = mat4.fromValues( x[ 0 ], x[ 1 ], x[ 2 ], 0,
            y[ 0 ], y[ 1 ], y[ 2 ], 0,
            z[ 0 ], z[ 1 ], z[ 2 ], 0,
            0, 0, 0, 1 )
        let matrix = mat4.mul( mat4.create( ), translation, rotation )
        return matrix

    }

    /**
     * Returns view matrix for current camera
     * @returns {mat4} the view matrix
     */
    viewMatrix( )
    {
        
        return mat4.invert( mat4.create( ), this.cameraMatrix( ) )

    }

    /**
     * Get projection matrix for current camera. nothing for this dummy camera
     * @returns {mat4} the projection matrix
     */
    projectionMatrix( )
    {

        return
        
    }

    /**
     * Rotate camera around lookat point
     * @param { double } angle the angle to rotate in degrees
     * @param { vec3 } axis axis of rotation
     */
    rotate( angle, axis )
    {
    
            let rotation = mat4.fromRotation( mat4.create( ), angle * Math.PI / 180, axis )
            let direction = vec3.sub( vec3.create( ), this.position, this.lookat )
            vec3.transformMat4( direction, direction, rotation )
            this.position = vec3.add( vec3.create( ), this.lookat, direction )

    }

}

class PerspectiveCamera extends Camera
{

    // implement a perspective camera
    constructor( position, lookat, up, fov )
    {

        super( position, lookat, up )
        this.fov = fov

    }

    /**
     * Calculates projection matrix for perspective camera
     * @returns {mat4} the projection matrix for perspective camera
     */
    projectionMatrix( )
    {

        let near = 0.001, far = 1000.0
        let fov = this.fov * this.zoom
        let values = perspectiveProjectionMatrix( fov, near, far )
        return mat4.fromValues(values[ 0 ], values[ 1 ], values[ 2 ], values[ 3 ],
            values[ 4 ], values[ 5 ], values[ 6 ], values[ 7 ],
            values[ 8 ], values[ 9 ], values[ 10 ], values[ 11 ],
            values[ 12 ], values[ 13 ], values[ 14 ], values[ 15 ] )
        
    }

}

class OrthographicCamera extends Camera
{

    // implement an orthographic camera
    constructor( position, lookat, up, left, right, bottom, top )
    {
        
        super( position, lookat, up )
        this.left = left
        this.right = right
        this.bottom = bottom
        this.top = top

    }

    /**
     * Calculates projection matrix for orthographic camera
     * @returns {mat4} the projection matrix for orthographic camera
     */
    projectionMatrix( )
    {
        
        let near = 0.001, far = 1000.0
        let values = orthographicProjectionMatrix( this.bottom * this.zoom, this.top * this.zoom, this.left * this.zoom, this.right * this.zoom, near, far )
        return mat4.fromValues(values[ 0 ], values[ 1 ], values[ 2 ], values[ 3 ],
            values[ 4 ], values[ 5 ], values[ 6 ], values[ 7 ],
            values[ 8 ], values[ 9 ], values[ 10 ], values[ 11 ],
            values[ 12 ], values[ 13 ], values[ 14 ], values[ 15 ] )
        
    }
}

class FpsCamera extends Camera
{

    // TODO implement an fps camera
    // THIS MODE IS OPTIONAL

}

export
{

    PerspectiveCamera,
    OrthographicCamera,
    FpsCamera

}

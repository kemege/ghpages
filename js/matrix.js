'use strict'

// implement these and other potentially missing matrix functions here
// The below functions are just two examples you'll definitely need to implement
// A complete example function is given above

/**
 * Gives the perspective camera projection matrix
 * @returns { Array.<Number> } The perspective camera projection matrix as a list
 */
function perspectiveProjectionMatrix( angle, near, far )
{

    var scale = 1 / Math.tan(angle * Math.PI / 180 / 2)
    return [ 
        scale, 0, 0, 0,
        0, scale, 0, 0,
        0, 0, -(far + near) / (far - near), -1,
        0, 0, -2 * far * near / (far - near), 0
     ]

}

/**
 * Gives the orthographic camera projection matrix
 * @returns { Array.<Number> } The orthographic camera projection matrix as a list
 */
function orthographicProjectionMatrix( bottom, top, left, right, near, far )
{

    var n = near
    var f = far
    return [ 
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (f - n), 0,
        -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(f + n) / (f - n), 1
    ]
    
}

/**
 * Gives a scale matrix
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @returns { Array.<Number> } The scale matrix as a list
 */
function scaleMatrix( x, y, z )
{

    return [ 
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]

}

export
{
    perspectiveProjectionMatrix,
    orthographicProjectionMatrix,
    scaleMatrix
}

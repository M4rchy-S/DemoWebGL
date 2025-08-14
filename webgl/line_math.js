
function points_to_vertices(points)
{
    const numVerticles = ((points / 2) - 1) * 6;
    const VerticesArray = new Float32Array(numVerticles * 2);

    const points_calculated = 0;
    let i = 0;
    let offset = 0;
    while(points_calculated != (points / 2 ) - 1 )
    {
        const x1 = points[i];
        const y1 =  points[i+1];
    
        const x2 =  points[i+3];
        const y2 =  points[i+4];
    
        const WIDTH = 3.0;
    
        //  1. Find Angle
    
        const width = x2 - x1;
        const height = y2 - y1;
    
        const angle = Math.atan(height, width); // Radians 
    
        //  2. Create vertices points
        const v1x = x1;
        const v1y = y1 + WIDTH;
        
        const v2x = x1;
        const v2y = y1 - WIDTH;
    
        const v3x = x2;
        const v3y = y2 + WIDTH;
        
        const v4x = x2;
        const v4y = y2 - WIDTH;
    
    
        // 3. Rotate borders points
        // const p1 = rotate_point(v1x, v1y, x1, y1, angle);
        // const p2 = rotate_point(v2x, v2y, x1, y1, angle);
         
        // const p3 = rotate_point(v3x, v3y, x2, y2, angle);
        // const p4 = rotate_point(v4x, v4y, x2, y2, angle);

        

        i += 2;
        offset += 12;

    }

    // 4. Return in triangles form
    return new Float32Array([
        v1x, v1y,
        v3x, v3y,
        v4x, v4y,

        v2x, v2y,
        v3x,v3y,
        v1x,v1y,

    ]);
    return VerticesArray;
}

function rotate_point(vx, vy, Ox, Oy, radians)
{
    let x_norm = vx - Ox;
    let y_norm = vy - Oy;
 
    // let x_temp = x_norm * Math.cos(radians) - y_norm * Math.sin(radians);
    // let y_temp = x_norm * Math.sin(radians) + y_norm * Math.cos(radians);
 
    // let new_x = x_temp + Ox;
    // let new_y = y_temp + Oy;

    // return [new_x, new_y];
    return [vx, vy];
}


export {points_to_vertices}
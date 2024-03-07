class CubeCoord {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    directions = [ [ 1, -1, 0 ], [ +1, 0, -1 ], [ 0, +1, -1 ], [ -1, +1, 0 ], [-1, 0, +1], [0, -1, +1] ];
    x;
    y;
    z;

    neighbor = function(orientation, distance = 1){
        let nx = this.x + this.directions[orientation][0] * distance;
        let ny = this.y + this.directions[orientation][1] * distance;
        let nz = this.z + this.directions[orientation][2] * distance;

        return new CubeCoord(nx, ny, nz);
    }

    opposite = function() {
        return new CubeCoord(-this.x, -this.y, -this.z);
    }

    equals = function(coord) {
        if (this.x != coord.x)
            return false;
        if (this.y != coord.y)
            return false;
        if (this.z != coord.z)
            return false;
        return true;
    }
}

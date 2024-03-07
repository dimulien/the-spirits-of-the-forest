class Cell{
    constructor(index, coord) {
        this.index = index;
        this.coord = new Object(coord);
    }

    index;
    richness;
    coord;

    setRichness = function(richness) {
        this.richness = richness;
    }
}
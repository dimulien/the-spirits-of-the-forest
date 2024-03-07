class Player {
    constructor(id, ) {
        this.id = id;
        this.sun = 0;
        this.score = 0;
    }

    id;
    sun;
    score;

    updateSun = function(newSun) {
        this.sun = newSun;
    }

    addScore = function(addedScore) {
        this.score += addedScore;
    }
}
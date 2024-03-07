/**
 * TODO:    1. DONE: Implement shadow behavior (sun direction, turning in a round)
 *          2. DONE: Implement Score labels
 *          3. DONE: Implement complete method
 *          4. DONE: Add checking of the rules: distance of ceeding
 *          5. Improve UX: visibility of actions, gathering sun, spending sun animation, etc.
 *          6. DONE: Implement busy state of a tree (a tree can do only one action per round)
 */ 

let app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});

const HEXAGON_HEIGHT = 216;
const HEXAGON_RADIUS = HEXAGON_HEIGHT / 2;
var index = 0;
const RICHNESS = {"LUSH": "LUSH", "OK": "OK", "POOR": "POOR"};
const MAP_RING_COUNT = 3;
var hexagonIndexCeeding = undefined;
var ceedingPlayerId = undefined;
var players = [];
const PLAYERS_NUMBER = 2;
const PLAYER_COLORS = {0: "red", 1: "blue"};
const ROUND_NUMBER = 24;
const CELLS_NUMBER = 37;
var currentRound = 1;
var nutrients = 20;
const COMPLETE_PRICE = 4;
var sunDirection = 0;

window.onload = function() {
    document.body.appendChild(app.view);

    // Get and draw the board
    prepareBoard();
    
    // Prepare players
    preparePlayers();
    
    applyShadow();
    collectSun();
    
    addDescription();
    renderNutrients();
    renderSunPoint();
    renderScorePoint();
    renderRounds();
    renderSun();
    addTreeDescription();
}

const clearShadow = function () {
    for (let index = 0; index < CELLS_NUMBER; index++) {
        let hexagon = getHexagonById(index);
        hexagon.shadowSize = 0;
        let shadow = hexagon.getChildByName('shadow')
        hexagon.removeChild(shadow);

        let sleep = hexagon.getChildByName('sleep');
        hexagon.removeChild(sleep);
        hexagon.sleep = undefined;
        //hexagon.tint = 0xFFFFFF;
    }
}

const applyShadow = function() {
    // Iterate all hexagon
    for (let index = 0; index < CELLS_NUMBER; index++) {
        let hexagon = getHexagonById(index);
        for (let distance = 1; distance <= hexagon.treeSize; distance++) {
            // Find coord
            let neighborCoord = hexagon.coord.neighbor(sunDirection, distance);
            let shadowedHexagon = getHexagonByCoord(neighborCoord);
            if (shadowedHexagon != undefined && shadowedHexagon.shadowSize < hexagon.treeSize) {
                shadowedHexagon.shadowSize = hexagon.treeSize;
                //shadowedHexagon.tint = 0xDDDDDD;
                //console.log('shadowed Hexagon: ', shadowedHexagon);

                addShadowToHexagon(shadowedHexagon);
            }
        }
    }
}

const addShadowToHexagon = function(hexagon) {
    let imageUrl = `../images/shadow-200.png`;

        shadowSprite = PIXI.Sprite.from(imageUrl);
        shadowSprite.anchor.set(0.5);
        shadowSprite.alpha = 0.35;

        shadowSprite.name = 'shadow';
        hexagon.addChild(shadowSprite);
}

const getHexagonByCoord = function(coord) {
    let hexagon = undefined;

    for (let index = 0; index < CELLS_NUMBER; index++) {
        let currentHexagon = getHexagonById(index);
        if (currentHexagon.coord.equals(coord)) {
            hexagon = currentHexagon;
            break;
        }
    }

    return hexagon;
}

const addDescription = function() {
    const player1Description = new PIXI.Text('Player 1', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xff1010,
        align: 'center',
    });
    player1Description.position = {x: 220, y: 180};
    app.stage.addChild(player1Description);

    const costTrees1 = new PIXI.Text('Prices', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0x101010,
        align: 'center',
    });
    costTrees1.position = {x: 220, y: 360};
    app.stage.addChild(costTrees1);

    const player2Description = new PIXI.Text('Player 2', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0x1010ff,
        align: 'center',
    });
    player2Description.position = {x: 2020, y: 180};
    app.stage.addChild(player2Description);

    const costTrees2 = new PIXI.Text('Prices', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0x101010,
        align: 'center',
    });
    costTrees2.position = {x: 2020, y: 360};
    app.stage.addChild(costTrees2);

    const nextButton = new PIXI.Text('NEXT ROUND', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0x101010,
        align: 'center',
    });
    nextButton.position = {x: 1020, y: 20};
    nextButton.onclick = nextRound;
    
    nextButton.eventMode = "static";
    nextButton.cursor = "pointer";
    
    app.stage.addChild(nextButton);


}

const renderNutrients = function() {
    let nutrientsLabel = app.stage.getChildByName('nutrients');
    if (nutrientsLabel == null) {
        nutrientsLabel = new PIXI.Text(`Nutrients: ${nutrients}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        nutrientsLabel.position = {x: 820, y: 20};
        nutrientsLabel.name = 'nutrients';
        app.stage.addChild(nutrientsLabel);
    }
    else {
        nutrientsLabel.text = `Nutrients: ${nutrients}`;
    }
}

const renderRounds = function() {
    let roundsLabel = app.stage.getChildByName('rounds');
    if (roundsLabel == null) {
        roundsLabel = new PIXI.Text(`Round: ${currentRound}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        roundsLabel.position = {x: 1320, y: 20};
        roundsLabel.name = 'rounds';
        app.stage.addChild(roundsLabel);
    }
    else {
        roundsLabel.text = `Round: ${currentRound}`;
    }
}

const renderSunPoint = function() {
    // Get player 1 Sun point sprite
    let player1SunPoint = app.stage.getChildByName('player1SunPoint');
    if (player1SunPoint == null) {
        player1SunPoint = new PIXI.Text(`Sun point: ${players[0].sun}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        player1SunPoint.position = {x: 220, y: 220};
        player1SunPoint.name = 'player1SunPoint';
        app.stage.addChild(player1SunPoint);
    }
    else {
        player1SunPoint.text = `Sun point: ${players[0].sun}`;
    }

    let player2SunPoint = app.stage.getChildByName('player2SunPoint');
    if (player2SunPoint == null) {
        player2SunPoint = new PIXI.Text(`Sun point: ${players[1].sun}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        player2SunPoint.position = {x: 2020, y: 220};
        player2SunPoint.name = 'player2SunPoint';
        app.stage.addChild(player2SunPoint);
    }
    else {
        player2SunPoint.text = `Sun point: ${players[1].sun}`;
    }

}

const getScoreByRichness = function(richness) {
    switch(richness) {
        case RICHNESS.OK:
            return 2;

        case RICHNESS.LUSH:
            return 4;
        
        case RICHNESS.POOR: 
        default:
            return 0;
    }
}

const renderScorePoint = function() {
    // Get player 1 Score point sprite
    let player1ScorePoint = app.stage.getChildByName('player1ScorePoint');
    if (player1ScorePoint == null) {
        player1ScorePoint = new PIXI.Text(`Score: ${players[0].score}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        player1ScorePoint.position = {x: 220, y: 250};
        player1ScorePoint.name = 'player1ScorePoint';
        app.stage.addChild(player1ScorePoint);
    }
    else {
        player1ScorePoint.text = `Score: ${players[0].score}`;
    }

    let player2ScorePoint = app.stage.getChildByName('player2ScorePoint');
    if (player2ScorePoint == null) {
        player2ScorePoint = new PIXI.Text(`Score: ${players[1].score}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x101010,
            align: 'center',
        });
        player2ScorePoint.position = {x: 2020, y: 250};
        player2ScorePoint.name = 'player2ScorePoint';
        app.stage.addChild(player2ScorePoint);
    }
    else {
        player2ScorePoint.text = `Score: ${players[1].score}`;
    }

}

const nextRound = function() {
    if (currentRound >= ROUND_NUMBER) {
        convertSunPointsToScore();
        // THE END
        // Ask a question about starting of a new game?
    }
    else {
        currentRound++;
        clearShadow();
        turnSunDirection();
        applyShadow();
        collectSun();
    }
    
    renderScorePoint();
    renderSunPoint();
    renderRounds();
}

const turnSunDirection = function() {
    sunDirection++;
    sunDirection %= 6;
    renderSun();
}

const renderSun = function() {
    let sunDirectionImage = app.stage.getChildByName('sunDirection');
    if (sunDirectionImage == null) {
        let imageUrl = `./images/sun-direction.png`;

        sunDirectionImage = PIXI.Sprite.from(imageUrl);
        sunDirectionImage.anchor.set(0.5);

        sunDirectionImage.position = {x: 620, y: 180};
        sunDirectionImage.name = 'sunDirection';
        app.stage.addChild(sunDirectionImage);
    }
    else {
        sunDirectionImage.rotation -= Math.PI / 3;
    }
}

const convertSunPointsToScore = function() {
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        let addScore = Math.floor(player.sun / 3);
        player.score += addScore;
        console.log('add score: ', addScore);
        player.sun %= 3;
    }
}

const collectSun = function() {
    for (let index = 0; index < CELLS_NUMBER; index++) {
        let hexagon = getHexagonById(index);
        let sunPoint = 0;
        
        //console.log('collect sun from hexagon: ', hexagon);

        if (hexagon.treeSize > hexagon.shadowSize) {
            switch(hexagon.treeSize) {
                case 1:
                    sunPoint = 1;
                    break;
    
                case 2:
                    sunPoint = 2;
                    break;
    
                case 3:
                    sunPoint = 3;
                    break;
    
                default:
                    continue; 
            }
    
            let player = players[hexagon.playerId];
            player.updateSun(player.sun + sunPoint);
        }
    }
}

const prepareBoard = function() {
    var board = GetBoard();
    for (let index = 0; index < board.Cells.length; index++) {
        const cell = board.Cells[index];
        let imageUrl = `./images/hexagon-${cell.richness}-200.png`;

        let hexagon = PIXI.Sprite.from(imageUrl);
        hexagon.anchor.set(0.5);

        var point = new Object();
        point = hexToScreen(cell.coord.x, cell.coord.z);
        hexagon.x = app.screen.width / 2 + point.x;
        hexagon.y = app.screen.height / 2 + point.y;
        hexagon.coord = cell.coord;

        hexagon.eventMode = "static";
        hexagon.cursor = "pointer";
        
        
        hexagon.onpointerdown = startCeed;
        hexagon.onpointerup = endCeed;
        hexagon.onclick = clickHexagon;
        
        hexagon.index = index;
        hexagon.richness = cell.richness;
        hexagon.shadowSize = 0;

        app.stage.addChild(hexagon);
    }
}

const preparePlayers = function() {
    for (let index = 0; index < PLAYERS_NUMBER; index++) {
        let player = new Player(index);
        players.push(player);
    }
    
    // TODO: Improve this code - use CubeCoord.getOpposite() method
    // Set default trees for players
    plantDefaultTree(36, 0);
    plantDefaultTree(33, 0);
    plantDefaultTree(27, 1);
    plantDefaultTree(24, 1);
}

const plantDefaultTree = function(index, playerIndex) {
    let hexagon = getHexagonById(index);
    hexagon.treeSize = 0;
    hexagon.playerId = playerIndex;
    grow(hexagon);
}

const clickHexagon = function(e) {
    if (e.target.sleep == undefined) {
        let treeSize = e.target.treeSize;
        switch (treeSize){
            case 0:
            case 1:
            case 2:
                growWithPrice(e.target);
                break;
    
            case 3:
                complete(e.target);
                break;
            
            default: break;
        }
    }
}

const growWithPrice = function(hexagon) {
    // Check that a player has sun points enough
    // Count current number of trees owned by the player
    let newTreeSize = hexagon.treeSize + 1;
    let treePrice = getTreePrice(hexagon.playerId, newTreeSize);
    let player = players[hexagon.playerId];
    let updatedSun = player.sun - treePrice;
    if (updatedSun >= 0) {
        // Subtract current sun points from the player
        player.updateSun(updatedSun);
        renderSunPoint();
    
        grow(hexagon);
        sleepTree(hexagon);
        addTreeDescription();
    }
}

const sleepTree = function(hexagon) {
    let sleepImageUrl = `./images/sleep.png`;
    let sleepSprite = PIXI.Sprite.from(sleepImageUrl);
    sleepSprite.anchor.set(0.5);
    sleepSprite.name = 'sleep';

    sleepSprite.x = 50;
    sleepSprite.y = -20;

    hexagon.addChild(sleepSprite);
    hexagon.sleep = true;
}

const grow = function(hexagon) {
    let currentTree = hexagon.getChildByName('tree');
    if (currentTree != null) {
        hexagon.removeChild(currentTree);
    }

    hexagon.treeSize++;
    
    let treeImageUrl = `./images/tree-${PLAYER_COLORS[hexagon.playerId]}-${hexagon.treeSize}.png`;
    let tree = PIXI.Sprite.from(treeImageUrl);
    tree.anchor.set(0.5);
    tree.name = 'tree';

    hexagon.addChild(tree);
}

const addTreeDescription = function() {
    for (let playerId = 0; playerId < players.length; playerId++) {
        for (let treeSize = 0; treeSize <= 3; treeSize++) {
            let treeImageUrl = `./images/tree-${PLAYER_COLORS[playerId]}-${treeSize}.png`;
            let tree = PIXI.Sprite.from(treeImageUrl);
            tree.anchor.set(0.5);
            
            tree.x = 240 + 1820 * playerId;
            tree.y = 400 + (treeSize + 1) * treeSize * 33;
        
            app.stage.addChild(tree);
        
            let treePriceLabel = app.stage.getChildByName(`treePriceLabel-${treeSize}-${playerId}`);
            if (treePriceLabel == null) {
                treePriceLabel = new PIXI.Text(`- ${getTreePrice(playerId, treeSize)}`, {
                    fontFamily: 'Arial',
                    fontSize: 24,
                    fill: 0x101010,
                    align: 'center',
                });
                treePriceLabel.position = {x: tree.x + 50, y: tree.y + 25};
                treePriceLabel.name = `treePriceLabel-${treeSize}-${playerId}`;
                app.stage.addChild(treePriceLabel);
            }
            else {
                treePriceLabel.text = `- ${getTreePrice(playerId, treeSize)}`;
            }
        }
    }
}

const getTreePrice = function (playerId, newTreeSize) {
    let treeCount = countTree(playerId, newTreeSize);

    let price = treeCount;
    switch(newTreeSize) {
        case 0: 
            // No addition
            break; 
        case 1:
            price += 1;
            break;

        case 2:
            price += 3;
            break;

        case 3:
            price += 7;
            break;

        default:
            throw new Error("Unexpected tree size value in calculation of growing tree price.");
    }

    return price;
}
const startCeed = function(e) {
    hexagonIndexCeeding = e.target.index;
    ceedingPlayerId = e.target.playerId;
}

const endCeed = function(e) {
    let initialHexagon = getHexagonById(hexagonIndexCeeding);
    let distance = getDistance(initialHexagon, e.target);
    if (initialHexagon.sleep == undefined &&
        distance > 0 && distance <= initialHexagon.treeSize &&
        e.target.treeSize == undefined) {
        // Check that a player has sun points enough
        // Count current number of ceeds owned by the player
        let ceedPrice = getTreePrice(ceedingPlayerId, 0);
        let player = players[ceedingPlayerId];
        let updatedSun = player.sun - ceedPrice;
        if (updatedSun >= 0) {
            // Subtract current sun points from the player
            player.updateSun(updatedSun);
            renderSunPoint();
            let ceed = PIXI.Sprite.from(`./images/tree-${PLAYER_COLORS[ceedingPlayerId]}-0.png`);
            ceed.anchor.set(0.5);
            ceed.name = 'tree';

            e.target.addChild(ceed);
            e.target.treeSize = 0;
            e.target.playerId = ceedingPlayerId;

            sleepTree(initialHexagon);
            sleepTree(e.target);
            addTreeDescription();            
        }
    }

    hexagonIndexCeeding = undefined;
    ceedingPlayerId = undefined;
}

// Find distance between two hexagons
const getDistance = function(hex1, hex2) {
    return (Math.abs(hex1.coord.x - hex2.coord.x) +
            Math.abs(hex1.coord.y - hex2.coord.y) +
            Math.abs(hex1.coord.z - hex2.coord.z)) / 2;
}

const countTree = function(playerId, treeLevel) {
    // Iterate all hexagons and count tree that owned by specified Id with specified tree level
    let count = 0;
    for (let index = 0; index < CELLS_NUMBER; index++) {
        let hexagon = getHexagonById(index);
        if (hexagon.treeSize == treeLevel && hexagon.playerId == playerId) {
            count++;
        }
    }

    return count;
}

const complete = function(hexagon) {
    let player = players[hexagon.playerId];
    let updatedSun = player.sun - COMPLETE_PRICE;
    if (updatedSun >= 0) {
        player.score += getScoreByRichness(hexagon.richness) + nutrients--;
        player.updateSun(updatedSun);
        renderSunPoint();
        renderScorePoint();
        renderNutrients();

        hexagon.removeChildren();
        hexagon.treeSize = undefined;
        hexagon.playerId = undefined;    
    }
}

const getHexagonById = function(index) {
    return app.stage.getChildAt(index);
}

const GetBoard = function() {
    var board = new Object();
    board.Cells = [];
    index = 0;
    var centre = new CubeCoord(0, 0, 0);

    generateCell(centre, RICHNESS.LUSH, board);

    var coord = centre.neighbor(0);

    for (let distance = 1; distance <= MAP_RING_COUNT; distance++) {
        for (let orientation = 0; orientation < 6; orientation++) {
            for (let count = 0; count < distance; count++) {
                var richness = getRichnessByDistance(distance);
                generateCell(coord, richness, board);
                coord = coord.neighbor((orientation + 2) % 6);
            }
        }
        coord = coord.neighbor(0);
    }
    
    return board;
}

const generateCell = function(coord, richness, board) {
    var cell = new Cell(index++, coord);
    cell.setRichness(richness);
    board.Cells.push(cell);
}

// q (x) , r (z)
const hexToScreen = function(q, r) {
    const x = HEXAGON_RADIUS * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = HEXAGON_RADIUS * 3 / 2 * r;
    return { x, y };
}

const getRichnessByDistance = function(distance)
{
    var richness = RICHNESS.LUSH;

    if (distance == MAP_RING_COUNT) 
    {
        richness = RICHNESS.POOR;
    }
    else if (distance == MAP_RING_COUNT - 1) 
    {
        richness = RICHNESS.OK;
    }
            
    return richness;        
}
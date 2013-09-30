ALIVE_CLASS = "alive";
DEAD_CLASS = "dead";
CELL_CLASS = "cell";

isAlive: function isAlive(viewObject) {
    return (viewObject.hasClass(ALIVE_CLASS));
}

rise: function rise(viewObject) {
    if (isAlive(viewObject)) return;
    viewObject.removeClass(this.DEAD_CLASS);
    viewObject.addClass(ALIVE_CLASS);
}

Cell: function Cell() {
    this.viewObject = $("<div></div>");
    this.viewObject.addClass(CELL_CLASS);
    this.viewObject.addClass(DEAD_CLASS);
}

Cell.prototype.getVisualRepresentation = function getVisualRepresentation() {
    return this.viewObject;
};

Cell.prototype.isAlive = function isAlive() {
    return (this.viewObject.hasClass(ALIVE_CLASS));
};

Cell.prototype.die = function die() {
    if (!this.isAlive()) return;
    this.viewObject.removeClass(ALIVE_CLASS);
    this.viewObject.addClass(DEAD_CLASS);
};


Cell.prototype.rise = function rise() {
    if (this.isAlive()) return;
    this.viewObject.removeClass(DEAD_CLASS);
    this.viewObject.addClass(ALIVE_CLASS);
};

Cell.prototype.initializeState = function initializeState() {
    var rand = Math.random();
    if (rand <= 0.5) {
        this.rise();
    } else {
        this.die();
    }
};

Cell.prototype.nextState = DEAD_CLASS;
Cell.prototype.initializeNextState = function getNextStep(neighborCells) {
    var aliveCount = 0;
    for (var i = 0; i < neighborCells.length; i++) {
        if (neighborCells[i].isAlive()) aliveCount++;
    }

    //console.log(aliveCount, neighborCells);
    if (aliveCount < 2) {
        // under-population
        this.nextState = DEAD_CLASS;
    } else if (aliveCount > 3) {
        // over-crowding
        this.nextState = DEAD_CLASS;
    } else if (aliveCount === 3) {
        // reproduction
        this.nextState = ALIVE_CLASS;
    } else {
        if (this.isAlive()) {
            this.nextState = ALIVE_CLASS;
        } else {
            this.nextState = DEAD_CLASS;
        }
    }
    //console.log(this.nextState);
}

Cell.prototype.step = function step() {
    if (this.nextState === DEAD_CLASS) {
        this.die();
    } else if (this.nextState == ALIVE_CLASS) {
        this.rise();
    }
}


GameArea: function GameArea(colCount, rowCount) {
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.visualObject = $("#game");
    this.cells = [];
    this.createCells();
}

GameArea.prototype.createCellColumn = function createCellColumn() {
    var col = [];
    var colRep = $("<div></div>");
    colRep.addClass("col");

    for (var i = 0; i < this.rowCount; i++) {
        var cell = new Cell();
        col.push(cell);
        colRep.append(cell.getVisualRepresentation());
    }

    this.cells.push(col);
    this.visualObject.append(colRep);
};

GameArea.prototype.stepInterval = 50;
GameArea.prototype.stepLoopId = null;
GameArea.prototype.running = false;
GameArea.prototype.play = function play() {
    if (this.stepLoopId === null) {
        this.stepLoopId = setInterval(this.step.bind(this), this.stepInterval);
        this.running = true;
    }
}
GameArea.prototype.stop = function stop() {
    if (this.stepLoopId === null) return;
    window.clearInterval(this.stepLoopId);
    this.stepLoopId = null;
    this.running = false;
}

GameArea.prototype.createCells = function createCells() {
    for (var i = 0; i < this.colCount; i++) {
        this.createCellColumn();
    }
}

GameArea.prototype.initializeCellStates = function initializeCellStates() {
    this.stop();
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].initializeState();
        }
    }
};

GameArea.prototype.getNeighborCells = function getNeighborCells(col, row) {
    /*console.log(col, row,
        [(col - 1 + this.colCount) % this.colCount, (row - 1 + this.rowCount) % this.rowCount],
        [(col - 1 + this.colCount) % this.colCount, (row) % this.rowCount],
        [(col - 1 + this.colCount) % this.colCount,(row + 1) % this.rowCount],

        [(col) % this.colCount,(row - 1 + this.rowCount) % this.rowCount],
        [(col) % this.colCount,(row + 1) % this.rowCount],

        [(col + 1) % this.colCount,(row - 1 + this.rowCount) % this.rowCount],
        [(col + 1) % this.colCount,(row) % this.rowCount],
        [(col + 1) % this.colCount,(row + 1) % this.rowCount]
    );   */

    return [
        this.cells[(col - 1 + this.colCount) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col - 1 + this.colCount) % this.colCount][(row) % this.rowCount],
        this.cells[(col - 1 + this.colCount) % this.colCount][(row + 1) % this.rowCount],

        this.cells[(col) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col) % this.colCount][(row + 1) % this.rowCount],

        this.cells[(col + 1) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col + 1) % this.colCount][(row) % this.rowCount],
        this.cells[(col + 1) % this.colCount][(row + 1) % this.rowCount]
    ];
}

GameArea.prototype.step = function step() {
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            var neighborCells = this.getNeighborCells(col, row);
            this.cells[col][row].initializeNextState(neighborCells);
        }
    }

    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].step();
        }
    }
}

GameArea.prototype.killCells = function killCells() {
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].die();
        }
    }
}

GameArea.prototype.clear = function clear() {
    this.stop();
    this.killCells();
}

$(document).ready(function() {
    var rowCount = 80;
    var colCount = 100;

    var gameArea = new GameArea(colCount, rowCount);
    var mouseDown = false;
    $("#game").mousedown(function() {
        mouseDown = true;
    });
    $(document).mouseup(function() {
        mouseDown = false;
    });

    $("#clear").click(gameArea.clear.bind(gameArea));
    $("#initialize").click(gameArea.initializeCellStates.bind(gameArea));
    $("#play").click(gameArea.play.bind(gameArea));
    $("#stop").click(gameArea.stop.bind(gameArea));

    $(".cell").hover(function() {
        if (mouseDown && !gameArea.running) {
            rise($(this));
        }
    });
    $(".cell").click(function() {
        rise($(this));
    })
});



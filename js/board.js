class Board {
    constructor() {
        this.CreateBoard();
        this.Homes = [new PieceHome(0, 10, 1), new PieceHome(1, 10, 10), new PieceHome(2, 1, 10), new PieceHome(3, 1, 1)];
        this.Turn = [0,1,2,3][Math.floor(Math.random() * 4)];
        this.Dice = new Dice(7, 7);
        this.GetOutTries = 0;
        this.Moved = null;
        this.CompletedPieces = [0, 0, 0, 0];
        this.Winner = -1;
        this.Particles = [];
        this.WinnerScreen = null;
        this.IsBot = [true, true, true, true];
        this.TeamsPieces = [];
        this.FoundTeamPieces = false;
        this.NextTurn();
    }

    NextTurn() {
        this.Dice.Rolled = false;
        this.GetOutTries = 0;
        this.Moved = null;
        while (true) {
            this.Turn++;
            if (this.Turn >= 4) {
                this.Turn = 0;
            }
            if (this.CompletedPieces[this.Turn] < 4) {
                break;
            }
            let stillPlayers = false;
            for (let i = 0; i < 4; i++) {
                if (this.CompletedPieces[i] < 4) {
                    stillPlayers = true;
                }
            }
            if (!stillPlayers) {
                break;
            }
        }
        this.FoundTeamPieces = false;
    }

    Update() {
        if (this.WinnerScreen === null && this.Winner !== -1) {
            this.WinnerScreen = new WinnerScreen(Game.GetColorName(this.Winner) + " vandt!", Game.ColorStringify(Game.GetColor(this.Winner)));
        }
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (this.Tiles[x][y] != null) {
                    this.Tiles[x][y].Update();
                }
            }
        }
        for (let i = 0; i < this.Homes.length; i++) {
            this.Homes[i].Update();
        }
        this.Dice.Update();
        if (Game.Board.Dice.DoneRolling()) {
            if (!this.FoundTeamPieces) {
                this.TeamsPieces = [];
                for (let i = 0; i < this.Homes[this.Turn].Pieces.length; i++) {
                    this.TeamsPieces.push(this.Homes[this.Turn].Pieces[i]);
                }
                for (let x = 0; x < 15; x++) {
                    for (let y = 0; y < 15; y++) {
                        if (this.Tiles[x][y] != null && this.Tiles[x][y].Type !== 5) {
                            for (let i = 0; i < this.Tiles[x][y].PiecesHere.length; i++) {
                                if (this.Tiles[x][y].PiecesHere[i].Team === this.Turn) {
                                    this.TeamsPieces.push(this.Tiles[x][y].PiecesHere[i]);
                                }
                            }
                        }
                    }
                }

                this.FoundTeamPieces = true;
                for (let i = 0; i < this.TeamsPieces.length; i++) {
                    if (!this.TeamsPieces[i].CanMove()) {
                        this.TeamsPieces.splice(i, 1);
                        i--;
                        continue;
                    }
                }

                if (this.TeamsPieces.length === 0) {
                    this.Moved = true;
                }
            }

            if (this.Homes[this.Turn].IsFull()) {
                this.GetOutTries++;
                if (!(this.Dice.Number == 6 || this.Dice.Number == 7)) {
                    if (this.GetOutTries < 3) {
                        this.Dice.Rolled = false;
                        this.FoundTeamPieces = false;
                    } else {
                        this.Moved = true;
                    }
                }
            }
            if (this.IsBot[this.Turn] && this.WinnerScreen === null && this.Moved === null) {
                if ((this.Dice.Number === 6 || this.Dice.Number === 7) && this.Homes[this.Turn].Pieces.length >= 1) {
                    this.Homes[this.Turn].Pieces[0].Move();
                } else if (!this.Homes[this.Turn].IsFull()) {
                    for (let i = 0; i < this.TeamsPieces.length && this.Moved === null; i++) {
                        let newLocation = this.TeamsPieces[i].CheckFuturePosition(this.Dice.Number);
                        let theTile = this.Tiles[newLocation.X][newLocation.Y];
                        if ((theTile.Type % 100 !== 1 || theTile.Type < 10 || Math.floor(theTile.Type / 100 - 1) === this.Turn) && theTile.PiecesHere.length < 2) {
                            for (let j = 0; j < theTile.PiecesHere.length; j++) {
                                if (theTile.PiecesHere[j].Team !== this.Turn) {
                                    this.TeamsPieces[i].Move();
                                    break;
                                }
                            }
                        }
                    }

                    let saveToMoveList = [];
                    for (let i = 0; i < this.TeamsPieces.length && this.Moved === null; i++) {
                        let newLocation = this.TeamsPieces[i].CheckFuturePosition(this.Dice.Number);
                        let theTile = this.Tiles[newLocation.X][newLocation.Y];
                        if (theTile.Type % 100 !== 1 || theTile.Type < 10) {
                            if (theTile.PiecesHere.length === 0) {
                                saveToMoveList.push(this.TeamsPieces[i]);
                            }
                            for (let j = 0; j < theTile.PiecesHere.length; j++) {
                                if (theTile.PiecesHere[j].Team === this.Turn) {
                                    saveToMoveList.push(this.TeamsPieces[i]);
                                    break;
                                }
                            }
                        }
                    }

                    if (saveToMoveList.length > 0) {
                        saveToMoveList[Math.floor(Math.random() * saveToMoveList.length)].Move();
                    }

                    if (this.Moved === null) {
                        this.TeamsPieces[Math.floor(Math.random() * this.TeamsPieces.length)].Move();
                    }
                }
            }
        } else if (this.IsBot[this.Turn] && !Game.Board.Dice.DoneRolling()) {
            this.Dice.Roll();
        }
        if (this.Moved !== null) {
            if (this.Moved instanceof Piece && (this.Moved.Moving != 0 || this.Moved.Moves != 0)) {
                return;
            }
            if (this.Dice.Number === 6) {
                this.Dice.Rolled = false;
                this.Moved = null;
                this.FoundTeamPieces = false;
                return;
            }
            this.NextTurn();
        }
        if (this.Winner !== -1) {
            this.Turn = this.Winner;
            this.Particles.push(new Particle(Game.ColorStringify(Game.WhitenColor(Game.GetColor(this.Winner), Math.random() * 0.5)), Math.floor(Math.random() * 1500)));
            for (let i = 0; i < this.Particles.length; i++) {
                if (this.Particles[i].Update()) {
                    this.Particles.splice(i, 1);
                    i--;
                }
            }
        }
        if (this.WinnerScreen !== null) {
            this.WinnerScreen.Update();
        }
    }

    Draw() {
        let pieceLocations = [];
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (this.Tiles[x][y] != null) {
                    this.Tiles[x][y].Draw(x, y);
                    if (this.Tiles[x][y].PiecesHere.length > 0) {
                        pieceLocations.push({ Tile: this.Tiles[x][y], X: x, Y: y });
                    }
                }
            }
        }

        Game.DrawOn.strokeStyle = Game.ColorStringify(Game.GetColor(this.Turn));
        Game.DrawOn.lineWidth = 10;
        Game.DrawOn.beginPath();
        Game.DrawOn.rect(0, 0, 750, 750);
        Game.DrawOn.stroke();

        for (let i = 0; i < pieceLocations.length; i++) {
            pieceLocations[i].Tile.DrawPieces(pieceLocations[i].X, pieceLocations[i].Y);
        }

        for (let i = 0; i < pieceLocations.length; i++) {
            pieceLocations[i].Tile.DrawMoves();
        }

        for (let i = 0; i < this.Homes.length; i++) {
            this.Homes[i].Draw();
        }

        this.Dice.Draw();

        for (let i = 0; i < this.Particles.length; i++) {
            this.Particles[i].Draw()
        }
        if (this.WinnerScreen !== null) {
            this.WinnerScreen.Draw();
        }
    }

    CreateBoard() {
        this.Tiles = [];
        for (let x = 0; x < 15; x++) {
            this.Tiles.push([]);
            for (let y = 0; y < 15; y++) {
                this.Tiles[x].push(null);
            }
        }
        this.Tiles[7][7] = new Tile(0, 1, "#000000");

        this.Tiles[6][0] = new Tile(0, 1, "#ffffff");
        this.Tiles[7][0] = new Tile(102, 1, "#ffffff");//Red enter
        this.Tiles[8][0] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][1] = new Tile(101, 2, "#ff0000");//Red spawn
        this.Tiles[8][2] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][3] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][4] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][5] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][6] = new Tile(2, 1, "#ffffff");//red to green corner
        this.Tiles[9][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[10][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[11][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[12][6] = new Tile(1, 1, "#dddddd");
        this.Tiles[13][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[14][6] = new Tile(0, 2, "#ffffff");
        this.Tiles[14][7] = new Tile(202, 2, "#ffffff");//Green enter
        this.Tiles[14][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[13][8] = new Tile(201, 3, "#00ff00");//Green spawn
        this.Tiles[12][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[11][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[10][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[9][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[8][8] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][8] = new Tile(2, 2, "#ffffff");//Green to Yellow corner
        this.Tiles[8][9] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][10] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][11] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][12] = new Tile(1, 2, "#dddddd");
        this.Tiles[8][13] = new Tile(0, 2, "#ffffff");
        this.Tiles[8][14] = new Tile(0, 3, "#ffffff");
        this.Tiles[7][14] = new Tile(302, 3, "#ffffff");//yellow enter
        this.Tiles[6][14] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][13] = new Tile(301, 0, "#ffff00");//yellow spawn
        this.Tiles[6][12] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][11] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][10] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][9] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][8] = new Tile(2, 3, "#ffffff");//yellow blue corner
        this.Tiles[5][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[4][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[3][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[2][8] = new Tile(1, 3, "#dddddd");
        this.Tiles[1][8] = new Tile(0, 3, "#ffffff");
        this.Tiles[0][8] = new Tile(0, 0, "#ffffff");
        this.Tiles[0][7] = new Tile(402, 0, "#ffffff");//blue enter
        this.Tiles[0][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[1][6] = new Tile(401, 1, "#00ffff");//blue spawn
        this.Tiles[2][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[3][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[4][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[5][6] = new Tile(0, 1, "#ffffff");
        this.Tiles[6][6] = new Tile(2, 0, "#ffffff");//blue and red corner
        this.Tiles[6][5] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][4] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][3] = new Tile(0, 0, "#ffffff");
        this.Tiles[6][2] = new Tile(1, 0, "#dddddd");
        this.Tiles[6][1] = new Tile(0, 0, "#ffffff");

        //Red end tiles
        this.Tiles[7][1] = new Tile(4, 2, "#ff0000");
        this.Tiles[7][2] = new Tile(4, 2, "#ff0000");
        this.Tiles[7][3] = new Tile(4, 2, "#ff0000");
        this.Tiles[7][4] = new Tile(4, 2, "#ff0000");
        this.Tiles[7][5] = new Tile(4, 2, "#ff0000");
        this.Tiles[7][6] = new Tile(5, 2, "#ff0000");

        //Green end tiles
        this.Tiles[13][7] = new Tile(4, 3, "#00ff00");
        this.Tiles[12][7] = new Tile(4, 3, "#00ff00");
        this.Tiles[11][7] = new Tile(4, 3, "#00ff00");
        this.Tiles[10][7] = new Tile(4, 3, "#00ff00");
        this.Tiles[9][7] = new Tile(4, 3, "#00ff00");
        this.Tiles[8][7] = new Tile(5, 3, "#00ff00");

        //Yellow end tiles
        this.Tiles[7][13] = new Tile(4, 0, "#ffff00");
        this.Tiles[7][12] = new Tile(4, 0, "#ffff00");
        this.Tiles[7][11] = new Tile(4, 0, "#ffff00");
        this.Tiles[7][10] = new Tile(4, 0, "#ffff00");
        this.Tiles[7][9] = new Tile(4, 0, "#ffff00");
        this.Tiles[7][8] = new Tile(5, 0, "#ffff00");

        //Blue end tiles
        this.Tiles[1][7] = new Tile(4, 1, "#00ffff");
        this.Tiles[2][7] = new Tile(4, 1, "#00ffff");
        this.Tiles[3][7] = new Tile(4, 1, "#00ffff");
        this.Tiles[4][7] = new Tile(4, 1, "#00ffff");
        this.Tiles[5][7] = new Tile(4, 1, "#00ffff");
        this.Tiles[6][7] = new Tile(5, 1, "#00ffff");
    }

    Click() {
        if (this.Winner === -1) {
            this.Dice.Click();
            for (let i = 0; i < this.Homes.length; i++) {
                this.Homes[i].Click();
            }
            for (let x = 0; x < 15; x++) {
                for (let y = 0; y < 15; y++) {
                    if (this.Tiles[x][y] != null) {
                        this.Tiles[x][y].Click();
                    }
                }
            }
        }
    }
}

class Tile {
    constructor(type, direction, color) {
        this.Type = type;
        this.Direction = direction;
        this.Color = color;
        this.PiecesHere = [];
    }

    Draw(x, y) {
        Game.DrawOn.fillStyle = this.Color;
        Game.DrawOn.strokeStyle = "#000000";
        Game.DrawOn.lineWidth = 4;
        Game.DrawOn.beginPath();
        Game.DrawOn.rect(x * 50, y * 50, 50, 50);
        Game.DrawOn.fill();
        Game.DrawOn.stroke();
        Game.DrawOn.beginPath();
        if (this.Type % 100 === 2) {
            Game.DrawOn.translate(x * 50 + 25, y * 50 + 25);
            Game.DrawOn.rotate(Math.PI / 4);
            Game.DrawOn.rect(-10, -10, 20, 20);
            Game.DrawOn.setTransform(1, 0, 0, 1, 0, 0);
        } else if (this.Type % 100 === 1) {
            Game.DrawOn.fillStyle = "#000000";
            Game.DrawOn.rect(x * 50 + 15, y * 50 + 15, 20, 20);
            Game.DrawOn.fill();
        } else if (this.Type === 5) {
            Game.DrawOn.rect(x * 50 + 10, y * 50 + 10, 30, 30);
        }
        Game.DrawOn.stroke();
    }

    Kill(killerTeam) {
        let otherPiecesHere = 0;
        for (let i = 0; i < this.PiecesHere.length; i++) {
            if (this.PiecesHere[i].Team != killerTeam) {
                otherPiecesHere++;
            }
        }
        if (this.Type % 100 == 1 && this.Type != 1 && otherPiecesHere >= 1) {
            for (let i = 0; i < this.PiecesHere.length; i++) {
                if (this.PiecesHere[i].Team === Math.floor(this.Type / 100) - 1) {
                    otherPiecesHere = 10;
                    break;
                }
            }
        }
        if (otherPiecesHere === 0) {
            return;
        }
        if ((otherPiecesHere == 1 && this.Type % 100 !== 1) || ((Math.floor(this.Type / 100) - 1 === killerTeam && this.Type % 100 === 1))) {
            for (let i = 0; i < this.PiecesHere.length; i++) {
                if (this.PiecesHere[i].Team != killerTeam) {
                    this.PiecesHere[i].Kick();
                    i--;
                }
            }
        } else {
            for (let i = 0; i < this.PiecesHere.length; i++) {
                if (this.PiecesHere[i].Team === killerTeam) {
                    this.PiecesHere[i].Kick();
                    i--;
                }
            }
        }
    }

    DrawPieces(x,y) {
        for (let i = 0; i < this.PiecesHere.length; i++) {
            this.PiecesHere[i].Draw();
        }
    }

    DrawMoves() {
        for (let i = 0; i < this.PiecesHere.length; i++) {
            this.PiecesHere[i].DrawMove();
        }
    }

    Click() {
        for (let i = 0; i < this.PiecesHere.length; i++) {
            this.PiecesHere[i].Click();
        }
    }

    Update() {
        for (let i = 0; i < this.PiecesHere.length; i++) {
            if (this.PiecesHere.length > 1) {
                this.PiecesHere[i].BaseSize = 0.5;
                switch (i) {
                    case 0:
                        this.PiecesHere[i].LerpXOffset = 12.5;
                        this.PiecesHere[i].LerpYOffset = 12.5;
                        break;
                    case 1:
                        this.PiecesHere[i].LerpXOffset = 12.5;
                        this.PiecesHere[i].LerpYOffset = -12.5;
                        break;
                    case 2:
                        this.PiecesHere[i].LerpXOffset = -12.5;
                        this.PiecesHere[i].LerpYOffset = 12.5;
                        break;
                    case 3:
                        this.PiecesHere[i].LerpXOffset = -12.5;
                        this.PiecesHere[i].LerpYOffset = -12.5;
                        break;
                }
            } else {
                this.PiecesHere[i].BaseSize = 1;
                this.PiecesHere[i].LerpXOffset = 0;
                this.PiecesHere[i].LerpYOffset = 0;
            }
        }
        for (let i = 0; i < this.PiecesHere.length; i++) {
            this.PiecesHere[i].Update();
        }
    }

    MovePiece(piece) {
        for (let i = 0; i < this.PiecesHere.length; i++) {
            if (piece === this.PiecesHere[i]) {
                this.PiecesHere.splice(i, 1);
                return;
            }
        }
    }
}

class Dice {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
        this.Number = 6;
        this.Rotation = 0;
        this.Rolling = 0;
        this.NextNumberChange = 0;
        this.Rolled = false;
    }

    Update() {
        if (this.Rolling > 0) {
            let slerpDone = Math.pow(this.Rolling / 2000, 2);
            this.Rotation += slerpDone * 0.2;
            this.Rolling = Math.max(this.Rolling - 40, 0);

            if (slerpDone > 0.2) {
                this.NextNumberChange -= slerpDone * 300;
            }
            if (this.NextNumberChange <= 0) {
                this.Number = Math.floor(Math.random() * 8) + 1;
                this.NextNumberChange += 500;
            }
        }
    }

    DoneRolling() {
        return (this.Rolled && this.Rolling == 0)
    }

    Draw() {
        Game.DrawOn.beginPath();
        Game.DrawOn.translate(this.X * 50 + 25, this.Y * 50 + 25);
        Game.DrawOn.rotate(this.Rotation * Math.PI);
        Game.DrawOn.fillStyle = "#ffffff";
        Game.DrawOn.strokeStyle = "#000000";
        Game.DrawOn.lineWidth = 4;
        Game.DrawOn.rect(-20, -20, 40, 40);
        Game.DrawOn.fill();
        Game.DrawOn.stroke();
        Game.DrawOn.fillStyle = "#000000";
        if (this.Number === 7 || this.Number === 8) {
            if (this.Number === 8) {
                Game.DrawOn.beginPath();
                Game.DrawOn.rotate(Math.PI / 4);
                Game.DrawOn.rect(-10, -10, 20, 20);
                Game.DrawOn.stroke();
            } else {
                Game.DrawOn.beginPath();
                Game.DrawOn.rect(-10, -10, 20, 20);
                Game.DrawOn.fill();
            }

        } else {
            if (this.Number % 2 == 1) {
                this.DrawDiceDot(0, 0);
            }
            if (this.Number >= 2) {
                this.DrawDiceDot(-10, -10);
                this.DrawDiceDot(10, 10);
            }
            if (this.Number >= 4) {
                this.DrawDiceDot(-10, 10);
                this.DrawDiceDot(10, -10);
            }
            if (this.Number == 6) {
                this.DrawDiceDot(10, 0);
                this.DrawDiceDot(-10, 0);
            }
        }
        Game.DrawOn.setTransform(1, 0, 0, 1, 0, 0);
    }

    DrawDiceDot(x,y) {
        Game.DrawOn.beginPath();
        Game.DrawOn.arc(x, y, 3, 0, Math.PI * 2);
        Game.DrawOn.fill();
    }

    Click() {
        if (Game.MouseX >= this.X * 50 + 5 && Game.MouseX <= this.X * 50 + 40
            && Game.MouseY >= this.Y * 50 + 5 && Game.MouseY <= this.Y * 50 + 40) {
            this.Roll();
        }
        //if (Game.MouseY <= 30) {
        //    this.Number = Math.floor(Game.MouseX / (750 / 8)) + 1;
        //    this.Rolled = true;
        //}
    }

    Roll() {
        if (!this.Rolled) {
            this.Rolling = 1500;
            this.Rolled = true;
        } //else if (this.Rolling > 500) {
        //    this.Rolling = 10;
        //    this.Number = Math.floor(Math.random() * 8) + 1;
        //}
    }
}

class PieceHome {
    constructor(team, x, y) {
        this.Pieces = [new Piece(team, x + 1, y + 1), new Piece(team, x + 2, y + 1), new Piece(team, x + 1, y + 2), new Piece(team, x + 2, y + 2)];
        this.Team = team;
        this.X = x;
        this.Y = y;
    }

    AddPiece(piece) {
        let places = [{ X: 1, Y: 1 }, { X: 1, Y: 2 }, { X: 2, Y: 1 }, { X: 2, Y: 2 }]
        for (let i = 0; i < this.Pieces.length; i++) {
            for (let j = 0; j < places.length; j++) {
                if ((this.Pieces[i].X - this.X == places[j].X && this.Pieces[i].Y - this.Y == places[j].Y) ||
                    (this.Pieces[i].NewX - this.X == places[j].X && this.Pieces[i].NewY - this.Y == places[j].Y)) {
                    places.splice(j, 1);
                    break;
                }
            }
        }
        this.Pieces.push(piece);
        piece.X = places[0].X + this.X;
        piece.Y = places[0].Y + this.Y;
    }

    Update() {
        for (let i = 0; i < this.Pieces.length; i++) {
            this.Pieces[i].Update();
        }
    }

    Draw() {
        Game.DrawOn.fillStyle = Game.ColorStringify(Game.GetColor(this.Team));;
        Game.DrawOn.strokeStyle = "#000000";
        Game.DrawOn.lineWidth = 4;
        Game.DrawOn.fillRect(this.X * 50, this.Y * 50, 200, 200);
        Game.DrawOn.strokeRect(this.X * 50, this.Y * 50, 200, 200);

        for (let i = 0; i < this.Pieces.length; i++) {
            this.Pieces[i].Draw();
            this.Pieces[i].DrawMove();
        }

    }

    Click() {
        for (let i = 0; i < this.Pieces.length; i++) {
            this.Pieces[i].Click();
        } 
    }

    IsFull() {
        return (this.Pieces.length == 4 - Game.Board.CompletedPieces[this.Team]);
    }

    MovePiece(piece) {
        for (let i = 0; i < this.Pieces.length; i++) {
            if (piece === this.Pieces[i]) {
                this.Pieces.splice(i, 1);
                return;
            }
        }
    }
}
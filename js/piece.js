class Piece {
    constructor(team,x,y) {
        this.Team = team;
        this.X = x;
        this.Y = y;
        this.Moves = 0;
        this.Hovered = false;
        this.Size = 1;
        this.LerpToSize = 1;
        this.Moving = 0;
        this.BaseSize = 1;
        this.NewX = 0;
        this.NewY = 0;
        this.MovingDirection = -1;
        this.LerpYOffset = 0;
        this.LerpXOffset = 0;
        this.XOffset = 0;
        this.YOffset = 0;
        this.XEnd = 0;
        this.YEnd = 0;
        this.MoveSpeed = 40;
    }

    Move(tiles) {
        this.Moves = tiles;
    }

    CanMove() {
        let isItTimeToMove = (Game.Board.Turn == this.Team && Game.Board.Moved === null && Game.Board.Dice.DoneRolling());
        let isDone = Game.Board.Tiles[this.X][this.Y] !== null && Game.Board.Tiles[this.X][this.Y].Type === 5;
        let isInside = Game.Board.Tiles[this.X][this.Y] === null;
        let canMoveOut = (Game.Board.Dice.Number === 6 || Game.Board.Dice.Number === 7);
        let isRunningHome = Game.Board.Tiles[this.X][this.Y] !== null && Game.Board.Tiles[this.X][this.Y].Type === 4;
        let canRunAtHome = Game.Board.Dice.Number < 7

        return (isItTimeToMove && !isDone && ((isInside && canMoveOut) || !isInside) && ((isRunningHome && canRunAtHome) || !isRunningHome)) 
    }

    Update() {
        if (this.CanMove()) {
            if (Game.MouseX >= this.X * 50 + this.XOffset + (50 - 45 * this.Size) / 2 && Game.MouseX <= this.X * 50 + this.XOffset + 40 * this.Size + (50 - 45 * this.Size) / 2
                && Game.MouseY >= this.Y * 50 + this.YOffset + (50 - 45 * this.Size) / 2 && Game.MouseY <= this.Y * 50 + this.YOffset + 40 * this.Size + (50 - 45 * this.Size) / 2) {
                if (!this.Hovered) {
                    this.CalcNextSpot();
                }
                this.Hovered = true;
                this.LerpToSize = 1.15;
            } else {
                this.Hovered = false;
                this.LerpToSize = 1;
            }
        } else {
            this.Hovered = false;
            this.LerpToSize = 1;
        }
        if (this.Size > this.LerpToSize * this.BaseSize) {
            this.Size = Math.max(this.Size - 0.1, this.LerpToSize * this.BaseSize);
        } else if (this.Size < this.LerpToSize * this.BaseSize) {
            this.Size = Math.min(this.Size + 0.1, this.LerpToSize * this.BaseSize);
        }
        if (this.XOffset > this.LerpXOffset) {
            this.XOffset = Math.max(this.XOffset - 4, this.LerpXOffset);
        } else if (this.XOffset < this.LerpXOffset) {
            this.XOffset = Math.min(this.XOffset + 4, this.LerpXOffset);
        }
        if (this.YOffset > this.LerpYOffset) {
            this.YOffset = Math.max(this.YOffset - 4, this.LerpYOffset);
        } else if (this.YOffset < this.LerpYOffset) {
            this.YOffset = Math.min(this.YOffset + 4, this.LerpYOffset);
        }

        if (this.Moves > 0 && this.Moving === 0) {
            if (Game.Board.Tiles[this.X][this.Y] === null) {
                for (let x = 0; x < 15; x++) {
                    for (let y = 0; y < 15; y++) {
                        if (Game.Board.Tiles[x][y] != null && Game.Board.Tiles[x][y].Type != 1 && Game.Board.Tiles[x][y].Type % 100 == 1 && Math.floor(Game.Board.Tiles[x][y].Type / 100 - 1) == this.Team) {
                            this.NewX = x;
                            this.NewY = y;
                            this.Moving = 1000;
                            this.MovingDirection = -1;
                            this.Moves = 0;
                        }
                    }
                }
            } else {
                this.Moves -= 1;
                this.Moving = 250;
                this.MovingDirection = this.GetMoveDirection(this.X, this.Y);
                Game.Board.Tiles[this.X][this.Y].MovePiece(this);
                let newPlace = Game.AddDirection(this.X, this.Y, this.MovingDirection);
                this.X = newPlace.X;
                this.Y = newPlace.Y;
                Game.Board.Tiles[this.X][this.Y].PiecesHere.push(this);
                if (Game.Board.Tiles[this.X][this.Y].Type === 5) {
                    this.Moves = 0;
                    Game.Board.CompletedPieces[this.Team]++;
                    if (Game.Board.CompletedPieces[this.Team] >= 4) {
                        Game.Board.Winner = this.Team;
                    }
                }
            }
        }

        if (this.Moving > 0) {
            this.Moving = Math.max(this.Moving - this.MoveSpeed, 0);
            if (this.MovingDirection <= -1) {
                this.Size = Math.max(this.Size - 0.2, 0);
                if (this.Size > 0) {
                    this.Moving = 100;
                }
                if (this.Moving === 0) {
                    this.X = this.NewX;
                    this.Y = this.NewY;
                    if (this.MovingDirection == -1) {
                        Game.Board.Tiles[this.X][this.Y].PiecesHere.push(this);
                        Game.Board.Homes[this.Team].MovePiece(this);
                    }
                }
            }
            if (this.Moving === 0 && this.Moves === 0 && Game.Board.Tiles[this.X][this.Y] !== null) {
                Game.Board.Tiles[this.X][this.Y].Kill(this.Team);
                if (this.Moving === 0 && Game.Board.Tiles[this.X][this.Y].Type % 100 === 2 && this.MoveSpeed === 40) {
                    this.Moves = 7;
                    this.MoveSpeed = 130;
                }
            }
        }
    }

    CheckFuturePosition(moves) {
        let findType = -1;
        if (moves >= 7) {
            findType = moves - 6;
        }
        if (Game.Board.Tiles[this.X][this.Y] === null) {
            for (let x = 0; x < 15; x++) {
                for (let y = 0; y < 15; y++) {
                    if (Game.Board.Tiles[x][y] != null && Game.Board.Tiles[x][y].Type != 1 && Game.Board.Tiles[x][y].Type % 100 == 1 && Math.floor(Game.Board.Tiles[x][y].Type / 100 - 1) == this.Team) {
                        return { X: x, Y: y, TotalMoves: 6 };
                    }
                }
            }
        }
        let x = this.X;
        let y = this.Y;
        let moveCounter = 0;
        for (let i = 0; i < moves && moveCounter < 64; i++) {
            let output = Game.AddDirection(x, y, this.GetMoveDirection(x, y));
            moveCounter++;
            x = output.X;
            y = output.Y;
            if (findType !== -1) {
                i--;
                if (Game.Board.Tiles[x][y].Type % 100 == findType) {
                    break;
                }
            }
        }

        return { X: x, Y: y, TotalMoves: (moveCounter >= 64 ? null : moveCounter) };
    }

    CalcNextSpot() {
        let nextSpot = this.CheckFuturePosition(Game.Board.Dice.Number);
        this.XEnd = nextSpot.X;
        this.YEnd = nextSpot.Y;
    }

    GetMoveDirection(x,y) {
        let movingDirection = Game.Board.Tiles[x][y].Direction;
        if (Math.floor(Game.Board.Tiles[x][y].Type / 100) - 1 === this.Team && Game.Board.Tiles[x][y].Type % 100 === 2) {
            movingDirection++;
            if (movingDirection >= 4) {
                movingDirection = 0;
            }
        }
        return movingDirection;
    }

    Draw() {
        let offsetX = 0;
        let offsetY = 0;
        if (this.Moving > 0) {
            switch (this.MovingDirection) {
                case 0:
                    offsetY = Math.floor(this.Moving / 250 * 50);
                    break;
                case 1:
                    offsetX = Math.floor(this.Moving / 250 * -50);
                    break;
                case 2:
                    offsetY = Math.floor(this.Moving / 250 * -50);
                    break;
                case 3:
                    offsetX = Math.floor(this.Moving / 250 * 50);
                    break;
            }
        }
        let color = Game.GetColor(this.Team);
        if (this.Hovered) {
            color = Game.WhitenColor(color, 0.5);
        }

        Game.DrawOn.fillStyle = Game.ColorStringify(color);
        Game.DrawOn.strokeStyle = "#000000";
        Game.DrawOn.lineWidth = 4;
        Game.DrawOn.beginPath();
        Game.DrawOn.arc(this.X * 50 + 25 + offsetX + this.XOffset, this.Y * 50 + 25 + offsetY + this.YOffset, 20 * this.Size, 0, Math.PI * 2);
        Game.DrawOn.fill();
        Game.DrawOn.stroke();
    }

    DrawMove() {
        if (this.Hovered) {
            Game.DrawOn.strokeStyle = "#000000";
            Game.DrawOn.moveTo(this.XEnd * 50 + 10, this.YEnd * 50 + 10);
            Game.DrawOn.lineTo(this.XEnd * 50 + 40, this.YEnd * 50 + 40);
            Game.DrawOn.moveTo(this.XEnd * 50 + 40, this.YEnd * 50 + 10);
            Game.DrawOn.lineTo(this.XEnd * 50 + 10, this.YEnd * 50 + 40);
            Game.DrawOn.stroke();
        }
    }

    Kick() {
        let oldX = this.X;
        let oldY = this.Y;
        Game.Board.Homes[this.Team].AddPiece(this);
        Game.Board.Tiles[oldX][oldY].MovePiece(this);
        this.NewX = this.X;
        this.NewY = this.Y;
        this.X = oldX;
        this.Y = oldY;

        this.Moving = 1000;
        this.MovingDirection = -2;
        this.BaseSize = 1;
        this.LerpXOffset = 0;
        this.LerpYOffset = 0;
        this.YOffset = 0;
        this.XOffset = 0;
        this.MoveSpeed = 40;
    }

    Click() {
        if (this.Hovered) {
            this.Move();
        }
    }

    Move() {
        if (Game.Board.Dice.Rolled) {
            this.MoveSpeed = 40;
            this.Moves = Game.Board.Dice.Number;
            if (Game.Board.Dice.Number >= 7) {
                this.MoveSpeed = 41;
                this.Moves = this.CheckFuturePosition(Game.Board.Dice.Number).TotalMoves;
                if (this.Moves === null) {
                    this.Moves = 0;
                } else if (Game.Board.Tiles[this.X][this.Y] === null && Game.Board.Dice.Number === 7) {
                    this.Moves = 6;
                }
            }
            Game.Board.Moved = this;
            this.LerpToSize = 1;
        }
    }
}
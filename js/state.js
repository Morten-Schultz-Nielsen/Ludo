class State {
    constructor(canvas) {
        this.Board = new Board();
        this.Canvas = canvas;
        this.DrawOn = this.Canvas.getContext("2d");
        this.MouseX = 0;
        this.MouseY = 0;
    }

    Click() {
        if (this.Board.Winner !== -1) {
            this.Board = new Board();
        }
        this.Board.Click();
    }

    Update() {
        this.Board.Update();
        this.Draw();
    }

    Draw() {
        Game.DrawOn.clearRect(0, 0, 750, 750);
        this.Board.Draw();
    }

    GetColor(teamID) {
        switch (teamID) {
            case 0:
                return [255,0,0];
            case 1:
                return [0,255,0];
            case 2:
                return [255,255,0];
            case 3:
                return [0,255,255];
        }
    }

    GetColorName(teamID) {
        switch (teamID) {
            case 0:
                return "Rød";
            case 1:
                return "Grøn";
            case 2:
                return "Gul";
            case 3:
                return "Blå";
        }
    }

    WhitenColor(color, whitenAmount) {
        let newColor = color.slice(0);
        for (let i = 0; i < 3; i++) {
            newColor[i] = newColor[i] + (255 - newColor[i]) * whitenAmount;
        }

        return newColor;
    }

    ColorStringify(color) {
        return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    }

    AddDirection(x, y, direction) {
        switch (direction) {
            case 0:
                return { X: x, Y: y - 1 };
            case 1:
                return { X: x + 1, Y: y };
            case 2:
                return { X: x, Y: y + 1 };
            case 3:
                return { X: x - 1, Y: y };
        }
    }
}
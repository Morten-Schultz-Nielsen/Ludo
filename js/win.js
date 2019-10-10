class Particle {
    constructor(color, x) {
        this.Color = color;
        this.X = x;
        this.Y = -30;
        this.Size = Math.floor(Math.random() * 10 + 5);
        this.Rotation = Math.random() * 360;
        this.RotationSpeed = Math.random() * 10 - 5;
        this.XMotion = Math.random() * 6 - 3;
        this.YMotion = Math.random() * 5 + 5;
    }

    Update() {

    }

    Update() {
        this.X += this.XMotion;
        this.Rotation += this.RotationSpeed;
        this.Y += this.YMotion;
        return (this.Y > 1700);
    }

    Draw() {
        Game.DrawOn.translate(Math.round(this.X), Math.round(this.Y));
        Game.DrawOn.rotate(Math.PI * 2 / 360 * this.Rotation);
        Game.DrawOn.fillStyle = this.Color;
        Game.DrawOn.fillRect(this.Size / -2, this.Size / -2, this.Size, this.Size);
        Game.DrawOn.setTransform(1, 0, 0, 1, 0, 0);
    }
}

class WinnerScreen {
    constructor(text, color) {
        this.Text = text;
        this.Color = color;
        this.Y = -100;
    }

    Update() {
        let percentDone = 1 - (this.Y + 100) / 475;
        this.Y = Math.min(this.Y + 15 * percentDone, 375);
    }

    Draw() {
        Game.DrawOn.font = "100px sans-serif";
        Game.DrawOn.textAlign = "center";
        Game.DrawOn.textBaseline = "middle";
        Game.DrawOn.fillStyle = this.Color;
        Game.DrawOn.strokeStyle = "#000000";
        Game.DrawOn.lineWidth = 3;
        Game.DrawOn.fillText(this.Text, 375, Math.round(this.Y));
        Game.DrawOn.strokeText(this.Text, 375, Math.round(this.Y));
    }
}
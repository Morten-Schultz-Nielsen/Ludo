var Game = new State(document.getElementById("canvas"));

function MouseMove(event) {
    let box = Game.Canvas.getBoundingClientRect();
    Game.MouseX = Math.floor((event.x - box.x) / box.width * 750);
    Game.MouseY = Math.floor((event.y - box.y) / box.height * 750);
}

function MouseClick() {
    Game.Click();
}

function Update() {
    Game.Update();
}

setInterval(Update, 40);
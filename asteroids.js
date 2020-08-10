"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    const playerStat = { score: 0, gameToken: "1" };
    const gameStat = { x_start: 300, y_start: 500, r_start: 0 };
    let x = gameStat.x_start;
    let y = gameStat.y_start;
    let r = gameStat.r_start;
    let g = new Elem(svg, 'g')
        .attr("transform", `translate(${x} ${y})`);
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("cx", x)
        .attr("cy", y)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:white;stroke:purple;stroke-width:1")
        .attr("r", 22);
    let ship_CollCir = new Elem(svg, 'circle')
        .attr("r", 20)
        .attr("style", "fill:none");
    let bigAsteroidPool = [];
    const mainInterval = Observable.interval(10);
    const endObservable = mainInterval.filter(() => playerStat.gameToken === "0");
    function updateScore() {
        const scoreboard = document.getElementById("score");
        scoreboard.innerHTML = `score ${playerStat.score += 10}`;
    }
    function getRandomBetween(x, y) {
        return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
    }
    function isCollision(bx, by, mx, my, r1, r2) {
        const distanceObj = Math.sqrt(Math.pow(bx - mx, 2) + Math.pow(by - my, 2));
        const distanceRad = r1 + r2;
        return distanceObj < distanceRad;
    }
    function outBound(e) {
        return (Number(e.attr("cx")) > 603 || Number(e.attr("cx")) < -3) || (Number(e.attr("cy")) > 603 || Number(e.attr("cy")) < -3);
    }
    function reloadgame() {
        g.attr("transform", "translate(300 500)");
    }
    function createBigAsteroid() {
        Observable.interval(0)
            .map(() => {
            const bigAsteroid = new Elem(svg, 'circle')
                .attr("style", "stroke:white;stroke-width:2")
                .attr("r", 45)
                .attr("cx", 0)
                .attr("cy", 0);
            bigAsteroidPool.push(bigAsteroid);
            return bigAsteroid;
        }).takeUntil(Observable.interval(5))
            .map(x => {
            let rock_X = -Math.floor(Math.random() * 100) + 1;
            let rock_Y = -Math.floor(Math.random() * 100) + 1;
            let r = getRandomBetween(0, 360) + 1;
            Observable.interval(30)
                .takeUntil(endObservable)
                .map(() => {
                rock_X += Math.floor(Math.random() * 1) + Math.sin((r / 180) * Math.PI) * 3 + 600,
                    rock_Y += Math.floor(Math.random() * 1) + Math.cos((r / 180) * Math.PI) * 3 + 600;
            })
                .subscribe(() => x.attr("cx", rock_X = rock_X % 600).attr("cy", rock_Y = rock_Y % 600));
        })
            .subscribe(() => { });
    }
    Observable.interval(2500).takeUntil(endObservable)
        .subscribe(() => createBigAsteroid());
    Observable.interval(0).takeUntil(endObservable)
        .map(() => {
        ship_CollCir.attr("cx", x);
        ship_CollCir.attr("cy", y);
    }).subscribe(() => { });
    mainInterval
        .takeUntil(endObservable)
        .map(() => Observable.fromArray(bigAsteroidPool)
        .filter(z => isCollision(Number(ship_CollCir.attr("cx")), Number(ship_CollCir.attr("cy")), Number(z.attr("cx")), Number(z.attr("cy")), Number(ship.attr("r")), Number(z.attr("r"))))
        .subscribe(() => {
        reloadgame();
        playerStat.gameToken = "0";
        const text = new Elem(svg, 'text');
        text.elem.textContent = "GAME OVER";
        text.attr("x", 150);
        text.attr("y", 300);
        text.attr("font-size", 50);
        text.attr("fill", "yellow");
    })).subscribe(() => { });
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    const keydown = Observable.fromEvent(document, "keydown");
    keydown
        .filter((e) => e.keyCode === 68 || e.keyCode === 39)
        .map(() => {
        let newX = (((transformMatrix(g).m41) + 600) % 600);
        let newY = ((transformMatrix(g).m42) % 600);
        g.attr("transform", `translate(${x = newX}  ${y = newY}) rotate(${r += 10})`);
        ship_CollCir.attr("cx", newX).attr("cy", newY);
    })
        .subscribe(() => console.log(g.attr("transform")));
    keydown
        .filter((e) => e.keyCode === 87 || e.keyCode === 38)
        .map(() => {
        let newX = (((transformMatrix(g).m41) + Math.sin(((180 - r) / 180) * Math.PI) * 10 + 600) % 600);
        let newY = (Math.abs((transformMatrix(g).m42) + Math.cos(((180 - r) / 180) * Math.PI) * 10 + 600) % 600);
        g.attr("transform", `translate(${x = newX} ${y = newY}) rotate(${r})`);
        ship_CollCir.attr("cx", newX).attr("cy", newY);
    })
        .subscribe(() => console.log(g.attr("transform")));
    keydown
        .filter((e) => e.keyCode === 65 || e.keyCode === 37)
        .map(() => {
        let newX = (((transformMatrix(g).m41) + 600) % 600);
        let newY = ((transformMatrix(g).m42) % 600);
        g.attr("transform", `translate(${x = newX} ${y = newY}) rotate(${r -= 10})`);
        ship_CollCir.attr("cx", newX).attr("cy", newY);
    })
        .subscribe(() => console.log(g.attr("transform")));
    keydown
        .filter((e) => e.keyCode === 32)
        .takeUntil(endObservable)
        .map(() => {
        let sx = x, sy = y, sr = r;
        const newBullet = new Elem(svg, 'circle')
            .attr("cx", sx)
            .attr("cy", sy)
            .attr("r", 3)
            .attr("style", "fill:white;stroke:white;stroke-width:2");
        Observable.interval(1)
            .takeUntil(mainInterval.filter(() => outBound(newBullet)))
            .subscribe(() => newBullet.attr("cx", sx += Math.sin(((180 - sr) / 180) * Math.PI) * 3)
            .attr("cy", sy += Math.cos(((180 - sr) / 180) * Math.PI) * 3));
        mainInterval
            .takeUntil(endObservable)
            .filter(() => outBound(newBullet))
            .subscribe(() => newBullet.elem.remove());
        Observable.interval(10)
            .takeUntil(endObservable || mainInterval.filter(() => bigAsteroidPool.length == 0))
            .map(() => {
            Observable.fromArray(bigAsteroidPool).takeUntil(endObservable)
                .filter(x => isCollision(Number(newBullet.attr("cx")), Number(newBullet.attr("cy")), Number(x.attr("cx")), Number(x.attr("cy")), Number(newBullet.attr("r")), Number(x.attr("r"))))
                .subscribe(x => {
                newBullet.elem.remove();
                x.elem.remove();
                bigAsteroidPool.splice(bigAsteroidPool.indexOf(x), 1);
                updateScore();
            });
        })
            .subscribe(() => { });
    })
        .subscribe(() => { });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map
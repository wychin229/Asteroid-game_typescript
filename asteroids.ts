// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  const playerStat = {score:0,gameToken:"1"}
  const gameStat = { x_start:300, y_start:500, r_start:0 }

  let x = gameStat.x_start // starting position for x
  let y = gameStat.y_start // starting position for y
  let r = gameStat.r_start // starting rotation angle
  let g = new Elem(svg,'g')
    .attr("transform",`translate(${x} ${y})`)  // the original place of the object
  
  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
    .attr("cx",x)
    .attr("cy",y)
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:white;stroke:purple;stroke-width:1")
    .attr("r",22)

  // a bounding circle that indicates the range of collision on the ship
  let ship_CollCir = new Elem(svg, 'circle')
    .attr("r",20)
    .attr("style","fill:none")
  
  // collection of bigAsteroid
  let bigAsteroidPool : Elem[] = []

  // a fixed interval that acts as a clock, got this idea from the shared senior's last semester assignment
  const mainInterval = Observable.interval(10) 
  // the observable that act as the end of game (gametoken will be changed to 0 when collision between ship and asteroid is detected.)
  const endObservable = mainInterval.filter(()=>playerStat.gameToken==="0")

  //-->below are functions
  // update the score of the scoreboard
  function updateScore(){
    const scoreboard = document.getElementById("score")!;
    scoreboard.innerHTML = `score ${playerStat.score+=10}`;
  }

  // functions that got from helper.ts of last sem's file to generate random number of range x up to y
  function getRandomBetween(x: number, y: number): number {
    return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
  }

  // check for collision between 2 objects (bullet/asteroid/ship)
  function isCollision(bx: number, by: number, mx: number, my: number,r1: number,r2:number): boolean {
    const distanceObj = Math.sqrt(Math.pow(bx-mx,2)+Math.pow(by-my,2))
    const distanceRad = r1+r2
    return distanceObj < distanceRad;
  }

  // check if object is out of bound (mainly used on bullet, so that the observables are stopped when the bullet is out of bound)
  function outBound(e:Elem){
    return (Number(e.attr("cx"))>603 || Number(e.attr("cx"))<-3)||(Number(e.attr("cy"))>603 || Number(e.attr("cy"))<-3);
  }

  // reload the game, return the ship to the starting position
  function reloadgame(){
    g.attr("transform","translate(300 500)")
  }
 
  // create asteroid and make move
  function createBigAsteroid(){
    Observable.interval(0)
    .map(()=>{
      const bigAsteroid = new Elem(svg,'circle')
      .attr("style","stroke:white;stroke-width:2")
      .attr("r",45)
      .attr("cx",0)
      .attr("cy",0)
      bigAsteroidPool.push(bigAsteroid)
      return bigAsteroid
    }).takeUntil(Observable.interval(5)) // first 5 miliseconds is to create asteroid as much as i can
    .map(x=>{
      let rock_X = -Math.floor(Math.random()*100)+1 
      let rock_Y = -Math.floor(Math.random()*100)+1
      let r = getRandomBetween(0,360)+1
      Observable.interval(30) // update the coordinate with a delay of 20
      .takeUntil(endObservable)
      .map(()=>{
        rock_X += Math.floor(Math.random()*1)+Math.sin((r/180)*Math.PI)*3+600,
        rock_Y += Math.floor(Math.random()*1)+Math.cos((r/180)*Math.PI)*3+600
      })
      .subscribe(()=>x.attr("cx",rock_X=rock_X%600).attr("cy",rock_Y=rock_Y%600))//`).attr("rock_X",rock_X).attr("rock_Y",rock_Y));
    })
    .subscribe(()=> {});
  }
  
  //create and animate new asteroid every 2.5 second
  Observable.interval(2500).takeUntil(endObservable)
  .subscribe(()=>createBigAsteroid());

  // update the bounding circle of the ship
  Observable.interval(0).takeUntil(endObservable)
  .map(()=>{
    ship_CollCir.attr("cx",x)
    ship_CollCir.attr("cy",y)
  }).subscribe(()=>{});

  //check for collision of ship and asteroid
  mainInterval
  .takeUntil(endObservable)
  .map(()=>
  Observable.fromArray(bigAsteroidPool) 
    .filter(z=>isCollision(Number(ship_CollCir.attr("cx")),Number(ship_CollCir.attr("cy")),Number(z.attr("cx")),Number(z.attr("cy")),Number(ship.attr("r")),Number(z.attr("r"))))
    .subscribe(()=>{
      reloadgame();
      playerStat.gameToken = "0";
      // show GAME OVER message
      const text = new Elem(svg,'text')
      text.elem.textContent = "GAME OVER"
      text.attr("x",150)
      text.attr("y",300)
      text.attr("font-size",50)
      text.attr("fill","yellow")
    })
  ).subscribe(()=>{})

  // compute the position of ship (hints given by tutor)
  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)

  // key movement
  const keydown = Observable.fromEvent<KeyboardEvent>(document, "keydown")
  keydown// A or left arrow to move left
  .filter((e: 
    KeyboardEvent) => e.keyCode === 68|| e.keyCode === 39)
  .map(()=>{
    let newX = (((transformMatrix(g).m41)+600)%600)
    let newY = ((transformMatrix(g).m42)%600)
    g.attr("transform",`translate(${x=newX}  ${y=newY}) rotate(${r+=10})`);
    ship_CollCir.attr("cx",newX).attr("cy",newY);
  })
  .subscribe(() => console.log(g.attr("transform")));

  // W or up arrow to move upwards
  keydown
  .filter((e: KeyboardEvent) => e.keyCode === 87 || e.keyCode === 38)
  .map(()=>{
    let newX = (((transformMatrix(g).m41)+Math.sin(((180-r)/180)*Math.PI)*10+600)%600)
    let newY = (Math.abs((transformMatrix(g).m42)+Math.cos(((180-r)/180)*Math.PI)*10+600)%600)
    g.attr("transform",`translate(${x=newX} ${y=newY}) rotate(${r})`);
    ship_CollCir.attr("cx",newX).attr("cy",newY);
  })
  .subscribe(() => console.log(g.attr("transform")));

  // D or down arrow to move right
  keydown
  .filter((e: KeyboardEvent) => e.keyCode === 65|| e.keyCode === 37)
  .map(()=>{
    let newX = (((transformMatrix(g).m41)+600)%600)
    let newY = ((transformMatrix(g).m42)%600)
    g.attr("transform",`translate(${x=newX} ${y=newY}) rotate(${r-=10})`);
    ship_CollCir.attr("cx",newX).attr("cy",newY);
  })
  .subscribe(() => console.log(g.attr("transform")));
  
  // space to shoot
  keydown
  .filter((e: KeyboardEvent) => e.keyCode === 32)
  .takeUntil(endObservable)
  .map(()=>{
    // make new bullet object
    let sx:number = x, sy:number = y, sr:number = r
    const newBullet = new Elem(svg, 'circle')
      .attr("cx",sx)
      .attr("cy",sy)
      .attr("r", 3)
      .attr("style", "fill:white;stroke:white;stroke-width:2")

    Observable.interval(1) //  update the attr of bullet with the delay of 1 miliseconds
    .takeUntil(mainInterval.filter(()=>outBound(newBullet)))
    .subscribe(()=>newBullet.attr("cx",sx+=Math.sin(((180-sr)/180)*Math.PI)*3)
    .attr("cy",sy+=Math.cos(((180-sr)/180)*Math.PI)*3));

    mainInterval // check if bullet exceed the boundary
    .takeUntil(endObservable)
    .filter(()=>outBound(newBullet))
    .subscribe(()=>newBullet.elem.remove());
    
    Observable.interval(10) // check if bullet collide with the asteroid
    .takeUntil(endObservable||mainInterval.filter(()=>bigAsteroidPool.length == 0))
    .map(()=>{
      Observable.fromArray(bigAsteroidPool).takeUntil(endObservable)
        .filter(x=>isCollision(Number(newBullet.attr("cx")),Number(newBullet.attr("cy")),Number(x.attr("cx")),Number(x.attr("cy")),Number(newBullet.attr("r")),Number(x.attr("r"))))
        .subscribe(x=>{
          newBullet.elem.remove(); // remove bullet from canvas
          x.elem.remove(); // remove bullet from canvas
          bigAsteroidPool.splice(bigAsteroidPool.indexOf(x),1); // remove the asteroid from array
          updateScore(); // update the score
        });
    })
    .subscribe(()=>{});
  })
  .subscribe(()=>{});
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }
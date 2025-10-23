  const screen = document.getElementById("screen");
  const bar = document.getElementById("bar");
  const preview = document.getElementById("preview");
  const tiltAngleDisplay = document.querySelector(".tiltAngle");
  const leftWeightDisplay = document.querySelector(".leftWeight");
  const rightWeightDisplay = document.querySelector(".rightWeight");
  const nextWeightDisplay = document.querySelector(".nextWeight");

  let randomColor = getRandomColor();
  let nextWeight = randomWeight();
  nextWeightDisplay.textContent = `${nextWeight} kg`;
  updatePreview(nextWeight);
  let objects = [];

  function randomWeight(){
    return (Math.floor(Math.random() * 10) + 1);

  }

  function updatePreview(weight) {
    const size = 30 + weight * 3;
    preview.style.height = `${size}px`;
    preview.style.width = `${size}px`;
    preview.textContent = weight + "kg";
  }

  screen.addEventListener("pointermove", (e) => {
    const barRect = bar.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    const isOverBarY =
      e.clientY >= barRect.top - 40 && e.clientY <= barRect.bottom + 40;


    const isOverBarX = e.clientX >= barRect.left && e.clientX <= barRect.right;


    if (!isOverBarY || !isOverBarX) {
      preview.style.opacity = 0;
      return;
    }


    targetX = e.clientX - screenRect.left - 20;
    const y = bar.offsetTop + bar.offsetHeight / 2 + 200;
    preview.style.left = `${targetX}px`;
    preview.style.top = `${y}px`;
    preview.style.opacity = 0.9;
  });

  screen.addEventListener("click", (e) => {
    const barRect = bar.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    const isOverBar =
      e.clientY >= barRect.top - 40 && e.clientY <= barRect.bottom + 40;
    if (!isOverBar) return;


    if (e.clientX < barRect.left || e.clientX > barRect.right) return;

    const object = document.createElement("div");
    object.classList.add("object");

    const size = 30 + nextWeight * 3;
    object.style.width = `${size}px`;
    object.style.height = `${size}px`;
    object.style.backgroundColor = randomColor;
    object.style.position = "absolute";
    object.style.borderRadius = "50%";
    object.style.display = "flex";
    object.style.justifyContent = "center";
    object.style.alignItems = "center";
    object.style.color = "white";
    object.style.fontWeight = "bold";
    object.textContent = nextWeight + "kg";


    const centerX = barRect.left + barRect.width / 2;
    const relativeX = e.clientX - centerX;
    const offsetX = relativeX + bar.offsetWidth / 2 - size / 2;
    const offsetY = bar.offsetHeight / 2 - size / 2;

    object.style.left = `${offsetX}px`;
    object.style.top = `${offsetY}px`;


    bar.appendChild(object);
    playSound("drop");

    objects.push({
      element: object,
      weight: nextWeight,
      distance: relativeX,
    });
   
    addLastAction(nextWeight, relativeX);
    nextWeight = randomWeight();
    randomColor = getRandomColor();
    updatePreview(nextWeight);
    nextWeightDisplay.textContent = `${nextWeight.toFixed(2)} kg`;

    calculateAngle();

   
  });

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function setRandomColor(element) {
    element.style.backgroundColor = getRandomColor();
  }

  function calculateAngle() {
    
    if (objects.length === 0) return;

    let rightMoment = 0;
    let rightWeight = 0;
    let leftWeight = 0;
    let leftMoment = 0;

    objects.forEach((obj) => {
      const barRect = bar.getBoundingClientRect();
      const objRect = obj.element.getBoundingClientRect();
      const distanceFromCenter = objRect.left + objRect.width / 2 - (barRect.left + barRect.width / 2);
  

      if (distanceFromCenter > 0) {
        rightMoment += distanceFromCenter * obj.weight;
        rightWeight += obj.weight;
      } else {
        leftMoment += Math.abs(distanceFromCenter) * obj.weight;
        leftWeight += obj.weight;
      }
    });

    const totalMoment = rightMoment - leftMoment;
    let tilt = totalMoment / 40; 

    tilt = Math.max(Math.min(tilt, 30), -30); 


    bar.style.transform = `rotate(${tilt}deg)`;
    tiltAngleDisplay.textContent = ` ${tilt.toFixed(2)}°`;
    leftWeightDisplay.textContent = ` ${leftWeight.toFixed(2)} kg`;
    rightWeightDisplay.textContent = ` ${rightWeight.toFixed(2)} kg`;

  } 

  function addLastAction(weight, distance){
    const lastActionList = document.getElementById("lastActionsList");

    const lastItem = document.createElement("div");
    lastItem.classList.add("last-item")
    
    const side = distance > 0 ? "right" : "left";
    const pxDistance =Math.round( Math.abs(distance));
    lastActionList.prepend(lastItem);
    lastItem.textContent = `${weight} kg dropped on the ${side} side at ${pxDistance}px from the center`;
  }

  document.getElementById("resetButton").addEventListener("click", reset);

  function reset(){

    bar.style.transform = "rotate(0deg)"
      
    bar.style.transition = "transform 0.4s ease";
    
    setTimeout(() => (bar.style.transition = ""), 500);

    playSound("reset");
    objects.forEach(object=>object.element.remove());
    objects = [];

    leftWeightDisplay.textContent= "0.0 kg";
    rightWeightDisplay.textContent = "0.0kg";
    tiltAngleDisplay.textContent = " 0.0°"
    const lastActionList = document.getElementById("lastActionsList");
    lastActionList.innerHTML = " ";

    nextWeight = randomWeight();
    randomColor = getRandomColor();
    updatePreview(nextWeight);
    nextWeightDisplay.textContent = `${nextWeight} kg`;
  }

  function playSound(soundName){
    const sound = new Audio(`sounds/${soundName}.mp3`);
    sound.volume = 0.5;
    sound.play();
  }
  

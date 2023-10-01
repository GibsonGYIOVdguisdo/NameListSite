const reader1 = new FileReader();
const reader2 = new FileReader();
const uploadButton = document.getElementById("addToListButton");
const fileInput = document.getElementById("fileUpload");
const nameInput = document.getElementById("nameInput");
const addNameButton = document.getElementById("nameConfirm");
const nameArea = document.getElementById("nameArea");
const downloadButton = document.getElementById("downloadA");
const openButton = document.getElementById("openToListButton");
const randomNameButton = document.getElementById("randomNameButton");
const lastRandomNameText = document.getElementById("chosenRandomName");
const previousRandomNameDiv = document.getElementById("lastRandomNames");
let nameCount = 0;
let allPupils = {};

randomNameButton.onclick = () =>{
    let pupilCount = Object.keys(allPupils).length;
    let randomPupil = Object.values(allPupils)[Math.floor(Math.random()*pupilCount)];
    if(randomPupil != undefined){
        lastRandomNameText.innerHTML = randomPupil;
        let tempPar = document.createElement("p");
        tempPar.innerHTML = randomPupil;
        previousRandomNameDiv.prepend(tempPar);
    }
}


uploadButton.onclick = () => {
    if (fileInput.files[0] != undefined){
        reader1.readAsText(fileInput.files[0]);
    }
}

function saveToTextFile(textAsArray){
    let textFile = new Blob(textAsArray);
    return(textFile);
}

function getPupilArray(allPupils){
    let returnArray = [];
    for(let pupilName of Object.values(allPupils)){
        returnArray.push(pupilName+"\n");
    }
    returnArray[returnArray.length-1] = returnArray[returnArray.length-1].replace("\n","");
    return(returnArray);
}

function getPupilTXT(allPupils){
    return(saveToTextFile(getPupilArray(allPupils)));
}

function updateDownloadButton(){
    downloadButton.href = URL.createObjectURL(getPupilTXT(allPupils));
    downloadButton.download = "pupils.txt"
}

function addPupilName(pupilName){
    allPupils["pupil"+nameCount] = pupilName;
    let tempDiv = document.createElement("div");
    let tempPar = document.createElement("p");
    let tempBut = document.createElement("button");
    tempPar.innerHTML = pupilName;
    tempBut.innerHTML = "remove";
    tempBut.className = "pupilRemoveButton";
    tempPar.className = "pupilName";
    tempDiv.appendChild(tempPar);
    tempDiv.appendChild(tempBut);
    tempDiv.className = "pupilDiv";
    nameArea.appendChild(tempDiv);
    tempBut.id = "pupil"+nameCount;
    tempBut.onclick = () => {
        delete allPupils[tempBut.id];
        tempDiv.remove();
        updateDownloadButton();
    }
    nameCount += 1;
    updateDownloadButton();
}


function addNameViaInputField(){
    if (nameInput.value){
        addPupilName(nameInput.value);
    }
    nameInput.value = "";
}
nameInput.addEventListener("keyup", (event) => {
    if(event.key == "Enter"){
        addNameViaInputField();
    }
})


addNameButton.onclick = addNameViaInputField;

openButton.onclick = () =>{
    reader2.readAsText(fileInput.files[0]);

}
reader1.onload = (result) =>{
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilName(pupil);
    }
}
reader2.onload = (result) =>{
    allPupils = {};
    nameArea.innerHTML="";
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilName(pupil);
    }
}


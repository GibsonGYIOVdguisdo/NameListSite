console.log("Loaded");

const reader = new FileReader();
const uploadButton = document.getElementById("fileConfirm");
const fileInput = document.getElementById("fileUpload");
const nameInput = document.getElementById("nameInput");
const addNameButton = document.getElementById("nameConfirm");
const nameArea = document.getElementById("nameArea");
const downloadButton = document.getElementById("downloadA");

let nameCount = 0;
let allPupils = {};
uploadButton.onclick = () => {
    console.log("File read");
    if (fileInput.files[0] != undefined){
        reader.readAsText(fileInput.files[0]);
    }
}

function saveToTextFile(textAsArray){
    let textFile = new Blob(textAsArray);
    return(textFile);
}

function getPupilArray(allPupils){
    let returnArray = [];
    for(const [uid,pupilName] of Object.entries(allPupils)){
        console.log("ss: "+uid);
        console.log("ee: "+pupilName);
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
    tempPar.className = "pupilName";
    tempDiv.appendChild(tempPar);
    tempDiv.appendChild(tempBut);
    nameArea.appendChild(tempDiv);
    tempBut.id = "pupil"+nameCount;
    tempBut.onclick = () => {
        delete allPupils[tempBut.id];
        console.log(tempBut.id);
        console.log(allPupils);
        tempDiv.remove();
        updateDownloadButton();
    }
    nameCount += 1;
    updateDownloadButton();
}

addNameButton.onclick = () => {
    if (nameInput.value){
        addPupilName(nameInput.value);
    }
}


reader.onload = (result) =>{
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilName(pupil);
    }
}
saveToTextFile(["11","22"]);


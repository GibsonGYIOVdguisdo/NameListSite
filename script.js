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
const classNameDiv = document.getElementById("classListDiv");
const newClassButton = document.getElementById("NewClassButton");
const currentClassText = document.getElementById("CurrentClassDisplay");
let currentClass = "";
let nameCount = 0;
let allPupils = {};
let allClasses = {};

loadFromLocalStorage();
newClassButton.setAttribute("onclick","promptForNewClass('What should the class be called?')");


function promptForNewClass(promptMessage){
    newClassName = prompt(promptMessage);
    while(newClassName in allClasses){
        newClassName = prompt(promptMessage);
    }
    if(newClassName.replaceAll(" ","") !== ""){
        allClasses[newClassName] = {};
        allClasses[newClassName]["currentId"] = 0;
        allClasses[newClassName]["pupilList"] = {};
        currentClass = newClassName;
        addClassToPage(newClassName);
        openClassToPage(newClassName);
    }
}


randomNameButton.onclick = () =>{
    let pupilCount = getPupilArrayFromClass(currentClass).length;
    let randomPupil = getPupilArrayFromClass(currentClass)[Math.floor(Math.random()*pupilCount)];
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

function saveNameListsToLocalStorage(){
    let textToSave = JSON.stringify(allClasses);
    localStorage.setItem("classObject",textToSave);
}

function loadFromLocalStorage(){
    allClasses = JSON.parse(localStorage.getItem("classObject"));
    for(let className of Object.keys(allClasses)){
        addClassToPage(className);
    }
    openClassToPage(Object.keys(allClasses)[0]);

}

function getPupilTXT(allPupils){
    let pupilArrayPrepared = [];
    for(let index = 0; allPupils.length-1>index; index++){
        pupilArrayPrepared.push(allPupils[index]+"\n");
    }
    pupilArrayPrepared.push(allPupils[allPupils.length-1]);
    return(saveToTextFile(pupilArrayPrepared));
}

function updateDownloadButton(){
    downloadButton.href = URL.createObjectURL(getPupilTXT(getPupilArrayFromClass(currentClass)));
    downloadButton.download = "pupils.txt"
}


function openClassToPage(className){
    nameArea.innerHTML = "";
    pupilObject = getPupilObjectFromClass(className)
    currentClass = className;
    for(let [key, value] of Object.entries(pupilObject)){
        addPupilToSite(className, value, key);
    }
    currentClassText.innerHTML = className;
}

function addPupilMain(className, pupilName){
    if(pupilName.replaceAll(" ","") !== "" && className){
        addPupilToClass(className, pupilName);
        let currentId = allClasses[className]["currentId"];
        addPupilToSite(className,pupilName,"pupil"+currentId);
        saveNameListsToLocalStorage();
    }
}

function addPupilToSite(className, pupilName, pupilID){
    let pupilButton = addPupilToSiteWithoutDeletion(pupilName,pupilID);
    pupilButton.onclick = () =>{
        removePupilFromClassByID(className, pupilID);
        pupilButton.parentNode.remove();
        updateDownloadButton();
    }
}

function addPupilToSiteWithoutDeletion(pupilName, pupilID){ 
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
    tempBut.id = pupilID;
    updateDownloadButton();
    return(tempBut);
}

function addClassToPage(className){
    let tempBut = document.createElement("button");
    tempBut.innerHTML = className;
    tempBut.className = "classButton";
    tempBut.onclick = () => {
        openClassToPage(className);
    }
    classNameDiv.appendChild(tempBut);
    saveNameListsToLocalStorage();
}

function addPupilToClass(className, pupilName){
    if(className in allClasses){
        allClasses[className]["currentId"] += 1;
        currentPupilId = allClasses[className]["currentId"];
        allClasses[className]["pupilList"]["pupil"+currentPupilId] = pupilName;
    }
    else{
        allClasses[className] = {};
        allClasses[className]["currentId"] = 1;
        allClasses[className]["pupilList"] = {};
        currentPupilId = allClasses[className]["currentId"];    
        allClasses[className]["pupilList"]["pupil"+currentPupilId] = pupilName;
        addClassToPage(className);
    }
}

function removePupilFromClassByID(className, pupilID){
    if(className in allClasses){
        delete allClasses[className]["pupilList"][pupilID];
    }
}

function getPupilArrayFromClass(className){
    return(Object.values(allClasses[className]["pupilList"]));
}

function getPupilObjectFromClass(className){
    return(allClasses[className]["pupilList"]);
}


function addNameViaInputField(){
    if (nameInput.value){
        addPupilMain(currentClass, nameInput.value);
    }
    nameInput.value = "";
}
nameInput.addEventListener("keydown", (event) => {
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
        addPupilMain(currentClass, pupil);
    }
}
reader2.onload = (result) =>{
    allClasses[currentClass]["pupilList"] = {};
    nameArea.innerHTML="";
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilMain(currentClass, pupil);
    }
}


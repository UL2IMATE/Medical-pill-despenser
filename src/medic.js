// Import the functions you need from the SDKs you need
import { initializeApp } from  "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfFfJyM9jYd4FlNwHSt6pyqZFR87zAxpQ",
  authDomain: "crud-cb6fb.firebaseapp.com",
  databaseURL: "https://crud-cb6fb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crud-cb6fb",
  storageBucket: "crud-cb6fb.firebasestorage.app",
  messagingSenderId: "845920708480",
  appId: "1:845920708480:web:3eafe4605da974ce188365",
  measurementId: "G-7XMMBE9T8P"
};
 import {
        getDatabase,
        ref,
        set,
        get,
        push, 
        onValue,
        update
      } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let cup1 = {};
let cup2 = {};
let cup3 = {};
let cup4 = {};

let cup = [cup1,cup2,cup3,cup4]
 

function cupsInfo()
{
    
    for(let i = 0;i<4;i++)
    {
        let userRef = ref(db, `schedule/cup${i+1}`)
        onValue(userRef, (snapshot)=>{
            if (snapshot.exists())
            {
               
                const data = snapshot.val()
                Object.assign(cup[i],{
                    pills: data.pills,
                    hours: data.hour,
                    Medication:data.Medication
                })
              
             
                
            //    }
                
              
            }
        })
    }
}
cupsInfo()


const currentDate = document.getElementById("date")


function SetDate(Datte) 
{
  const date = new Date();
  let mon = ""
  switch(date.getMonth()+1)
  {
    case 1:mon = "Jan"
    break;
    case 2:mon = "Feb"
    break;
    case 3:mon = "Mar"
    break;
    case 4:mon = "Apr"
    break;
    case 5:mon = "May"
    break;
    case 6:mon = "Jun"
    break;
    case 7:mon = "Jul"
    break;
    case 8:mon = "Aug"
    break;
    case 9:mon = "Sep"
    break;
    case 10:mon = "Oct"
    break;
    case 11:mon = "Nov"
    break;
    case 12:mon = "Dec"
    break;
  }
  
  let AmorPm = date.getHours()>12 ? "PM" : "AM"
  let hour12 = date.getHours()%12||12;
  Datte.innerHTML =` ${date.getDate()}, ${mon}. ${hour12}:${date.getMinutes().toString().padStart(2,"0")} ${AmorPm}`
}

SetDate(currentDate)

setInterval(()=>{
  SetDate(currentDate)
},1000)





   
const Cup1Pill = document.getElementById("Cup1Pill")
const Cup1PillName = document.getElementById("Cup1PillName")
const Cup1Remainder = document.getElementById("Cup1Remainder")
const Cup1Weight = document.getElementById("Cup1Weight")
const Cup1Time = document.getElementById("Cup1Time")
const Cup1  = document.getElementById("Cup-1")
const Cup1Button = document.getElementById("Cup1Button")

const Cup1Badge = document.getElementById("Cup1Badge")







const Cup2Pill = document.getElementById("Cup2Pill")






Cup1Pill.addEventListener('click',pillNameCup1)

Cup2Pill.addEventListener('click',pillNameCup2)


function Cup1Status(e)
{

    if(!cup1.Medication)
    {
        Cup1Badge.classList = ("text-bg-secondary rounded badge rounded-pill px-3 py-2 mb-3")
        Cup1Badge.innerHTML = 'Empty'
        Cup1PillName.innerHTML = '-'
        Cup1Remainder.innerHTML = '-'
        Cup1Weight.innerHTML = '-'
        Cup1Time.innerHTML = '-'

        Cup1Button.classList = ('btn btn-secondary')
        Cup1Button.innerHTML = "Assign medication"
    }
    else
    {
        
          Cup1Badge.classList = ("badge rounded-pill text-bg-success  px-3 py-2 mb-3")
            Cup1Badge.innerHTML = ' <i class="fa-solid fa-check me-1"></i>Occupied'
        Cup1PillName.innerHTML = cup1.Medication
        Cup1Remainder.innerHTML = cup1.pills
                Cup1Button.classList = ('btn btn-success')
        Cup1Button.innerHTML = "Configure"
        Cup1Time.innerHTML  = cup1.hours+':00 am'
        
    }
}

setInterval(()=>{
    Cup1Status()
},100)
















 function pillNameCup1() {
    let PillName = document.getElementById("Pill_name")
        update(ref(db, "schedule/cup1"), {
          Medication:PillName.value
        })
          .then((Status) => {
            alert("Pill assigned successfully",)
            
          })
          .catch((error) => {
            alert(error);
          });
      }
 function pillNameCup2() {
    let PillName = document.getElementById("Pill2name")
        update(ref(db, "schedule/cup2"), {
          Medication:PillName.value
        })
          .then((Status) => {
            alert("Pill assigned successfully")
             setTimeout(()=>{
                location.reload()
            })
          })
          .catch((error) => {
            alert(error);
          });
      }































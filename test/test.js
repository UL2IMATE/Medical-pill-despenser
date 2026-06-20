let api = "https://api.api-onepiece.com/v2/characters/en";

fetch(api)
  .then((test) =>{
    
    if(test.statusText ==="OK")
    {
     return test.json
    }
 
  })
  .then((test)=>{

  })
  .catch((test) => console.log("error"));

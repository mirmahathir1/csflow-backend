const axios = require('axios')


setInterval(()=>{
    axios.patch('https://csflow-backend.herokuapp.com/auth/password/forgot', {
        email: "1605001@ugrad.cse.buet.ac.bd"
    }).then((res) => {
        console.log(res.data);
    }).catch((e) => {
        console.log(e.response);
    })
},2000);

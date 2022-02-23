

fetch("https://morning-badlands-59571.herokuapp.com/publickey", {
    method: "GET"
}).then(data => data.json())
    .then(response => {
        localStorage.setItem('key', response.data)
        
    }
).catch(err => {
    console.log(err)
})
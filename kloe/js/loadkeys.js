

fetch("http://localhost:3333/publickey", {
    method: "GET"
}).then(data => data.json())
    .then(response => {
        localStorage.setItem('key', response.data)
        
    }
).catch(err => {
    console.log(err)
})
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hello toys')
})

app.listen(port, () => {
    console.log(`port is running on ${port}`)
})
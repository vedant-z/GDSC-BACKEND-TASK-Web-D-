const express = require('express');
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const path = require('path');
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb');
const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(methodOverride('_method'))
app.use(express.static('public'))

const URI = process.env.M_URI;

MongoClient.connect(URI, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('GDSC')
        const dataCollection = db.collection('DATA')

        app.get('/', (req, res) => {
            res.render('index');
        })

        app.post('/saveData', (req, res) => {
            dataCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        app.get('/showData', (req, res) => {
            dataCollection.find().toArray()
                .then(results => {
                    res.render('show', { DATA: results })
                })
                .catch(error => console.error(error))
        })

        app.get('/editData/:id', (req, res) => {
            const id = req.params.id;
            var o_id = new ObjectId(id);
            dataCollection.findOne({ _id: o_id })
                .then(result => {
                    res.render('edit', { DATA: result })
                })
                .catch(error => console.error(error))
        })

        app.put('/saveData/:id', (req, res) => {
            const id = req.params.id;
            var o_id = new ObjectId(id);
            dataCollection.findOneAndUpdate(
                { _id: o_id },
                {
                    $set: {
                        name: req.body.name,
                        roll_number: req.body.roll_number
                    }
                },
                {
                    upsert: false
                }
            )
                .then(result => {
                    res.redirect('/showData')
                })
                .catch(error => console.error(error))
        })

        app.delete('deleteData/:id', (req, res) => {
            const { id } = req.params.id;
            var o_id = new ObjectId(id);
            dataCollection.deleteOne(
                { _id: o_id }
            )
                .then(result => {
                    res.redirect('/showData')
                })
                .catch(error => console.error(error))
        })

        app.listen(3000, function () {
            console.log('listening on 3000')
        })
    })
    .catch(console.error)
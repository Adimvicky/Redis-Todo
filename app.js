const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      redis = require('redis'),
      client = redis.createClient();

const app = express();

// Redis Client

client.on('connect',() => {
    console.log('Redis Connected..');
});


// View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    var title = 'Redis Todo';

    client.lrange('todos',0,-1, (err, todos) => {
        if(err){
            res.send(err);
        }
        res.render('index',{
            title,
            todos
        });
    })
});

app.post('/todo/add', (req, res, next) => {
    var todo = req.body.todo;
    
    client.rpush('todos', todo, (err, reply) => {
        if(err){
            res.send(err);
        }

        console.log('Todo Added...');
        res.redirect('/');
    })
});

app.post('/todo/delete', (req, res, next) => {
    var delTodos = req.body.todos;

    client.lrange('todos', 0, -1, (err, todos) => {
        for(var i =0; i < todos.length; i++){
            if(delTodos.indexOf(todos[i]) > -1){
                client.lrem('todos', 0, todos[i], () => {
                    if(err){
                        res.send(err);
                    }

                })
            }
        }
        res.redirect('/');
        
    })
});



app.listen(3000, () => {
    console.log('App Running on port 3000');
});

module.exports = app;

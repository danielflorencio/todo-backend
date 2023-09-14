const express = require('express'); 
import { Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import cors from 'cors';
import { authenticateToken } from './authMiddleware';

const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.SERVER_PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/api/user/register', async (req: Request, res: Response) => {
  console.log('REQUEST BODY ON API/REGISTER: ', req.body)
  try{

    const existingUser = await prisma.users.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if(existingUser){
      return res.status(400).json({ message: "Email already in use." });
    } else{
      const user = await prisma.users.create({
        data: {
          email: req.body.email,
          firstname: req.body.firstName,
          lastname: req.body.lastName,
          password: req.body.password
        }
      }) 
      res.status(200).json({message: "user created successfully."})
    }
  }catch(error){
    console.error('Error creating user: ', error)
    res.status(500).json({message: "could not create the user."})
  }
})

type UpdateUserInput = {
  jwttoken: string;
};

app.post('/api/user/login', async (req: Request, res: Response) => {
  console.log('REQUEST BODY ON API/LOGIN: ', req.body)
  try{
    const user = await prisma.users.findUnique({
      where: { email: req.body.email, password: req.body.password },
    })
    if(user){      
      const token = jwt.sign({
        name: user.firstname,
        email: user.email
      },'secretPass')

      res.json({status: 'ok', token: token})
    }else {
      throw new Error;
    }
  } catch(Error){
    res.json({status: 'error', message: 'Could not login.'})
  }
})

interface CustomRequest extends Request {
  user?: any;
}

app.post('/api/todos/create', authenticateToken, async (req: CustomRequest, res: Response) => {
  try{
    const user = req.user;

    console.log('REQ.BODY.DESCRIPTION: ', req.body.description);

    const todo = await prisma.tasks.create({
      data: {
        description: req.body.description, 
        done: req.body.done,
        priority: req.body.priority,
        user_email: user.email
      }
    })
    res.json({status: 'ok', message: 'Todo created.', todo: todo})
  }catch(Error){
    console.error("Error while creating a todo: ", Error)
    res.json({status: 'error', message: 'Could not create the todo.'})
  }
  
})

app.get('/api/todos/getTodos', authenticateToken, async (req: CustomRequest, res: Response) => {
  try{
    const user = req.user;
    const todos = await prisma.tasks.findMany({
      where: { user_email: user.email }
    })
    res.json({status: 'ok', todos: todos})
  } catch(Error){
    console.error(Error);
    res.json({status: 'error', message: 'Could not get the todos.'})
  }
})

app.put('/api/todos/editTodo', authenticateToken, async (req: CustomRequest, res: Response) => {

  console.log('REQ.BODY ON EDIT TODO: ', req.body)

  try{
    const user = req.user;
    
    const editedTodoId = req.query.id;

    console.log('EDITEDTODOID: ', editedTodoId)

    const editedTodo = await prisma.tasks.update({
      where: { task_id: Number(editedTodoId), user_email: user.email}, 
      data: { description: req.body.description, done: req.body.done, priority: req.body.priority}
    })

    res.json({status: 'ok', message: 'Edit done successfully.', todo: editedTodo})
  } catch(Error){ 
    console.error(Error)
    res.json({status: 'error', message: "Could not edit the todo."})
  }
})

app.delete('/api/todos/delete', authenticateToken, async (req: CustomRequest, res: Response) => {
  try{
    const user = req.user;

    const deletedTaskId = req.query.id;

    const deletedTodo = await prisma.tasks.delete({
      where: { task_id: Number(deletedTaskId), user_email: user.email }
    })

    res.json({status: 'ok', message: 'Todo deleted successfully.'})
  } catch(Error){
    res.json({status: 'error', message: "Could not delete the todo."})
  }
})

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

export {}

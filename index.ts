
import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import cors from 'cors';
import { authenticateToken } from './src/authMiddleware';

const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.SERVER_PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/api/user/register', async (req: Request, res: Response) => {
  try{
    const user = await prisma.users.create({
      data: {
        email: req.body.email,
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        password: req.body.password
      }
    }) 
    res.status(200).send('OK');
  }catch(error){
    res.status(500).send({error: 'Could not create the user.'})
  }
})

type UpdateUserInput = {
  jwttoken: string;
};

app.post('/api/user/login', async (req: Request, res: Response) => {
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
    res.json({status: 'error', message: 'Could not create the todo.'})
  }
  
})

app.get('/api/todos/getTodos', authenticateToken, async (req: CustomRequest, res: Response) => {
  try{
    const user = req.user;
    const todos = await prisma.tasks.findMany({
      where: { user_email: user.email }
    })
    res.json({status: 'ok', data: todos})
  } catch(Error){
    console.error(Error);
    res.json({status: 'error', message: 'Could not get the todos.'})
  }
})

app.put('/api/todos/editTodo', authenticateToken, async (req: CustomRequest, res: Response) => {
  try{
    const user = req.user;
    
    const editedTodoId = req.query.id;

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

// https://dev.to/cristain/how-to-set-up-typescript-with-nodejs-and-express-2023-gf
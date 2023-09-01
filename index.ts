
import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import cors from 'cors';

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

app.post('api/user/login', async (req: Request, res: Response) => {
  
})

app.post('/api/todos/create', async (req: Request, res: Response) => {
  const todo = await prisma.tasks.create({
    data: {
      description: req.body.description, 
      done: req.body.done,
      priority: req.body.priority,
      user_email: req.body.user_email
    }
  })
})

app.get('api/todos/getTodos', async (req: Request, res: Response) => {

})

app.put('api/todos/editTodo', async (req: Request, res: Response) => {

})

app.delete('api/todos/delete', async (req: Request, res: Response) => {

})

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

// https://dev.to/cristain/how-to-set-up-typescript-with-nodejs-and-express-2023-gf
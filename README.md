**Project Titlte** : Chat App Backend
**Project Description** : Backend Code for **Chat App**
**Technologies Used** : MongoDB, Node js, Express js.
**Features** : Login, SignUp, JWT Authentication, 1 Vs 1 chat, Chatrooms, chatroom creation/join/Delete, Multisession, Display Online Users, Display User Typing, Message Read status, Message Delete, Real Live chat updation.
 
**How to Install and Run the Project**
step 1: Clone the project
step 2: cd <project_dir>
step 3: npm install
step 4: npm start

**Test Api on Postman**
Login: POST http://localhost:5000/chat_app/v1/auth/login
Signup: POST http://localhost:5000/chat_app/v1/auth/signup
Create_room : POST http://localhost:5000/chat_app/v1/chatroom/create_room
join_room : PATCH http://localhost:5000/chat_app/v1/chatroom/join_room/:chatroom_id
leave_room : PATCH http://localhost:5000/chat_app/v1/chatroom/leave_room/:chatroom_id
Chatroom_Send_message: POST http://localhost:5000/chat_app/v1/chatroom/send_message/:chatroom_id 
chatroom_get_allMessage: GET http://localhost:5000/chat_app/v1/chatroom/:chatroom_id 
chatroom_delete_MEssage: PATCH http://localhost:5000/chat_app/v1/chatroom/delete_message/:chatroom_id
1vs1 getallMessage: GET http://localhost:5000/chat_app/v1/auth/:user_id
1vs1 SendMessage: POST http://localhost:5000/chat_app/v1/auth/send_message/:user_id
1vs1 deleteMessage: DELETE http://localhost:5000/chat_app/v1/auth/delete_message

**Images of Route**
**Login** ![image](https://github.com/user-attachments/assets/a01d9689-0b03-469d-af49-1c59937e021b)
**Create_Room**: ![image](https://github.com/user-attachments/assets/49ced0a2-7721-44f2-9629-85dd53e799b3)
**Join Room**: ![image](https://github.com/user-attachments/assets/36c2017f-3b78-4bc2-b819-3a4ce07dd280)
**Get Chatroo Messages**: ![image](https://github.com/user-attachments/assets/465d7dec-c153-43fd-b9f0-cac311439b3a)
**Send chatroom Message**: ![image](https://github.com/user-attachments/assets/cd88c5e0-4360-40c9-ba32-d6b3ea15d237)
**GET 1vs1 Message**: ![image](https://github.com/user-attachments/assets/e764290c-24d4-4614-b71e-ec91a3fcfd2c)
**send 1vs1 Message**: ![image](https://github.com/user-attachments/assets/b931c877-a218-4a3d-9800-7748ee151f4d)

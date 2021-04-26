const users=[2];

function Userjoin(id,username,room,player){
    const existingUser=users.find((user)=>user.username===username&&user.room===room);

    // if(existingUser){
    //     return;
    // }
    const user={id,username,room,player}
     users.push(user)
    console.log(users);
    if(user!==null)
    return user
    return null;
}

const removeUser=(id)=>{
    const index = users.findIndex((user)=>user.id===id)

    if(index!==-1){
       return users.splice(index, 1)[0];
    }
}

function getUser(id){
    return users.find(user=>user.id===id);
}

function getUsersInroom(room){
    return users.filter(user=>user.room===room)
}

function getUserByColor(player){
    return users.find(user=>user.player===player)
}

module.exports={
    Userjoin,
    removeUser,
    getUser,
    getUsersInroom,
    getUserByColor
}
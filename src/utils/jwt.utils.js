import jwt from 'jsonwebtoken';


export const generateToken = (id, isAdmin = false) =>{
    return jwt.sign({id, role: isAdmin ? 'admin' : 'user'},
        process.env.JWT_SECRET, {expiresIn: '24h'});
}

export const verifyToken = (token) =>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        throw new Error(err.message);
    }
}
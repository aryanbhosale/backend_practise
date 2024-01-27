const jwt =require("jsonwebtoken");

module.exports = (req, res, next) => { 
    try {
        const token = req.headers.authorization.split(" ")[1]; //in order to spearate Bearer {token}, we split the string at the space and consider the 2nd element which is the token
        console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_KEY) // changed req.body.token to token
        req.userData = decoded;  
        
        next(); 
    } catch(err) {
        return res.status(401).json({ message: "Authentication failed." })
    }
}
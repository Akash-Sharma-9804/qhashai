 

// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         console.log("🔍 Auth check for:", req.method, req.path);
//         console.log("🔍 Received Auth Header:", authHeader ? "Bearer token present" : "No auth header");

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             console.error("❌ No valid authorization header");
//             return res.status(401).json({ error: "Unauthorized: No token provided" });
//         }

//         const token = authHeader.split(" ")[1];
        
//         if (!token) {
//             console.error("❌ Token missing from header");
//             return res.status(401).json({ error: "Unauthorized: Token missing" });
//         }

//         // Verify the token
//         jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 console.error("❌ Token verification failed:", err.message);
//                 return res.status(401).json({ error: "Unauthorized: Invalid token" });
//             }

//             // ✅ STRICT USER VALIDATION
//             if (!decoded.user_id || isNaN(decoded.user_id)) {
//                 console.error("❌ Invalid user_id in token:", decoded);
//                 return res.status(401).json({ error: "Unauthorized: Invalid user data" });
//             }

//             console.log("✅ Verified User ID:", decoded.user_id);
//             req.user = decoded;
//             next();
//         });
//     } catch (error) {
//         console.error("❌ Error in auth middleware:", error.message);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// module.exports = verifyToken;

 


 

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("🔍 Auth check for:", req.method, req.path);
        console.log("🔍 Received Auth Header:", authHeader ? "Bearer token present" : "No auth header");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("❌ No valid authorization header");
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];
        
        if (!token) {
            console.error("❌ Token missing from header");
            return res.status(401).json({ error: "Unauthorized: Token missing" });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("❌ Token verification failed:", err.message);
                
                // Check if token is expired specifically
                if (err.name === 'TokenExpiredError') {
                    console.log("🔄 Token expired, redirecting to homepage");
                    // Redirect to frontend homepage for expired tokens
                    return res.redirect(`${process.env.CLIENT_URL || 'https://qhashai.com'}`);
                }
                
                return res.status(401).json({ error: "Unauthorized: Invalid token" });
            }

            // ✅ STRICT USER VALIDATION
            if (!decoded.user_id || isNaN(decoded.user_id)) {
                console.error("❌ Invalid user_id in token:", decoded);
                return res.status(401).json({ error: "Unauthorized: Invalid user data" });
            }

            console.log("✅ Verified User ID:", decoded.user_id);
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error("❌ Error in auth middleware:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = verifyToken;


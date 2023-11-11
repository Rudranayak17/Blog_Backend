const sendToken = (user, statusCode=200, res) => {
    const token = user.getJWTToken();

    // Options for the Cookie
    const options = {
        maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Expiration time in milliseconds
        sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None", // Use "Lax" or "None"
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"?true:false, // Enable secure in production
    };

    res
        .status(statusCode)
        .cookie("token", token, options) // Set the "token" cookie with the provided token and options
        .json({
            success: true,
            user,
            token,
        });
};

export default sendToken;

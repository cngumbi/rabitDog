const User = require('../models/userModel');

const logActivity = async (userId, action, description) => {
    try{
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    activityLog: {
                        action,
                        description
                    }
                }
            }
        );
    }catch(error){
        console.error('Error logging activity:', error);
        return;
    }
}

module.exports = logActivity;
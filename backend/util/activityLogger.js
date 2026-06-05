const User = require('../models/userModel');

const logActivity = async (userId, action, description) => {
    try{
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    activityLog: {
                        $each: [{
                            action,
                            description,
                            createdAt: new Date(),
                        }],
                        $position: 0,
                        $slice: 50,
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
const Users = require('../models/userModel')
const Conversations = require('../models/conversationModel')
const Messages = require('../models/messageModel')

const userCtrl = {
    blockUser: async(req,res) =>{
        // delete all the messages between user1 and user2 (Already handled)
        try{
        
        // user1 -> user2
        //remove user2 from user1's following
        
        
        
        const us1 =  await Users.findOneAndUpdate({_id: req.params.id}, { 
            $pull: {followers: req.user._id}
        }, {new: true})

        // console.log(us)

        await Users.findOneAndUpdate({_id: req.params.id}, { 
            $pull: {following: req.user._id}
        }, {new: true})

        const user2 = await Users.findOneAndUpdate({_id: req.user._id}, {
            $pull: {following: req.params.id}
        }, {new: true})
        console.log(user2)
       
        await Users.findOneAndUpdate({_id: req.user._id}, {
            $pull: {followers: req.params.id}
        }, {new: true})

        // user2 -> user1
        //remove user1 from user2's following
        // add to block list
        await Users.findOneAndUpdate({_id: req.user._id}, {
            $push: {blockList: req.params.id}
        }, {new: true})

        const us = await Users.findOneAndUpdate({_id: req.params.id}, {
            $push: {blockList: req.user._id}
        }, {new: true}).populate('blockList')
        
        await Users.findById({_id:req.user._id}).populate('blockList')

        res.json({us})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({msg: err.message})
        }
    },
    unblockUser: async(req,res) =>{
        // delete all the messages between user1 and user2 (Already handled)
        try{
        
        // user1 -> user2
        //remove user2 from user1's following
        
        
        
        // const us =  await Users.findOneAndUpdate({_id: req.params.id}, { 
        //     $pull: {followers: req.user._id}
        // }, {new: true})

        // console.log(us)

        // await Users.findOneAndUpdate({_id: req.params.id}, { 
        //     $pull: {following: req.user._id}
        // }, {new: true})

        // const user2 = await Users.findOneAndUpdate({_id: req.user._id}, {
        //     $pull: {following: req.params.id}
        // }, {new: true})
        // console.log(user2)
       
        // await Users.findOneAndUpdate({_id: req.user._id}, {
        //     $pull: {followers: req.params.id}
        // }, {new: true})

        // user2 -> user1
        //remove user1 from user2's following
        // add to block list
        await Users.findOneAndUpdate({_id: req.user._id}, {
            $pull: {blockList: req.params.id}
        }, {new: true})

        const user = await Users.findOneAndUpdate({_id: req.params.id}, {
            $pull: {blockList: req.user._id}
        }, {new: true}).populate('blockList')
        await Users.findById({_id:req.user._id}).populate('blockList')
        res.json({user})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({msg: err.message})
        }
    },
    searchUser: async (req, res) => {
        try {
            // to do: filter out the blocked users i.e remove all the blocked users from users
            const users = await Users.find({username: {$regex: req.query.username}})
            .limit(10).select("fullname username avatar blockList")
            await Users.findById({_id:req.user._id}).populate('blockList')
            res.json({users})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id).select('-password')
            .populate("followers following blockList", "-password")
            if(!user) return res.status(400).json({msg: "User does not exist."})
            await Users.findById({_id:req.user._id}).populate('blockList')
            res.json({user})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const { avatar, fullname, mobile, address, story, website, gender } = req.body
            if(!fullname) return res.status(400).json({msg: "Please add your full name."})

            await Users.findOneAndUpdate({_id: req.user._id}, {
                avatar, fullname, mobile, address, story, website, gender
            })
            await Users.findById({_id:req.user._id}).populate('blockList')
            res.json({msg: "Update Success!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    follow: async (req, res) => {
        try {
            const user = await Users.find({_id: req.params.id, followers: req.user._id})
            if(user.length > 0) return res.status(500).json({msg: "You followed this user."})

            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $push: {followers: req.user._id}
            }, {new: true}).populate("followers following blockList", "-password")
            console.log(req.user)
            await Users.findOneAndUpdate({_id: req.user._id}, {
                $push: {following: req.params.id}
            }, {new: true})
            await Users.findById({_id:req.user._id}).populate('blockList')
            res.json({newUser})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unfollow: async (req, res) => {
        try {

            const newUser = await Users.findOneAndUpdate({_id: req.params.id}, { 
                $pull: {followers: req.user._id}
            }, {new: true}).populate("followers following blockList", "-password")

            await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {following: req.params.id}
            }, {new: true})
            await Users.findById({_id:req.user._id}).populate('blockList')
            res.json({newUser})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    suggestionsUser: async (req, res) => {
        try {
            const newArr = [...req.user.following, req.user._id]

            const num  = req.query.num || 10

            const users = await Users.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
                { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
                { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
            ]).project("-password")
            await Users.findById({_id:req.user._id}).populate('blockList')
            return res.json({
                users,
                result: users.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}


module.exports = userCtrl
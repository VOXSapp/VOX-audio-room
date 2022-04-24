import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { block, unblock } from '../redux/actions/profileAction'

const BlockBtn = ({user}) => {
    const [blocked, setBlocked] = useState(false)

    const { auth, profile, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [load, setLoad] = useState(false)

    useEffect(() => {
        if(auth.user.blockList.find(item => item._id === user._id)){
            setBlocked(true)
        }
        return () => setBlocked(false)
    }, [auth.user.blockList, user._id])

    const handleBlock =  async () => {
        if(load) return;

        setBlocked(true)
        setLoad(true)
        await dispatch(block({users: profile.users, user, auth, socket}))
        setLoad(false)
    }

    const handleUnBlock = async () => {
        if(load) return;

        setBlocked(false)
        setLoad(true)
        await dispatch(unblock({users: auth.user.blockList, user, auth, socket}))
        setLoad(false)
    }

    return (
        <>
        {
            blocked
            ? <button className="btn btn-outline-danger"
            onClick={handleUnBlock}>
                UnBlock
            </button>
            : <button className="btn btn-outline-info"
            onClick={handleBlock}>
                Block
            </button>
        }
        </>
    )
}

export default BlockBtn

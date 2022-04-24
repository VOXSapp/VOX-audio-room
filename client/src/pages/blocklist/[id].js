//blockAction , blockReducer

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import UserCard from '../../components/UserCard'
import BlockBtn from '../../components/BlockBtn'
import LoadIcon from '../../images/loading.gif'
import { getBlockedUsers } from '../../redux/actions/profileAction'

const BlockList = () => {
    const { auth, blockedUsers } = useSelector(state => state)
    const dispatch = useDispatch()
    console.log(blockedUsers)
    return (
        <div className="mt-3">
            <UserCard user={auth.user} />

            <div className="d-flex justify-content-between align-items-center my-2">
                <h5 className="text-danger">Blocked Users</h5>
                {
                    
                    <i className="fas fa-redo" style={{cursor: 'pointer'}}
                    onClick={ () => dispatch(getBlockedUsers(auth.token)) } />
                }
            </div>

            {
                
                    
                    
                    <div className="suggestions">
                    {
                        // console.log(blockedUsers)
                        auth.user.blockList.map(user => (
                            <UserCard key={user._id} user={user} >
                                <BlockBtn user={user} />
                            </UserCard>
                        ))
                    }
                </div>
            }

           

        </div>
    )
}

export default BlockList


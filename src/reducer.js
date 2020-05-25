export default function reducer(state = {}, action) {
    //3 different approaches for the first 3 reducers
    if (action.type === "GET_FRIENDS_WANNABES") {
        state = Object.assign({}, state, {
            friendsWannabes: action.friendsWannabes,
        });
    }

    if (action.type === "ACCEPT_FRIEND_REQUEST") {
        let friendsWannabes = state.friendsWannabes.map((x) => {
            if (x.id == action.newFriendId) {
                x.accepted = true;
                return x;
            } else {
                return x;
            }
        });

        return {
            ...state,
            friendsWannabes,
        };
    }

    if (action.type === "UNFRIEND") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter(
                (user) => user.id != action.unfriendId
            ),
        };
    }

    ////------------------------ public chat ----------------------- //
    if (action.type === "GET_LAST10_MESSAGES") {
        state = {
            ...state,
            chatMessages: action.msgs,
        };
    }
    if (action.type === "NEW_MESSAGE") {
        state = {
            ...state,
            chatMessages: [...state.chatMessages, action.msg[0]],
        };
    }

    ////------------------------ private chat ----------------------- //
    if (action.type === "GET_PRIVCHAT_LIST") {
        state = {
            ...state,
            privchats: action.privchats,
        };
    }
    if (action.type === "NO_PRIV_CHATS") {
        //just do nothing, idk
    }
    if (action.type === "CLEAR_CHAT_MSGS") {
        state = {
            ...state,
            chatMessages: action.msgs,
        };
    }
    if (action.type === "GET_LAST_PRIV_MESSAGES") {
        state = {
            ...state,
            privChatMessages: action.msgs,
        };
    }
    if (action.type === "NEW_PRIV_MESSAGE_CHECK") {
        state = {
            ...state,
            newPrivMsg: [action.msg[0]],
        };
    }
    if (action.type === "NEW_PRIV_MESSAGE") {
        state = {
            ...state,
            privChatMessages: [...state.privChatMessages, action.msg[0]],
        };
    }
    if (action.type === "PRIV_MSG_ALERT") {
        // console.log("We're in PRIV_MSG_ALERT reducer");

        state = {
            ...state,
            newMsgFrom: action.senderId,
        };
    }
    if (action.type === "STORE_MY_ID") {
        state = {
            ...state,
            myId: action.myId,
        };
    }

    if (action.type === "STORE_MY_ID_AND_SOCKET") {
        console.log("reducer.js STORE_MY_ID_AND_SOCKET: ", action.idAndSocket);
        // console.log("state.socketIds: ", state.socketIds);
        // console.log("state: ", state);

        if (!state.socketIds) {
            console.log("reducer.js no state yet");
            state = {
                ...state,
                socketIds: [action.idAndSocket],
                newLogin: [action.idAndSocket],
            };
        } else {
            // console.log("state.socketIds: ", state.socketIds);

            const findInd = (arr, prop, val) => {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i][prop] === val) {
                        return i;
                    }
                }
            };

            const ind = findInd(state.socketIds, "id", action.idAndSocket.id);
            console.log("ind: ", ind);

            if (ind) {
                //potentially refactor this. I don't think the map is necessary anymore, since we have the index now
                state.socketIds[ind].socket.unshift(
                    action.idAndSocket.socket[0]
                );

                state = {
                    ...state,
                    socketIds,
                    newLogin: [action.idAndSocket],
                };
            } else {
                state = {
                    ...state,
                    socketIds: [...state.socketIds, action.idAndSocket],
                    newLogin: [action.idAndSocket],
                };
            }
        }
    }

    if (action.type === "STORE_OTHER_ID_AND_SOCKET") {
        // console.log("reducer.js store othIS: ", action.idAndSocket);

        state = {
            ...state,
            socketIds: [...state.socketIds, action.idAndSocket],
        };
    }

    return state;
}

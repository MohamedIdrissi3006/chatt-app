import React from 'react'
import { ChatState } from "../Context/ChatProvider";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/react";
import "./style.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "lottie-react";
import animationData from "../animations/typing.json";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";


import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();
    const toast = useToast();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);


    // const defaultOptions = {
    //     loop: true,
    //     autoplay: true,
    //     animationData: animationData,
    //     rendererSettings: {
    //         preserveAspectRatio: "xMidYMid slice",
    //     },
    // };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);







    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "https://chatt-app-theta.vercel.app/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                // console.log(selectedChat)
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            };
        }
    }


    const fetchMessages = async () => {
        if (!selectedChat) return;
        // console.log(selectedChat)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);
            console.log(selectedChat._id)
            const { data } = await axios.get(
                `https://chatt-app-theta.vercel.app/api/message/${selectedChat._id}`,
                config
            );

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);

   



    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                // if (!notification.includes(newMessageRecieved)) {
                //     setNotification([newMessageRecieved, ...notification]);
                //     setFetchAgain(!fetchAgain);
                // }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };


     useEffect(() => {
        console.log(istyping);
    }, [istyping]);
    return (
        <>
            {selectedChat ? (
                <>
                    <Box
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        bg="white"
                        w="100%"
                        p="5px 10px"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Flex justifyContent="space-between" alignItems="center">
                            <IconButton
                                d={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />
                            {/* {messages && */}
                            {(!selectedChat.isGroupChat ? (
                                <>
                                    <div textAlign="center">
                                        {getSender(user, selectedChat.users)}
                                    </div>
                                    <ProfileModal
                                        user={getSenderFull(user, selectedChat.users)}

                                    />


                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))}
                        </Flex>
                    </Box>
                    <Box
                        // 
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        // bg="yellow"
                        w="100%"
                        h="90%"
                        // borderRadius="lg"
                        overflowY="hidden"
                        position="relative"
                    >
                        <div style={{
                            position: "absolute",
                            bottom: "0",
                            // border: "1px solid #0a944f",
                            width: "100%", // Set the width to 100%
                            boxSizing: "border-box", // Ensure border is included in the width
                            height: "100%",
                            display: "flex", // Use flexbox to position elements inside
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            // display: "grid",
                            // gridTemplateRows: "1fr auto",
                        }}>


                            <div style={{ position: "relative", paddingBottom: "5%" }}>
                                {loading ? (
                                    <Spinner
                                        size="xl"
                                        w={20}
                                        h={20}
                                        alignSelf="center"
                                        margin="auto"
                                    />
                                ) : (
                                    <div className="messages" bg="black" >


                                        <ScrollableChat messages={messages} />

                                    </div>
                                )}
                            </div>

                            <div>
                                <FormControl
                                    onKeyDown={sendMessage}
                                    id="first-name"
                                    isRequired
                                    mt={3}
                                    
                                >

                                    {istyping ? (
                                       <div 
                                       style={{ width: '0px', height: '0px' }}>
                                       {/* <Lottie animationData={animationData} loop={true} /> */}
                                     </div>
                                    ) : (
                                        <></>
                                    )}
                                    <Input
                                        style={{
                                            position: "absolute",
                                            bottom: "0"
                                        }}
                                        variant="filled"
                                        bg="#E0E0E0"
                                        placeholder="Enter a message.."
                                        value={newMessage}
                                        onChange={typingHandler}

                                    />

                                </FormControl>
                            </div>
                        </div>

                    </Box>
                </>
            ) : (
                // to get socket.io on same page
                <Box d="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>

                </Box>
            )}
        </>
    )
}

export default SingleChat

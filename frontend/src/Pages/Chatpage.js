import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";




const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();


  return (

    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <div style={{ width: "100%" }}>
         
        <Box d="flex" flexDirection="column" alignItems="flex-end" w="100%" h="91.5vh" p="5px">
        <div style={{  float: "left", width: "30%" ,padding: "4px", height: "100%"}}>
          {user && <MyChats fetchAgain={fetchAgain}    />}
           </div> 
          <div style={{  float: "right", width: "70%" ,padding: "4px", height: "100%"}}>
          {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
          </div> 
        </Box>
      </div>
    </div>
  )
}

export default Chatpage;

import {
  MessageThread,
  ChatMessage,
  SendBox,
  MessageStatus,
  MessageContentType,
  SystemMessage,
  MessageAttachedStatus,
} from "@azure/communication-react";
import React, { useEffect, useRef, useState } from "react";
import SendMessage from "../helper/SendMessageGraphApi";
import { useMsal } from "@azure/msal-react";
import {
  AccountInfo,
  InteractionRequiredAuthError,
  SilentRequest,
} from "@azure/msal-browser";
import { useParams } from "react-router-dom";
import { loginRequest } from "../authConfig";
import MembersScreen from "./AddUserScreen";
import {
  initializeIcons,
  IconButton,
  Persona,
  PersonaPresence,
  PersonaSize,
} from "@fluentui/react";
import { SendMessageNotification } from "../helper/Xrm/NotificationXrmApi";
import DeleteMessage from "../helper/DeleteMessageGraphApi";
import UpdateMessage from "../helper/UpdateMessageGraphApi";
import GetAvatarUrl from "../helper/AvatarImageUrlGeaphApi";
import FetchParticipants from "../helper/FetchParticipants";
import GetUserName from "../helper/GetUserName";
initializeIcons();

interface ChatComponentProps {
  chatthreadid: string;
  communicationactivityid: string;
  accesstokenarg: string;
  goback: () => void;
}

export const ChatComponents = ({
  chatthreadid,
  communicationactivityid,
  accesstokenarg,
  goback,
}: ChatComponentProps): JSX.Element => {
  //A sample chat history
  // const { chatThreadId } = useParams<{chatThreadId: string}>();
  console.log("chatThreadId inside ChatComponent: ", chatthreadid);

  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  console.log("activeAccount inside chatComponent --> ", activeAccount);

  // const silentReq: SilentRequest = {
  //   account: activeAccount as AccountInfo | undefined,
  //   scopes: ['https://graph.microsoft.com/.default'],
  // };

  const [messages, setMessages] = useState<(ChatMessage | SystemMessage)[]>([]);
  const [showMembersComponent, setShowMembersComponent] = useState(false);
  const [imageUrlObject, setImageUrlObject] = useState<{ [key: string]: any }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [accessTokenState, setAccessTokenState] = useState("");
  const [numberOfMessages, setNumberOfMessages] = useState(30);
  const [odataNextLink, setODataNextLink] = useState("");
  const sentinelRef = useRef(null);

  const convToMessageArray = (messageResponse: any[]) => {
    messageResponse.forEach((message) => {
      if (message.messageType === "message") {
      }
    });
  };

  const covertToMessageArray = async (messageResponse: any[]): Promise<(ChatMessage | SystemMessage)[]> => {
    const messagesArray = await Promise.all(messageResponse.map(async (message) => {
      if (message.eventDetail === null) {
        return {
          messageType: "chat",
          contentType: message.body.contentType as MessageContentType,
          senderId: message.from != null ? message.from.user.id : "",
          senderDisplayName:
            message.from != null ? message.from.user.displayName : "",
          messageId: message.id,
          content: message.body.content,
          createdOn: new Date(message.createdDateTime),
          mine:
            message.from != null
              ? message.from.user.id == activeAccount?.idTokenClaims?.oid
              : false,
          attached: message.attachments.length > 0,
          status: "delivered" as MessageStatus,
        } as ChatMessage;
      } 
      else if (message.eventDetail !== null) {
        if(message.eventDetail["@odata.type"] === "#microsoft.graph.membersAddedEventMessageDetail"){
          const initiatorDisplayName = await GetUserName(message.eventDetail.initiator.user.id, accesstokenarg);
          for(let i=0; i<message.eventDetail.members.length; i++){
            if(message.eventDetail.initiator.user.id !== message.eventDetail.members[i].id){
              const memberDisplayName = await GetUserName(message.eventDetail.members[i].id, accesstokenarg);
              return {
                messageType: "system",
                createdOn: new Date(message.createdDateTime),
                systemMessageType: "content",
                messageId: message.id,
                iconName: "PeopleAdd",
                content: `${initiatorDisplayName} added ${memberDisplayName} to the chat`,
              } as SystemMessage;
            }
          }
          return {
            messageType: "system",
            createdOn: new Date(message.createdDateTime),
            systemMessageType: "content",
            messageId: message.id,
            iconName: "OtherIcon",
            content: "~ unsupported system message ~",
          } as SystemMessage;
        }
        else if(message.eventDetail["@odata.type"] === "#microsoft.graph.membersDeletedEventMessageDetail"){
          const initiatorDisplayName = await GetUserName(message.eventDetail.initiator.user.id, accesstokenarg);
          const memberDisplayName = await GetUserName(message.eventDetail.members[0].id, accesstokenarg);
          return {
            messageType: "system",
            createdOn: new Date(message.createdDateTime),
            systemMessageType: "content",
            messageId: message.id,
            iconName: message.eventDetail.initiator.user.id === message.eventDetail.members[0].id ? "Leave": "UserRemove",
            content: message.eventDetail.initiator.user.id === message.eventDetail.members[0].id ? `${initiatorDisplayName} left the chat` :`${initiatorDisplayName} removed ${memberDisplayName} from the chat`,
          } as SystemMessage;
        }
        
        else if(message.eventDetail["@odata.type"] === "#microsoft.graph.chatRenamedEventMessageDetail"){
          const initiatorDisplayName = await GetUserName(message.eventDetail.initiator.user.id, accesstokenarg);
          // const memberDisplayName = await GetUserName(message.eventDetail.members[0].id, accesstokenarg);
          return {
            messageType: "system",
            createdOn: new Date(message.createdDateTime),
            systemMessageType: "content",
            messageId: message.id,
            iconName: "Edit",
            content: `${initiatorDisplayName} changed the group name to ${message.eventDetail.chatDisplayName}`,
          } as SystemMessage;
        }
        else{
          return {
            messageType: "system",
            createdOn: new Date(message.createdDateTime),
            systemMessageType: "content",
            messageId: message.id,
            iconName: "OtherIcon",
            content: "~ unsupported system message ~",
          } as SystemMessage;
        }
      }
      else {
        return {
          messageType: "system",
          createdOn: new Date(message.createdDateTime),
          systemMessageType: "content",
          messageId: message.id,
          iconName: "OtherIcon",
          content: "~ unsupported system message ~",
        } as SystemMessage;
      }
    }));
    return messagesArray;
  };
  

  const covertToMessageObjectArray = (messageResponse: any[]): ChatMessage[] =>
    messageResponse
      .filter(
        (message) =>
          message.messageType === "message" && message.body.content !== ""
      )
      .map((message) => ({
        messageType: "chat",
        contentType: message.body.contentType as MessageContentType,
        senderId: message.from != null ? message.from.user.id : "",
        senderDisplayName:
          message.from != null ? message.from.user.displayName : "",
        messageId: message.id,
        content: message.body.content,
        createdOn: new Date(message.createdDateTime),
        mine:
          message.from != null
            ? message.from.user.id == activeAccount?.idTokenClaims?.oid
            : false,
        attached: message.attachments.length > 0,
        status: "seen" as MessageStatus,
      }));

  const fetchAvatar = async () => {
    const imageObject: { [key: string]: any } = {};
    const members = await FetchParticipants(chatthreadid);
    console.log("ChatComponent members --> ", members);
    for (let i = 0; i < members.length; i++) {
      const userId = members[i].userId;
      const imageUrl = await GetAvatarUrl(userId, accesstokenarg);
      const displayName = members[i].displayName;
      console.log("ChatComponent displayName --> ", displayName);
      console.log("ChatComponent image --> ", imageUrl);
      imageObject[userId] = { imageUrl, displayName };
    }
    console.log("imageObject -->", imageObject);
    setImageUrlObject(imageObject);
  };

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        console.log(
          "Sessison storage chatthreadid: ",
          sessionStorage.getItem("chatthreadid")
        );
        const endpoint =
          `https://graph.microsoft.com/v1.0/chats/` +
          sessionStorage.getItem("chatthreadid") +
          `/messages`;
        // const accessToken = await instance.acquireTokenSilent(silentReq);
        // setAccessTokenState(accessToken.accessToken);
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + accesstokenarg,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const responseJson = await response.json();
        console.log("response --> ", responseJson);
        const messageThread = await covertToMessageArray(responseJson.value);
        console.log(
          "messageThread from covertToMessageArray --> ",
          messageThread
        );
        messageThread.sort(
          (a, b) => a.createdOn.getTime() - b.createdOn.getTime()
        );
        console.log("messageThread --> ", messageThread);
        setMessages(messageThread);
        if (responseJson.hasOwnProperty("@odata.nextLink")) {
          setODataNextLink(responseJson["@odata.nextLink"]);
        } else {
          setODataNextLink("");
        }
        console.log("@odata.nextLink -->", responseJson["@odata.nextLink"]);
        setLoading(false);
        console.log("messages in useEffect --> ", messages);
      } catch (error) {
        console.log("Autherror: ", error);
      }
    };
    fetchChatMessages();
    fetchAvatar();

    const messageInterval = setInterval(() => {
      fetchChatMessages();
    }, 2000);

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  // const [messages, setMessages] = useState<ChatMessage[]>([
  //   {
  //     messageType: "chat",
  //     contentType: "text" as MessageContentType,
  //     senderId: "1",
  //     senderDisplayName: "Mo Ali",
  //     messageId: Math.random().toString(),
  //     content: "Hi everyone, I created this awesome group chat for us!",
  //     createdOn: new Date("2019-04-13T00:00:00.000+08:10"),
  //     mine: false,
  //     attached: false,
  //     status: "seen" as MessageStatus,
  //   },
  //   {
  //     messageType: "chat",
  //     senderId: "user8",
  //     content:
  //       '<p>A message with pictures</p><p><img alt="image" src="https://images.unsplash.com/photo-1695754188846-a4a384566dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80" itemscope="png" width="166.5625" height="250" id="SomeImageId1" style="vertical-align:bottom"></p><p><img alt="image" src="https://images.unsplash.com/photo-1696227257464-a37a46c9975d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" itemscope="png" width="374.53183520599254" height="250" id="SomeImageId2" style="vertical-align:bottom"></p><p>&nbsp;</p>',
  //     senderDisplayName: "Miguel Garcia",
  //     messageId: Math.random().toString(),
  //     createdOn: new Date("2019-04-13T00:00:00.000+08:09"),
  //     mine: false,
  //     attached: false,
  //     contentType: "html",
  //     //,
  //     // attachedFilesMetadata: [
  //     //   {
  //     //     id: 'SomeImageId1',
  //     //     name: 'SomeImageId1',
  //     //     attachmentType: 'inlineImage',
  //     //     extension: 'png',
  //     //     url: 'images/inlineImageExample1.png',
  //     //     previewUrl: 'images/inlineImageExample1.png'
  //     //   },
  //     //   {
  //     //     id: 'SomeImageId2',
  //     //     name: 'SomeImageId2',
  //     //     attachmentType: 'inlineImage',
  //     //     extension: 'png',
  //     //     url: 'images/inlineImageExample2.png',
  //     //     previewUrl: 'images/inlineImageExample2.png'
  //     //   }
  //     // ]
  //   },
  // ]);

  // const GetHistoryChatMessages = (): ChatMessage[] => {
  //   return messages;
  // };

  // async function GetSubject(){
  //   const result = await Xrm.WebApi.retrieveMultipleRecords("mzk_communication", "?$select=subject&$filter=mzk_chatthreadid eq " + chatthreadid);
  //   console.log("GetSubject result.entities[0].subject --> ", result.entities[0].subject);
  //   return result.entities[0].subject;
  // }

  return (
    <div style={{ bottom: 0, width: "100%" }}>
      {/* Chat thread component with message status indicator feature enabled */}
      {/* <button onClick={goback}>Go back</button> */}
      <IconButton onClick={goback} iconProps={{ iconName: "ChevronLeftMed" }} />
      {/* <IconButton onClick={() => setShowMembersComponent(!showMembersComponent)} iconProps={{ iconName: "People" }} /> */}
      {/* <h2>{GetSubject()}</h2> */}
      {!showMembersComponent ? (
        <div>
          <MessageThread
            userId={activeAccount?.idTokenClaims?.oid || "1"}
            messages={messages}
            showMessageStatus={true}
            onDeleteMessage={(messageid) =>
              DeleteMessage(
                messageid,
                chatthreadid,
                activeAccount?.localAccountId,
                accesstokenarg
              )
            }
            onUpdateMessage={async (messageid, content) => {
              await UpdateMessage(
                messageid,
                content,
                chatthreadid,
                accesstokenarg
              );
            }}
            onRenderAvatar={(userId?: string) => {
              const userData = imageUrlObject[userId || ""];
              const imageUrl = userData?.imageUrl || "";
              const displayName = userData?.displayName || "";

              return (
                <Persona
                  size={PersonaSize.size32}
                  hidePersonaDetails
                  presence={PersonaPresence.none}
                  text={displayName}
                  imageUrl={imageUrl}
                  showOverflowTooltip={false}
                />
              );
            }}
          />
          <SendBox
            disabled={false}
            onSendMessage={async (text) => {
              var currentUserId = activeAccount?.localAccountId;
              var currentUserName = activeAccount?.name;

              const currentMessageObject: ChatMessage = {
                messageType: "chat",
                contentType: "text" as MessageContentType,
                senderId: currentUserId,
                senderDisplayName: currentUserName,
                messageId: Math.random().toString(),
                content: text,
                createdOn: new Date(),
                mine: true,
                attached: false,
                status: "delivered" as MessageStatus,
              };
              var sendMessageEndpoint =
                "https://graph.microsoft.com/v1.0/chats/" +
                sessionStorage.getItem("chatthreadid") +
                "/messages";
              SendMessage(sendMessageEndpoint, text, accesstokenarg);
              SendMessageNotification(
                sessionStorage.getItem("chatthreadid"),
                text,
                communicationactivityid
              );
              setMessages((messages) => [...messages, currentMessageObject]);
              return;
            }}
            onTyping={async () => {
              return;
            }}
          />
        </div>
      ) : (
        <div>
          <MembersScreen
            chatthreadid={chatthreadid}
            accesstokenarg={accesstokenarg}
          />
        </div>
      )}
    </div>
  );
};
